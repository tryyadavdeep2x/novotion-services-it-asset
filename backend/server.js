import express from 'express';
import cors from 'cors';
import { dbAll, dbRun, dbGet, hashPassword } from './database.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    // Check if username or email already exists
    const existingUser = await dbGet('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
    if (existingUser) {
      return res.status(450).json({ error: 'Username or email is already registered' });
    }

    const passwordHash = hashPassword(password);
    const result = await dbRun(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    // Write audit log
    const logDetails = `User account registered: ${username} (${email})`;
    await dbRun('INSERT INTO logs (asset_id, action, details) VALUES (?, ?, ?)', [null, 'Create', logDetails]);

    res.status(201).json({ id: result.id, username, email });
  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Username or email and password are required' });
  }

  try {
    const user = await dbGet(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [usernameOrEmail, usernameOrEmail]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    const inputHash = hashPassword(password);
    if (user.password_hash !== inputHash) {
      return res.status(401).json({ error: 'Invalid username/email or password' });
    }

    // Write audit log
    const logDetails = `User logged in: ${user.username} (${user.email})`;
    await dbRun('INSERT INTO logs (asset_id, action, details) VALUES (?, ?, ?)', [null, 'Update', logDetails]);

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      created_at: user.created_at
    });
  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// GET all support tickets
app.get('/api/tickets', async (req, res) => {
  const userRole = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  try {
    let query = 'SELECT * FROM tickets';
    const params = [];

    if (userRole === 'it' && userEmail) {
      query += ' WHERE email = ?';
      params.push(userEmail);
    }
    
    query += ' ORDER BY created_at DESC';
    const tickets = await dbAll(query, params);
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
});

// POST /api/tickets
app.post('/api/tickets', async (req, res) => {
  const { name, email, sn, description, ticketId } = req.body;

  if (!name || !email || !sn || !description || !ticketId) {
    return res.status(400).json({ error: 'All support ticket fields are required' });
  }

  try {
    // Insert ticket into the tickets table
    const query = `
      INSERT INTO tickets (ticket_id, name, email, sn, description, status)
      VALUES (?, ?, ?, ?, ?, 'Open')
    `;
    const result = await dbRun(query, [ticketId, name, email, sn, description]);

    // Write support ticket event to database logs table
    const logDetails = `Support Ticket #${ticketId} raised by ${name} (${email}) for S/N: ${sn}. Issue: ${description}`;
    await dbRun('INSERT INTO logs (asset_id, action, details) VALUES (?, ?, ?)', [null, 'Create', logDetails]);

    const createdTicket = await dbGet('SELECT * FROM tickets WHERE id = ?', [result.id]);
    res.status(201).json(createdTicket);
  } catch (error) {
    console.error('Error creating support ticket:', error);
    res.status(500).json({ error: 'Failed to submit support ticket' });
  }
});

// PUT update ticket status
app.put('/api/tickets/:id/status', async (req, res) => {
  const { status } = req.body;
  const ticketId = req.params.id;
  const userRole = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  if (!status || !['Open', 'In Progress', 'Resolved'].includes(status)) {
    return res.status(400).json({ error: 'Valid status is required' });
  }

  try {
    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    if (userRole === 'it' && ticket.email !== userEmail) {
      return res.status(403).json({ error: 'Unauthorized: IT users can only manage their own tickets' });
    }

    await dbRun(
      'UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, ticketId]
    );

    // Log status change
    const logDetails = `Ticket #${ticket.ticket_id} status updated from "${ticket.status}" to "${status}"`;
    await dbRun('INSERT INTO logs (asset_id, action, details) VALUES (?, ?, ?)', [null, 'Update', logDetails]);

    const updatedTicket = await dbGet('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    res.json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// DELETE support ticket
app.delete('/api/tickets/:id', async (req, res) => {
  const ticketId = req.params.id;
  const userRole = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  try {
    const ticket = await dbGet('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    if (userRole === 'it' && ticket.email !== userEmail) {
      return res.status(403).json({ error: 'Unauthorized: IT users can only delete their own tickets' });
    }

    await dbRun('DELETE FROM tickets WHERE id = ?', [ticketId]);

    // Log deletion
    const logDetails = `Archived/Deleted Ticket #${ticket.ticket_id} raised by ${ticket.name}`;
    await dbRun('INSERT INTO logs (asset_id, action, details) VALUES (?, ?, ?)', [null, 'Delete', logDetails]);

    res.json({ message: 'Support ticket deleted successfully', deletedTicketId: ticketId });
  } catch (error) {
    console.error('Error deleting support ticket:', error);
    res.status(500).json({ error: 'Failed to delete support ticket' });
  }
});

// GET all assets with search and filter
app.get('/api/assets', async (req, res) => {
  const userRole = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  try {
    const { search, type, status, sort, order } = req.query;
    let sql = 'SELECT * FROM assets WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (make LIKE ? OR model LIKE ? OR sn LIKE ? OR user_name LIKE ? OR user_email LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
    }

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    // Sorting
    const allowedSortFields = ['make', 'model', 'sn', 'user_name', 'status', 'type', 'created_at'];
    const activeSort = allowedSortFields.includes(sort) ? sort : 'created_at';
    const activeOrder = order === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${activeSort} ${activeOrder}`;

    const assets = await dbAll(sql, params);

    // Apply visibility constraints: IT users cannot see passwords of other users' assets
    if (userRole === 'it') {
      assets.forEach(asset => {
        if (asset.user_email !== userEmail) {
          if (asset.password !== null && asset.password !== '') {
            asset.password = '[Access Restricted]';
          }
          if (asset.email_password !== null && asset.email_password !== '') {
            asset.email_password = '[Access Restricted]';
          }
        }
      });
    }

    res.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

// GET stats for dashboard summary
app.get('/api/stats', async (req, res) => {
  try {
    const totalRow = await dbGet('SELECT COUNT(*) as count FROM assets');
    const laptopsRow = await dbGet("SELECT COUNT(*) as count FROM assets WHERE type = 'Laptop'");
    const desktopsRow = await dbGet("SELECT COUNT(*) as count FROM assets WHERE type = 'Desktop'");
    
    const statusCounts = await dbAll('SELECT status, COUNT(*) as count FROM assets GROUP BY status');
    const makeCounts = await dbAll('SELECT make, COUNT(*) as count FROM assets GROUP BY make');

    res.json({
      total: totalRow.count,
      laptops: laptopsRow.count,
      desktops: desktopsRow.count,
      statusBreakdown: statusCounts,
      makeBreakdown: makeCounts
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET activity logs
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await dbAll('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50');
    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// GET single asset by ID
app.get('/api/assets/:id', async (req, res) => {
  const userRole = req.headers['x-user-role'];
  const userEmail = req.headers['x-user-email'];

  try {
    const asset = await dbGet('SELECT * FROM assets WHERE id = ?', [req.params.id]);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    if (userRole === 'it' && asset.user_email !== userEmail) {
      if (asset.password !== null && asset.password !== '') {
        asset.password = '[Access Restricted]';
      }
      if (asset.email_password !== null && asset.email_password !== '') {
        asset.email_password = '[Access Restricted]';
      }
    }

    res.json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
});

// POST create new asset
app.post('/api/assets', async (req, res) => {
  const { type, make, model, sn, user_name, user_email, password, email_password, configuration, status, monitor, keyboard_mouse, headphone } = req.body;

  if (!type || !make || !model || !sn) {
    return res.status(400).json({ error: 'Type, Make, Model, and Serial Number (SN) are required' });
  }

  try {
    // Check if SN already exists
    const existing = await dbGet('SELECT id FROM assets WHERE sn = ?', [sn]);
    if (existing) {
      return res.status(400).json({ error: `Serial Number '${sn}' is already registered` });
    }

    const query = `
      INSERT INTO assets (type, make, model, sn, user_name, user_email, password, email_password, configuration, status, monitor, keyboard_mouse, headphone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      type,
      make,
      model,
      sn,
      user_name || null,
      user_email || null,
      password || null,
      email_password || null,
      configuration || null,
      status || 'Active',
      monitor || null,
      keyboard_mouse || null,
      headphone || null
    ];

    const result = await dbRun(query, params);
    
    // Log action
    const logDetails = `Added ${type} - ${make} ${model} (S/N: ${sn})${user_name ? ` assigned to ${user_name}` : ' (Unassigned)'}`;
    await dbRun('INSERT INTO logs (asset_id, action, details) VALUES (?, ?, ?)', [result.id, 'Create', logDetails]);

    const createdAsset = await dbGet('SELECT * FROM assets WHERE id = ?', [result.id]);
    res.status(201).json(createdAsset);
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'Failed to create asset' });
  }
});

// PUT update asset
app.put('/api/assets/:id', async (req, res) => {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Only administrators can modify asset registry details' });
  }

  const { type, make, model, sn, user_name, user_email, password, email_password, configuration, status, monitor, keyboard_mouse, headphone } = req.body;
  const assetId = req.params.id;

  if (!type || !make || !model || !sn) {
    return res.status(400).json({ error: 'Type, Make, Model, and Serial Number (SN) are required' });
  }

  try {
    const existingAsset = await dbGet('SELECT * FROM assets WHERE id = ?', [assetId]);
    if (!existingAsset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Check if new SN conflicts with another asset
    const snConflict = await dbGet('SELECT id FROM assets WHERE sn = ? AND id != ?', [sn, assetId]);
    if (snConflict) {
      return res.status(400).json({ error: `Serial Number '${sn}' is already in use by another asset` });
    }

    // Guard against overwriting real passwords with the access restriction string
    let finalPassword = password;
    if (password === '[Access Restricted]') {
      finalPassword = existingAsset.password;
    }

    let finalEmailPassword = email_password;
    if (email_password === '[Access Restricted]') {
      finalEmailPassword = existingAsset.email_password;
    }

    const query = `
      UPDATE assets
      SET type = ?, make = ?, model = ?, sn = ?, user_name = ?, user_email = ?, password = ?, email_password = ?, configuration = ?, status = ?, monitor = ?, keyboard_mouse = ?, headphone = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const params = [
      type,
      make,
      model,
      sn,
      user_name || null,
      user_email || null,
      finalPassword || null,
      finalEmailPassword || null,
      configuration || null,
      status || 'Active',
      monitor || null,
      keyboard_mouse || null,
      headphone || null,
      assetId
    ];

    await dbRun(query, params);

    // Calculate changes for detailed logs
    const changes = [];
    if (existingAsset.user_name !== user_name) {
      changes.push(`Owner: "${existingAsset.user_name || 'None'}" -> "${user_name || 'None'}"`);
    }
    if (existingAsset.status !== status) {
      changes.push(`Status: "${existingAsset.status}" -> "${status}"`);
    }
    if (existingAsset.make !== make || existingAsset.model !== model) {
      changes.push(`Device: "${existingAsset.make} ${existingAsset.model}" -> "${make} ${model}"`);
    }
    if (existingAsset.monitor !== monitor) {
      changes.push(`Monitor: "${existingAsset.monitor || 'None'}" -> "${monitor || 'None'}"`);
    }
    if (existingAsset.keyboard_mouse !== keyboard_mouse) {
      changes.push(`Keyboard/Mouse: "${existingAsset.keyboard_mouse || 'None'}" -> "${keyboard_mouse || 'None'}"`);
    }
    if (existingAsset.headphone !== headphone) {
      changes.push(`Headphone: "${existingAsset.headphone || 'None'}" -> "${headphone || 'None'}"`);
    }

    const logDetails = `Updated ${type} (S/N: ${sn}). ` + (changes.length > 0 ? `Changes: ${changes.join(', ')}` : 'No major fields changed.');
    await dbRun('INSERT INTO logs (asset_id, action, details) VALUES (?, ?, ?)', [assetId, 'Update', logDetails]);

    const updatedAsset = await dbGet('SELECT * FROM assets WHERE id = ?', [assetId]);
    res.json(updatedAsset);
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ error: 'Failed to update asset' });
  }
});

// DELETE asset
app.delete('/api/assets/:id', async (req, res) => {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Only administrators can delete asset registry details' });
  }

  const assetId = req.params.id;

  try {
    const asset = await dbGet('SELECT * FROM assets WHERE id = ?', [assetId]);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    await dbRun('DELETE FROM assets WHERE id = ?', [assetId]);

    // Log deletion
    const logDetails = `Deleted ${asset.type} - ${asset.make} ${asset.model} (S/N: ${asset.sn})`;
    await dbRun('INSERT INTO logs (asset_id, action, details) VALUES (?, ?, ?)', [null, 'Delete', logDetails]);

    res.json({ message: 'Asset deleted successfully', deletedAssetId: assetId });
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Failed to delete asset' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

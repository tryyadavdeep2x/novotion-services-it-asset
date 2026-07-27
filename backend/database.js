import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';
import crypto from 'crypto';

export const hashPassword = (password) => {
  return crypto.pbkdf2Sync(password, 'novotion_salt_2026', 1000, 64, 'sha512').toString('hex');
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    // Create assets table
    db.run(`
      CREATE TABLE IF NOT EXISTS assets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('Laptop', 'Desktop')),
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        sn TEXT UNIQUE NOT NULL,
        user_name TEXT,
        user_email TEXT,
        password TEXT,
        email_password TEXT,
        configuration TEXT,
        status TEXT DEFAULT 'Active' CHECK(status IN ('Active', 'In Stock', 'Maintenance', 'Retired')),
        monitor TEXT,
        keyboard_mouse TEXT,
        headphone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (!err) {
        db.run("ALTER TABLE assets ADD COLUMN monitor TEXT", () => {});
        db.run("ALTER TABLE assets ADD COLUMN keyboard_mouse TEXT", () => {});
        db.run("ALTER TABLE assets ADD COLUMN headphone TEXT", () => {});
      }
    });

    // Create logs table for audit trail
    db.run(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        asset_id INTEGER,
        action TEXT NOT NULL,
        details TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create users table for authentication
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'it' CHECK(role IN ('it', 'admin')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create tickets table for support requests
    db.run(`
      CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_id TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        sn TEXT NOT NULL,
        description TEXT NOT NULL,
        status TEXT DEFAULT 'Open' CHECK(status IN ('Open', 'In Progress', 'Resolved')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if table is empty and insert seed data
    db.get("SELECT COUNT(*) as count FROM assets", [], (err, row) => {
      if (err) {
        console.error("Error checking asset count:", err.message);
        return;
      }
      if (row.count === 0) {
        console.log("Seeding database with sample IT assets...");
        const stmt = db.prepare(`
          INSERT INTO assets (type, make, model, sn, user_name, user_email, password, email_password, configuration, status, monitor, keyboard_mouse, headphone)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run("Laptop", "Apple", "MacBook Pro M3", "SN-APL-89304", "Alice Chen", "alice.chen@novotion.com", "M@cBook#2026!", "AliceEmailPass123", "M3 Pro, 18GB Unified Memory, 512GB SSD, macOS Sequoia", "Active", "Studio Display 27\"", "Magic Keyboard & Mouse", "AirPods Max");
        stmt.run("Desktop", "Dell", "OptiPlex 7000", "SN-DEL-33829", "Bob Johnson", "bob.johnson@novotion.com", "D3ll!P@ss7000", "BobEmailPass7000", "Intel Core i7-13700, 32GB DDR5 RAM, 1TB NVMe SSD, Windows 11 Pro", "Active", "Dell UltraSharp 34\"", "Logitech MX Keys & Mouse", "Bose QuietComfort");
        stmt.run("Laptop", "Lenovo", "ThinkPad X1 Carbon Gen 11", "SN-LEN-47201", "Emma Watson", "emma.watson@novotion.com", "ThinkP@d#Carbon", "EmmaEmailPassCarbon", "Intel Core i7-1355U, 16GB LPDDR5, 512GB SSD, Windows 11 Pro", "Active", "Lenovo ThinkVision 24\"", "Lenovo Wireless Combo", null);
        stmt.run("Laptop", "HP", "EliteBook 840 G10", "SN-HPP-10293", null, null, null, null, "Intel Core i5-1335U, 16GB DDR5, 256GB SSD, Windows 11 Pro", "In Stock", null, null, null);
        stmt.run("Laptop", "Dell", "Latitude 5440", "SN-DEL-98402", "David Miller", "david.miller@novotion.com", "D3ll#Lat!5440", "DavidEmailPass5440", "Intel Core i5-1345U, 16GB DDR5 RAM, 512GB SSD, Windows 11 Pro", "Maintenance", "Dell 24\" Monitor", "Dell Keyboard/Mouse", "Sony WH-1000XM4");
        stmt.run("Desktop", "Apple", "Mac Studio", "SN-APL-77492", "Sarah Connor", "sarah.connor@novotion.com", "M@cStudi0#2026", "SarahEmailPassStudio", "M2 Max, 32GB Unified Memory, 1TB SSD, macOS Sonoma", "Active", "Pro Display XDR", "Magic Keyboard & Mouse", null);
        stmt.run("Laptop", "Asus", "ROG Zephyrus G14", "SN-ASU-44820", "Leon Kennedy", "leon.kennedy@novotion.com", "Z3phyrus!G14", "LeonEmailPassZephyrus", "AMD Ryzen 9, 32GB DDR5, RTX 4070, 1TB SSD, Windows 11 Pro", "Active", null, "ASUS ROG Claymore II", "HyperX Cloud II");

        stmt.finalize();

        // Seed logs
        const logStmt = db.prepare(`
          INSERT INTO logs (asset_id, action, details)
          VALUES (?, ?, ?)
        `);
        logStmt.run(1, "Create", "Initial import of MacBook Pro M3 for Alice Chen");
        logStmt.run(2, "Create", "Initial import of Dell OptiPlex 7000 for Bob Johnson");
        logStmt.run(3, "Create", "Initial import of Lenovo ThinkPad for Emma Watson");
        logStmt.run(4, "Create", "HP EliteBook added to stock");
        logStmt.run(5, "Create", "Dell Latitude added and sent for maintenance");
        logStmt.run(6, "Create", "Initial import of Mac Studio for Sarah Connor");
        logStmt.run(7, "Create", "Initial import of Asus ROG for Leon Kennedy");
        logStmt.finalize();

        console.log("Database seeded successfully.");
      }
    });

    // Check if users table is empty and insert seed data
    db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
      if (err) {
        console.error("Error checking users count:", err.message);
        return;
      }
      if (row.count === 0) {
        console.log("Seeding database with default users...");
        const stmt = db.prepare(`
          INSERT INTO users (username, email, password_hash, role)
          VALUES (?, ?, ?, ?)
        `);
        const defaultPasswordHash = hashPassword('Password123!');
        stmt.run("it_admin", "it@novotionservices.com", defaultPasswordHash, "it");
        stmt.run("admin", "admin@novotionservices.com", defaultPasswordHash, "admin");
        stmt.finalize();
        console.log("Default users seeded successfully.");
      }
    });

    // Check if tickets table is empty and insert seed data
    db.get("SELECT COUNT(*) as count FROM tickets", [], (err, row) => {
      if (err) {
        console.error("Error checking tickets count:", err.message);
        return;
      }
      if (row.count === 0) {
        console.log("Seeding database with sample IT tickets...");
        const stmt = db.prepare(`
          INSERT INTO tickets (ticket_id, name, email, sn, description, status)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        stmt.run("TICK-728104", "Emma Watson", "emma.watson@novotion.com", "SN-LEN-47201", "Laptop keyboard backspace key is sticky and unresponsive.", "Open");
        stmt.run("TICK-491028", "David Miller", "david.miller@novotion.com", "SN-DEL-98402", "Dell laptop battery drains within 30 minutes. Needs diagnostic/replacement.", "In Progress");
        stmt.finalize();
        console.log("Sample IT tickets seeded successfully.");
      }
    });
  });
}

export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export default db;

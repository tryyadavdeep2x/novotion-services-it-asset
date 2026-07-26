import { useState, useEffect } from 'react';
import { 
  Shield, 
  Terminal, 
  HelpCircle, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  Clock,
  HardDrive,
  Trash2,
  LogOut,
  Globe2
} from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { CustomCursor } from './components/CustomCursor';
import { Dashboard } from './components/Dashboard';
import { StatsCharts } from './components/StatsCharts';
import { AssetTable } from './components/AssetTable';
import { AssetModal } from './components/AssetModal';
import { AssetDetail } from './components/AssetDetail';
import { Login } from './components/Login';
import { TicketManager } from './components/TicketManager';
import type { Asset, ActivityLog, DashboardStats, UserSession, Ticket } from './types';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || 'https://novotion-services-it-asset.onrender.com/api';

function App() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  // Search and Filter State
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // UI Control State
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);

  // Support Ticket States
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'login' | 'registry' | 'tickets'>('login');
  
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);

  // Notification State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleLoginSuccess = (user: UserSession) => {
    setCurrentUser(user);
    localStorage.setItem('novotion_user_session', JSON.stringify(user));
    setActiveTab('registry'); // Route to registry dashboard
    showToast(`Welcome back, ${user.username}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('novotion_user_session');
    setActiveTab('login'); // Route back to login landing page
    showToast('Securely logged out successfully.');
  };

  // Fetch Assets
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      params.append('sort', sortField);
      params.append('order', sortOrder);

      const res = await fetch(`${API_BASE}/assets?${params.toString()}`, {
        headers: {
          'X-User-Role': currentUser?.role || 'it',
          'X-User-Email': currentUser?.email || ''
        }
      });
      if (!res.ok) throw new Error('Failed to fetch assets');
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      console.error(err);
      showToast('Error connecting to IT database', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch Stats
  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Logs
  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/logs`);
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLogsLoading(false);
    }
  };

  // Fetch Support Tickets
  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        headers: {
          'X-User-Role': currentUser?.role || 'it',
          'X-User-Email': currentUser?.email || ''
        }
      });
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleUpdateTicketStatus = async (id: number, status: Ticket['status']) => {
    try {
      const res = await fetch(`${API_BASE}/tickets/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Role': currentUser?.role || 'it',
          'X-User-Email': currentUser?.email || ''
        },
        body: JSON.stringify({ status })
      });

      if (!res.ok) throw new Error('Failed to update ticket status');
      
      showToast('Support ticket updated and logged successfully');
      fetchTickets();
      fetchLogs();
    } catch (err) {
      console.error(err);
      showToast('Failed to update support ticket status', 'error');
    }
  };

  const handleDeleteTicket = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/tickets/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Role': currentUser?.role || 'it',
          'X-User-Email': currentUser?.email || ''
        }
      });

      if (!res.ok) throw new Error('Failed to archive support ticket');

      showToast('Support ticket archived and logged successfully');
      fetchTickets();
      fetchLogs();
    } catch (err) {
      console.error(err);
      showToast('Failed to archive support ticket', 'error');
    }
  };

  // Load initial data & restore session
  useEffect(() => {
    const savedUser = localStorage.getItem('novotion_user_session');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setActiveTab('registry'); // auto-redirect to registry if already logged in
      } catch (e) {
        localStorage.removeItem('novotion_user_session');
      }
    }
    // Fetch initial assets to populate the landing page bento grid
    fetchAssets();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchStats();
      fetchLogs();
      fetchTickets();
    }
  }, [currentUser]);

  // Fetch assets whenever search or filter or sort changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchAssets();
    }, 150); // slight debounce for search input

    return () => clearTimeout(delayDebounceFn);
  }, [search, typeFilter, statusFilter, sortField, sortOrder]);

  const handleRefreshAll = () => {
    fetchAssets();
    fetchStats();
    fetchLogs();
    fetchTickets();
    showToast('IT Database synchronized successfully');
  };

  // Save Asset (Add or Edit)
  const handleSaveAsset = async (assetData: Partial<Asset>): Promise<boolean> => {
    try {
      const url = editingAsset 
        ? `${API_BASE}/assets/${editingAsset.id}` 
        : `${API_BASE}/assets`;
      
      const method = editingAsset ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Role': currentUser?.role || 'it'
        },
        body: JSON.stringify(assetData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save asset');
      }

      showToast(
        editingAsset 
          ? `Asset S/N: ${assetData.sn} updated successfully` 
          : `Asset S/N: ${assetData.sn} registered successfully`, 
        'success'
      );

      // Refresh data
      fetchAssets();
      fetchStats();
      fetchLogs();
      return true;
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to save asset. S/N must be unique.', 'error');
      return false;
    }
  };

  // Delete Asset
  const handleDeleteAsset = (id: number) => {
    setDeleteConfirmationId(id);
  };

  const confirmDeleteAsset = async () => {
    if (!deleteConfirmationId) return;

    try {
      const res = await fetch(`${API_BASE}/assets/${deleteConfirmationId}`, {
        method: 'DELETE',
        headers: { 'X-User-Role': currentUser?.role || 'it' }
      });

      if (!res.ok) throw new Error('Failed to delete asset');
      
      showToast('IT Asset deleted and logged successfully');
      setDeleteConfirmationId(null);
      
      fetchAssets();
      fetchStats();
      fetchLogs();
    } catch (err) {
      console.error(err);
      showToast('Failed to delete IT asset', 'error');
    }
  };

  const handleViewAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setIsDetailOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setEditingAsset(asset);
    setIsModalOpen(true);
  };

  const handleAddAsset = () => {
    setEditingAsset(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen pb-16 relative">
      {/* 1. Transparent Crystal Overlay Grid */}
      <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px] z-0 pointer-events-none" />

      {/* 2. Custom trailing cursor */}
      <CustomCursor />

      {/* 3. Toast Alert notifications */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className={`flex items-center space-x-2.5 px-4 py-3 rounded-full border shadow-2xl backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-black/90 border-[#38bdf8]/30 text-white shadow-lg shadow-blue-500/5' 
              : 'bg-black/90 border-rose-500/30 text-rose-550 shadow-lg shadow-rose-500/5'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-[#38bdf8]" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0 text-rose-500" />
            )}
            <span className="text-xs font-bold font-mono tracking-wide text-white">{toast.message}</span>
          </div>
        </div>
      )}

      {/* 4. Fixed top navigation bar (centered, max-width 1400px, rounded-full, 12px blur, transparent bg) */}
      <header className="fixed top-6 left-0 right-0 z-50 px-4 sm:px-6 select-none">
        <div className="max-w-[1400px] mx-auto bg-slate-950/30 backdrop-blur-[16px] border border-white/12 rounded-full py-4 px-8 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          
          {/* Logo Brand: Scaled to match image_0.png, using cyan/blue shield brand typography */}
          <div 
            onClick={() => { if (currentUser) setActiveTab('registry'); }}
            className="flex items-center space-x-3.5 cursor-pointer select-none"
          >
            {/* Custom stylized Shield Emblem */}
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#0066ff] to-[#38bdf8] flex items-center justify-center shadow-md shadow-blue-500/30 animate-pulse">
              <Shield className="w-4.5 h-4.5 text-white" />
            </div>
            
            {/* Exactly formatted typography: Novotion IT */}
            <div className="flex flex-col text-left">
              <span className="text-white font-extrabold tracking-tight text-base font-heading leading-none uppercase">
                Novotion <span className="text-[#38bdf8] font-light">IT</span>
              </span>
              <span className="text-[8px] text-white/40 tracking-[0.2em] font-bold uppercase mt-0.5">
                Assets Registry
              </span>
            </div>
          </div>

          {/* Center Navigation Links - Only render when authenticated */}
          {currentUser && (
            <div className="flex items-center space-x-1 bg-white/5 p-0.5 rounded-full border border-white/5 text-sm font-medium">
              <button
                onClick={() => setActiveTab('registry')}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'registry' 
                    ? 'bg-[#0066ff] text-white shadow-sm' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Registry</span>
              </button>
              
              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'tickets' 
                    ? 'bg-[#0066ff] text-white shadow-sm' 
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Tickets</span>
                {tickets.filter(t => t.status !== 'Resolved').length > 0 && (
                  <span className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-full ${
                    activeTab === 'tickets' ? 'bg-white text-black' : 'bg-[#0066ff] text-white'
                  }`}>
                    {tickets.filter(t => t.status !== 'Resolved').length}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Right Action (Glassmorphism CTA / Status Button) */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex items-center space-x-2 border-r border-white/10 pr-4 mr-1">
                  <div className="h-7 w-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white font-bold text-xs uppercase">
                    {currentUser.username.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-bold text-white leading-tight uppercase">{currentUser.username}</div>
                    <div className="text-[8px] text-white/50 leading-none">{currentUser.role.toUpperCase()}</div>
                  </div>
                </div>

                <button
                  onClick={handleRefreshAll}
                  className="p-2 rounded-full border border-white/10 hover:border-[#38bdf8]/50 hover:bg-[#38bdf8]/10 text-white/60 hover:text-[#38bdf8] cursor-pointer active:scale-95 transition-all bg-white/5"
                  title="Sync Database"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full border border-white/10 hover:border-rose-500/50 hover:bg-rose-500/10 text-white/60 hover:text-rose-500 cursor-pointer active:scale-95 transition-all bg-white/5"
                  title="Secure Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5 bg-blue-500/15 border border-[#38bdf8]/20 px-3 py-1.5 rounded-full text-[9px] text-[#38bdf8] font-black tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse mr-1" />
                IT PORTAL ONLINE
              </div>
            )}
          </div>

        </div>
      </header>

      {/* 5. Main Routing Layout Panels (Centered margin offset for fixed header padding) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 space-y-8 min-h-[60vh] relative z-10">
        
        {/* Mobile Navigation Indicators - Only render when authenticated */}
        {currentUser && (
          <div className="sm:hidden flex items-center space-x-1 bg-white/5 p-1 rounded-full border border-white/5 select-none">
            <button
              onClick={() => setActiveTab('registry')}
              className={`flex-1 text-center py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                activeTab === 'registry' 
                  ? 'bg-[#0066ff] text-white shadow-sm' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Registry
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`flex-1 text-center py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                activeTab === 'tickets' 
                  ? 'bg-[#0066ff] text-white shadow-sm' 
                  : 'text-white/65 hover:text-white'
              }`}
            >
              Tickets
            </button>
          </div>
        )}

        {/* Tab Switch Panels */}
        {activeTab === 'login' && (
          currentUser ? (
            <div className="text-center py-12 text-white/60 text-xs font-mono">
              SESSION ACTIVE. REDIRECTING PORTAL COMMANDS...
              {setTimeout(() => setActiveTab('registry'), 1000)}
            </div>
          ) : (
            <Login onLoginSuccess={handleLoginSuccess} />
          )
        )}

        {activeTab === 'registry' && (
          currentUser ? (
            <>
              {/* Page Hero Title */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 select-none">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-white font-heading uppercase">
                    Enterprise <span className="text-[#38bdf8] drop-shadow-[0_0_12px_rgba(56,189,248,0.2)]">IT Infrastructure</span> Assets
                  </h1>
                  <p className="text-white/60 text-xs font-medium mt-1">
                    Securely monitor, assign, and audit laptops, desktops, configurations, and passwords across departments.
                  </p>
                </div>
              </div>

              {/* Dashboard stats row */}
              <Dashboard stats={stats} loading={statsLoading} />

              {/* Distribution visualizer & live log console */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <StatsCharts stats={stats} loading={statsLoading} />
                </div>

                {/* Audit Logs Sidebar (Styled as high-contrast monospaced blue terminal) */}
                <div className="glass-panel border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col h-[280px] shadow-2xl bg-black/60 font-mono animate-fade-in">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-[#38bdf8]" />
                  
                  <div className="flex items-center justify-between mb-4 select-none">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center font-heading">
                      <Terminal className="w-4 h-4 text-[#38bdf8] mr-1.5 animate-pulse" />
                      Live Audit Logs
                    </h3>
                    <span className="text-[9px] text-[#38bdf8]/75 font-bold tracking-wider uppercase flex items-center">
                      <Clock className="w-3 h-3 mr-1 text-[#38bdf8]/60" />
                      SQL STREAM
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                    {logsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse h-10 bg-white/5 rounded-xl border border-white/5" />
                      ))
                    ) : logs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-[#38bdf8]/40 text-xs italic select-none">
                        No transactions logged yet.
                      </div>
                    ) : (
                      logs.map((log) => (
                        <div key={log.id} className="p-2.5 rounded-xl bg-black border border-white/10 text-[10px] leading-relaxed text-[#38bdf8] shadow-sm transition-all hover:border-[#38bdf8]/30 hover:bg-white/5">
                          <div className="flex justify-between items-center mb-1 select-none">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                              log.action === 'Create' ? 'bg-[#38bdf8]/20 text-white border border-[#38bdf8]/40' :
                              log.action === 'Update' ? 'bg-white/10 text-white border border-white/20' :
                              'bg-rose-500/20 text-rose-550 border border-rose-500/40'
                            }`}>
                              {log.action}
                            </span>
                            <span className="text-[9px] text-[#38bdf8]/50 font-normal">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="font-normal text-white/80">{log.details}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Data table */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center space-x-2 select-none">
                  <HardDrive className="w-5 h-5 text-[#38bdf8] animate-float-icon" />
                  <h2 className="text-xl font-bold text-white font-heading uppercase tracking-[-0.05em]">Asset registry database</h2>
                </div>
                <AssetTable
                  assets={assets}
                  loading={loading}
                  onView={handleViewAsset}
                  onEdit={handleEditAsset}
                  onDelete={handleDeleteAsset}
                  onAdd={handleAddAsset}
                  search={search}
                  setSearch={setSearch}
                  typeFilter={typeFilter}
                  setTypeFilter={setTypeFilter}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  sortField={sortField}
                  setSortField={setSortField}
                  sortOrder={sortOrder}
                  setSortOrder={setSortOrder}
                  onRefresh={handleRefreshAll}
                  userRole={currentUser.role}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-white/50 text-xs font-mono">
              SESSION EXPIRED. REDIRECTING PORTAL...
              {setTimeout(() => setActiveTab('login'), 1500)}
            </div>
          )
        )}

        {activeTab === 'tickets' && (
          currentUser ? (
            <>
              {/* Page Hero Title */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 select-none">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-white font-heading uppercase">
                    IT Support <span className="text-[#38bdf8] drop-shadow-[0_0_12px_rgba(56,189,248,0.2)]">Ticket Center</span>
                  </h1>
                  <p className="text-white/60 text-xs font-medium mt-1">
                    Review and resolve system, hardware, and configuration issues raised by Novotion Services employees.
                  </p>
                </div>
              </div>

              <TicketManager
                tickets={tickets}
                loading={ticketsLoading}
                onUpdateStatus={handleUpdateTicketStatus}
                onDeleteTicket={handleDeleteTicket}
                onRefresh={fetchTickets}
              />
            </>
          ) : (
            <div className="text-center py-12 text-white/50 text-xs font-mono">
              SESSION EXPIRED. REDIRECTING PORTAL...
              {setTimeout(() => setActiveTab('login'), 1500)}
            </div>
          )
        )}

      </main>

      {/* Popups & Modals */}
      <AssetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAsset}
        asset={editingAsset}
      />

      <AssetDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        asset={selectedAsset}
        logs={logs}
      />

      {/* Custom Delete Confirmation Modal (Cinematic dark styling) */}
      {deleteConfirmationId !== null && (() => {
        const assetToDelete = assets.find(a => a.id === deleteConfirmationId);
        if (!assetToDelete) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all select-none">
            <div className="w-full max-w-md glass-panel border border-white/10 rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col space-y-4 bg-black">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-rose-500" />
              
              <div className="flex items-center space-x-3 text-rose-500">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 shadow-sm animate-float-icon">
                  <Trash2 className="w-5 h-5 text-rose-500" />
                </div>
                <h2 className="text-lg font-bold text-white font-heading uppercase tracking-tight">Delete IT Asset?</h2>
              </div>
              
              <div className="text-white/60 text-xs leading-relaxed">
                Are you sure you want to permanently delete the <span className="font-bold text-white">{assetToDelete.make} {assetToDelete.model}</span> (S/N: <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[#ff5e00] text-[10px] font-bold border border-white/5">{assetToDelete.sn}</span>) from the registry?
                <p className="mt-2.5 text-[10px] text-rose-550 font-medium bg-rose-500/5 p-3 rounded-xl border border-rose-500/15 flex items-start gap-1.5">
                  <span className="shrink-0">⚠️</span>
                  <span>This will remove all associated user credentials and write a deletion event to the live audit log.</span>
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmationId(null)}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 text-white text-xs font-bold rounded-xl cursor-pointer active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAsset}
                  className="px-5 py-2 bg-gradient-to-r from-rose-600 to-red-655 hover:from-rose-500 hover:to-red-550 text-white font-bold text-xs rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Delete Asset
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default App;

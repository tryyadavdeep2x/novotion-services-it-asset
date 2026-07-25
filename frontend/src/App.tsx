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
  LogOut
} from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'registry' | 'tickets'>('registry');
  
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
    showToast(`Welcome back, ${user.username}!`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('novotion_user_session');
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

      const res = await fetch(`${API_BASE}/assets?${params.toString()}`);
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
      const res = await fetch(`${API_BASE}/tickets`);
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
        headers: { 'Content-Type': 'application/json' },
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
        method: 'DELETE'
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
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('novotion_user_session');
      }
    }
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
    if (!currentUser) return;
    const delayDebounceFn = setTimeout(() => {
      fetchAssets();
    }, 150); // slight debounce for search input

    return () => clearTimeout(delayDebounceFn);
  }, [search, typeFilter, statusFilter, sortField, sortOrder, currentUser]);

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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        {toast && (
          <div className="fixed top-6 right-6 z-50 animate-float">
            <div className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${
              toast.type === 'success' 
                ? 'bg-white/95 border-emerald-250 text-emerald-600 shadow-lg shadow-emerald-500/5' 
                : 'bg-white/95 border-rose-250 text-rose-600 shadow-lg shadow-rose-500/5'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
              )}
              <span className="text-sm font-semibold">{toast.message}</span>
            </div>
          </div>
        )}
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-float">
          <div className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${
            toast.type === 'success' 
              ? 'bg-white/95 border-emerald-250 text-emerald-600 shadow-lg shadow-emerald-500/5' 
              : 'bg-white/95 border-rose-250 text-rose-600 shadow-lg shadow-rose-500/5'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
            )}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <header className="glass-panel border-b border-slate-200/80 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center glow-indigo">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-slate-800 font-bold tracking-tight text-base font-heading">
                NOVOTION <span className="font-light text-slate-500">SERVICES</span>
              </span>
              <div className="text-[10px] text-slate-500 tracking-wider font-semibold uppercase -mt-1">
                IT Asset Registry
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Server Connection Status */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full text-[10px] text-emerald-700 font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>SQL SERVER ONLINE</span>
            </div>
            
            {/* User Profile Info */}
            <div className="flex items-center space-x-2 border-l border-slate-200 pl-4 h-8">
              <div className="h-8 w-8 rounded-xl bg-sky-50 border border-sky-150 flex items-center justify-center text-sky-700 font-bold text-xs uppercase shadow-sm">
                {currentUser.username.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">{currentUser.username}</div>
                <div className="text-[9px] text-slate-500 leading-none">{currentUser.email}</div>
              </div>
            </div>

            {/* Tab Navigation Controls */}
            <div className="hidden sm:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
              <button
                onClick={() => setActiveTab('registry')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'registry' 
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-650 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Asset Registry</span>
              </button>
              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'tickets' 
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-650 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Tickets</span>
                {tickets.filter(t => t.status !== 'Resolved').length > 0 && (
                  <span className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-full ${
                    activeTab === 'tickets' ? 'bg-white text-sky-750' : 'bg-sky-500 text-white'
                  }`}>
                    {tickets.filter(t => t.status !== 'Resolved').length}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={handleRefreshAll}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 text-slate-500 cursor-pointer active:scale-95 transition-all shadow-sm"
              title="Sync Database"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 cursor-pointer active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
              title="Secure Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Mobile Tab Selectors */}
        <div className="sm:hidden flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
          <button
            onClick={() => setActiveTab('registry')}
            className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'registry' 
                ? 'bg-gradient-to-r from-sky-600 to-indigo-650 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Asset Registry
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'tickets' 
                ? 'bg-gradient-to-r from-sky-600 to-indigo-650 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Tickets</span>
            {tickets.filter(t => t.status !== 'Resolved').length > 0 && (
              <span className={`px-1.5 py-0.5 text-[8px] font-extrabold rounded-full ${
                activeTab === 'tickets' ? 'bg-white text-sky-750' : 'bg-sky-500 text-white'
              }`}>
                {tickets.filter(t => t.status !== 'Resolved').length}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'registry' ? (
          <>
            {/* Page Hero Title */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 font-heading">
                  Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">IT Infrastructure</span> Assets
                </h1>
                <p className="text-slate-650 text-sm font-normal mt-1.5">
                  Securely track laptops, desktops, configurations, credentials, passwords, and assignments across Novotion Services.
                </p>
              </div>
            </div>

            {/* Dashboard Cards Row */}
            <Dashboard stats={stats} loading={statsLoading} />

            {/* Section 2: Distribution Visualizations and Activity Logs */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <StatsCharts stats={stats} loading={statsLoading} />
              </div>

              {/* Audit Logs Sidebar */}
              <div className="glass-panel border border-slate-200 rounded-2xl p-6 relative overflow-hidden flex flex-col h-[280px] shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-rose-500" />
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center font-heading">
                    <Terminal className="w-4 h-4 text-purple-600 mr-1.5" />
                    Live Audit Logs
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                    SQL TRANSACTIONS
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {logsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="animate-pulse h-10 bg-slate-100 rounded-xl" />
                    ))
                  ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs italic">
                      No activities logged yet
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-xl bg-white border border-slate-200/60 text-[11px] leading-relaxed text-slate-700 shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            log.action === 'Create' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            log.action === 'Update' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-[9px] text-slate-400 font-normal font-mono">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="font-normal text-slate-600">{log.details}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: IT Asset Database Table */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-indigo-600" />
                <h2 className="text-xl font-bold text-slate-800 font-heading">Asset Registry</h2>
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
          <>
            {/* Page Hero Title */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 font-heading">
                  IT Support <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Ticket Center</span>
                </h1>
                <p className="text-slate-650 text-sm font-normal mt-1.5">
                  Review and manage hardware, software, and configuration issues raised by Novotion Services employees.
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

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirmationId !== null && (() => {
        const assetToDelete = assets.find(a => a.id === deleteConfirmationId);
        if (!assetToDelete) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
            <div className="w-full max-w-md glass-panel border border-slate-200 rounded-2xl shadow-2xl p-6 relative overflow-hidden flex flex-col space-y-4">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
              
              <div className="flex items-center space-x-3 text-rose-600">
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 shadow-sm">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-800 font-heading">Delete IT Asset?</h2>
              </div>
              
              <div className="text-slate-650 text-sm leading-relaxed">
                Are you sure you want to permanently delete the <span className="font-bold text-slate-800">{assetToDelete.make} {assetToDelete.model}</span> (S/N: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700 text-xs font-bold">{assetToDelete.sn}</span>) from the registry?
                <p className="mt-2.5 text-xs text-rose-600 font-medium bg-rose-50/50 p-3 rounded-xl border border-rose-100/55 flex items-start gap-1.5">
                  <span className="shrink-0">⚠️</span>
                  <span>This will remove all associated user credentials and write a deletion event to the live audit log.</span>
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmationId(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl cursor-pointer active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAsset}
                  className="px-5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm rounded-xl shadow-md shadow-rose-500/5 active:scale-95 transition-all cursor-pointer"
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

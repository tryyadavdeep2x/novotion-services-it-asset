import React, { useState } from 'react';
import { Search, SlidersHorizontal, Trash2, Clock, Mail, User, Shield, Info, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import type { Ticket } from '../types';

interface TicketManagerProps {
  tickets: Ticket[];
  loading: boolean;
  onUpdateStatus: (id: number, status: Ticket['status']) => Promise<void>;
  onDeleteTicket: (id: number) => Promise<void>;
  onRefresh: () => void;
}

export const TicketManager: React.FC<TicketManagerProps> = ({
  tickets,
  loading,
  onUpdateStatus,
  onDeleteTicket,
  onRefresh
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Filtered tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticket_id.toLowerCase().includes(search.toLowerCase()) ||
      ticket.name.toLowerCase().includes(search.toLowerCase()) ||
      ticket.email.toLowerCase().includes(search.toLowerCase()) ||
      ticket.sn.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === '' ? true : ticket.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Ticket['status']) => {
    switch (status) {
      case 'Open':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-100">
            Open
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            In Progress
          </span>
        );
      case 'Resolved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            Resolved
          </span>
        );
    }
  };

  const handleStatusChange = async (id: number, newStatus: Ticket['status']) => {
    setActionLoadingId(id);
    await onUpdateStatus(id, newStatus);
    setActionLoadingId(null);
  };

  const handleDeleteClick = (id: number) => {
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (confirmDeleteId !== null) {
      setActionLoadingId(confirmDeleteId);
      await onDeleteTicket(confirmDeleteId);
      setActionLoadingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <div className="glass-panel border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search ticket ID, employee, S/N, issue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 transition-all placeholder:text-slate-400 outline-none"
          />
        </div>

        {/* Status Tabs and Sync */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === '' 
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-650 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Tickets
            </button>
            <button
              onClick={() => setStatusFilter('Open')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === 'Open' 
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-650 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setStatusFilter('In Progress')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === 'In Progress' 
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-650 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setStatusFilter('Resolved')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === 'Resolved' 
                  ? 'bg-gradient-to-r from-sky-600 to-indigo-650 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Resolved
            </button>
          </div>

          <button
            onClick={onRefresh}
            title="Refresh tickets list"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 text-slate-400 cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tickets Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Ticket List (Left 2 Columns) */}
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-panel border border-slate-200 rounded-2xl p-5 h-44 animate-pulse bg-slate-100/50" />
            ))
          ) : filteredTickets.length === 0 ? (
            <div className="glass-panel border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm bg-white/70">
              <div className="flex flex-col items-center justify-center space-y-2.5">
                <SlidersHorizontal className="w-8 h-8 opacity-30 text-sky-600 animate-float" />
                <p className="font-semibold text-slate-700">No support tickets found</p>
                <p className="text-xs text-slate-400">All system requests are resolved or match filters.</p>
              </div>
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicketId(selectedTicketId === ticket.id ? null : ticket.id)}
                className={`glass-panel border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 cursor-pointer shadow-sm ${
                  selectedTicketId === ticket.id 
                    ? 'border-sky-500/40 bg-white/95 shadow-sky-500/5' 
                    : 'border-slate-200 bg-white/85 hover:border-slate-350 hover:bg-white/90'
                }`}
              >
                {/* Visual Accent Glow */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  ticket.status === 'Open' ? 'bg-sky-550' : 
                  ticket.status === 'In Progress' ? 'bg-amber-500' : 'bg-emerald-500'
                }`} />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ml-2">
                  <div>
                    <div className="flex items-center space-x-2.5">
                      <span className="text-xs font-mono font-extrabold text-sky-700 bg-sky-55/65 px-2 py-0.5 rounded border border-sky-100/50">
                        #{ticket.ticket_id}
                      </span>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mt-2 font-heading">{ticket.name}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1 font-medium">
                      <span className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1 text-slate-400" /> {ticket.email}</span>
                      <span className="flex items-center"><Shield className="w-3.5 h-3.5 mr-1 text-slate-400" /> S/N: <strong className="font-mono text-slate-700 select-all ml-0.5">{ticket.sn}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {/* Status Toggle buttons */}
                    <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(ticket.id, 'In Progress'); }}
                        disabled={actionLoadingId !== null}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                          ticket.status === 'In Progress' 
                            ? 'bg-amber-500 text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Mark In Progress"
                      >
                        Progress
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleStatusChange(ticket.id, 'Resolved'); }}
                        disabled={actionLoadingId !== null}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                          ticket.status === 'Resolved' 
                            ? 'bg-emerald-500 text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                        title="Mark Resolved"
                      >
                        Resolve
                      </button>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(ticket.id); }}
                      disabled={actionLoadingId !== null}
                      title="Archive Ticket"
                      className="p-2 rounded-xl bg-white border border-slate-200 hover:border-rose-500/50 hover:text-rose-600 text-slate-400 cursor-pointer active:scale-95 transition-all shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Expaned description details */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ml-2 ${
                  selectedTicketId === ticket.id ? 'max-h-40 opacity-100 mt-4 pt-3 border-t border-slate-100' : 'max-h-0 opacity-0'
                }`}>
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center">
                    <Info className="w-3.5 h-3.5 mr-1 text-slate-400" /> Issue Description
                  </h4>
                  <p className="text-xs text-slate-700 bg-slate-50 border border-slate-150 p-3 rounded-xl font-mono leading-relaxed select-all">
                    {ticket.description}
                  </p>
                  <div className="flex items-center text-[10px] text-slate-450 mt-3 font-medium">
                    <Clock className="w-3 h-3 mr-1 text-slate-400" />
                    Submitted: {new Date(ticket.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Information / Details panel (Right 1 Column) */}
        <div className="space-y-4">
          {/* Quick Ticket Stats */}
          <div className="glass-panel border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm bg-white/90">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-indigo-500" />
            <h3 className="text-sm font-bold text-slate-800 mb-4 tracking-wide uppercase font-heading">
              Support Center Queue
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200/50 rounded-xl">
                <span className="text-xs font-semibold text-slate-600">Total Unresolved</span>
                <span className="text-sm font-extrabold text-slate-800">
                  {tickets.filter(t => t.status !== 'Resolved').length}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-sky-50/50 border border-sky-100/50 rounded-xl">
                <span className="text-xs font-semibold text-sky-700">Open Tickets</span>
                <span className="text-sm font-extrabold text-sky-850">
                  {tickets.filter(t => t.status === 'Open').length}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-amber-50/50 border border-amber-100/50 rounded-xl">
                <span className="text-xs font-semibold text-amber-700">In Progress</span>
                <span className="text-sm font-extrabold text-amber-850">
                  {tickets.filter(t => t.status === 'In Progress').length}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-emerald-50/50 border border-emerald-100/50 rounded-xl">
                <span className="text-xs font-semibold text-emerald-700">Resolved Archive</span>
                <span className="text-sm font-extrabold text-emerald-850">
                  {tickets.filter(t => t.status === 'Resolved').length}
                </span>
              </div>
            </div>
          </div>

          {/* Quick IT Guide Card */}
          <div className="glass-panel border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm bg-white/70">
            <h3 className="text-xs font-bold text-slate-500 mb-2.5 uppercase tracking-wider font-heading flex items-center">
              <Info className="w-4 h-4 mr-1.5 text-indigo-500" />
              IT Help Desk Instructions
            </h3>
            <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed font-normal">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold mt-0.5">✔</span>
                <span>Select a ticket card to view the employee's detailed issue write-up.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold mt-0.5">✔</span>
                <span>Mark tickets as **Progress** when checking logs, or **Resolve** once fixed.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold mt-0.5">✔</span>
                <span>Archiving/deleting a ticket removes it from the queue and writes an audit event.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* Custom Ticket Deletion Modal Dialog */}
      {confirmDeleteId !== null && (() => {
        const ticketToArchive = tickets.find(t => t.id === confirmDeleteId);
        if (!ticketToArchive) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
            <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 relative overflow-hidden flex flex-col space-y-4 animate-fade-in">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500" />
              
              <div className="flex items-center space-x-3 text-rose-600">
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 shadow-sm flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <h2 className="text-base font-bold text-slate-800 font-heading">Archive Support Ticket?</h2>
              </div>
              
              <p className="text-slate-600 text-xs leading-relaxed font-normal">
                Are you sure you want to delete and archive Support Ticket <strong className="font-bold text-slate-800">#{ticketToArchive.ticket_id}</strong> raised by <strong className="font-bold text-slate-800">{ticketToArchive.name}</strong>?
              </p>
              
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-650 text-xs font-semibold rounded-xl cursor-pointer active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-1.5 bg-gradient-to-r from-rose-600 to-red-650 hover:from-rose-500 hover:to-red-550 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Archive Ticket
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

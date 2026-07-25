import React from 'react';
import { 
  Search, 
  Edit2, 
  Trash2, 
  Eye, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Laptop, 
  Monitor, 
  Plus, 
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import type { Asset } from '../types';

interface AssetTableProps {
  assets: Asset[];
  loading: boolean;
  onView: (asset: Asset) => void;
  onEdit: (asset: Asset) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  search: string;
  setSearch: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  sortField: string;
  setSortField: (val: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (val: 'asc' | 'desc') => void;
  onRefresh: () => void;
  userRole: 'it' | 'admin';
}

export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  loading,
  onView,
  onEdit,
  onDelete,
  onAdd,
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  sortField,
  setSortField,
  sortOrder,
  setSortOrder,
  onRefresh,
  userRole
}) => {
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40 ml-1.5" />;
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5 text-indigo-600 ml-1.5" /> 
      : <ArrowDown className="w-3.5 h-3.5 text-indigo-600 ml-1.5" />;
  };

  const getStatusBadge = (status: Asset['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100">
            Active
          </span>
        );
      case 'In Stock':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
            In Stock
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            Maintenance
          </span>
        );
      case 'Retired':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            Retired
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="glass-panel border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search make, model, SN, user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 outline-none"
          />
        </div>

        {/* Dropdown filters & Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-600 outline-none cursor-pointer pr-2 font-semibold"
            >
              <option value="" className="bg-white text-slate-700 font-normal">All Devices</option>
              <option value="Laptop" className="bg-white text-slate-700 font-normal">Laptops</option>
              <option value="Desktop" className="bg-white text-slate-700 font-normal">Desktops</option>
            </select>
          </div>

          <div className="flex items-center space-x-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-600 outline-none cursor-pointer pr-2 font-semibold"
            >
              <option value="" className="bg-white text-slate-700 font-normal">All Statuses</option>
              <option value="Active" className="bg-white text-slate-700 font-normal">Active</option>
              <option value="In Stock" className="bg-white text-slate-700 font-normal">In Stock</option>
              <option value="Maintenance" className="bg-white text-slate-700 font-normal">Maintenance</option>
              <option value="Retired" className="bg-white text-slate-700 font-normal">Retired</option>
            </select>
          </div>

          <button
            onClick={onRefresh}
            title="Refresh database"
            className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 text-slate-400 cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-indigo-500/5 hover:shadow-indigo-500/10 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="glass-panel border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-5 select-none cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleSort('type')}>
                  <div className="flex items-center">Type {renderSortIcon('type')}</div>
                </th>
                <th className="py-3.5 px-4 select-none cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleSort('make')}>
                  <div className="flex items-center">Device {renderSortIcon('make')}</div>
                </th>
                <th className="py-3.5 px-4 select-none cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleSort('sn')}>
                  <div className="flex items-center">Serial Number {renderSortIcon('sn')}</div>
                </th>
                <th className="py-3.5 px-4 select-none cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleSort('user_name')}>
                  <div className="flex items-center">Assigned User {renderSortIcon('user_name')}</div>
                </th>
                <th className="py-3.5 px-4 select-none cursor-pointer hover:text-slate-800 transition-colors" onClick={() => handleSort('status')}>
                  <div className="flex items-center">Status {renderSortIcon('status')}</div>
                </th>
                <th className="py-3.5 px-5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                // Shimmer Loader Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5"><div className="h-4 bg-slate-200 rounded w-16" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-32" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-28" /></td>
                    <td className="py-4 px-4"><div className="h-5 bg-slate-200 rounded-full w-20" /></td>
                    <td className="py-4 px-5 text-right"><div className="h-8 bg-slate-200 rounded-lg w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <SlidersHorizontal className="w-8 h-8 opacity-30 text-indigo-600 animate-float" />
                      <p className="font-semibold text-slate-700">No assets found</p>
                      <p className="text-xs text-slate-400">Try adjusting your search queries or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr 
                    key={asset.id} 
                    className="hover:bg-slate-50/50 border-l-2 border-l-transparent hover:border-l-indigo-600 transition-all duration-150 group"
                  >
                    <td className="py-4 px-5">
                      <div className="flex items-center space-x-2 text-slate-700 font-semibold">
                        {asset.type === 'Laptop' ? (
                          <Laptop className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Monitor className="w-4 h-4 text-cyan-600" />
                        )}
                        <span>{asset.type}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-800">{asset.make}</div>
                      <div className="text-xs text-slate-500 font-normal">{asset.model}</div>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-650 text-xs tracking-wider">
                      {asset.sn}
                    </td>
                    <td className="py-4 px-4">
                      {asset.user_name ? (
                        <div>
                          <div className="text-slate-800 font-semibold">{asset.user_name}</div>
                          <div className="text-xs text-slate-500 font-normal">{asset.user_email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic font-normal">Unassigned</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(asset.status)}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end space-x-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onView(asset)}
                          title="View configuration and credentials"
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-500/50 hover:text-blue-600 text-slate-400 cursor-pointer active:scale-95 transition-all shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {userRole === 'admin' && (
                          <>
                            <button
                              onClick={() => onEdit(asset)}
                              title="Edit details"
                              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-500/50 hover:text-indigo-600 text-slate-400 cursor-pointer active:scale-95 transition-all shadow-sm"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDelete(asset.id)}
                              title="Delete asset"
                              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-rose-500/50 hover:text-rose-600 text-slate-400 cursor-pointer active:scale-95 transition-all shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

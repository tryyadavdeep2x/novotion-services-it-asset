import React, { useState, useEffect } from 'react';
import { 
  X, 
  Key, 
  Cpu, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Calendar, 
  User, 
  Mail, 
  History,
  Info
} from 'lucide-react';
import type { Asset, ActivityLog } from '../types';

interface AssetDetailProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  logs: ActivityLog[];
}

export const AssetDetail: React.FC<AssetDetailProps> = ({
  isOpen,
  onClose,
  asset,
  logs
}) => {
  const [revealPassword, setRevealPassword] = useState(false);
  const [revealEmailPassword, setRevealEmailPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setRevealPassword(false);
    setRevealEmailPassword(false);
    setCopiedField(null);
  }, [asset, isOpen]);

  if (!isOpen || !asset) return null;

  // Filter logs for this specific asset
  const assetLogs = logs.filter(log => log.asset_id === asset.id);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const getStatusBadgeClass = (status: Asset['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'In Stock':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Maintenance':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Retired':
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
      <div 
        className="w-full max-w-xl glass-panel border border-slate-200 rounded-2xl shadow-2xl relative flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <span className={`w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse`} />
            <h2 className="text-base font-bold text-slate-800 font-heading">Asset Profile & Credentials</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 hover:text-slate-700 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Device Brand Header */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-indigo-700 uppercase bg-indigo-50 px-2 py-0.5 rounded tracking-wider border border-indigo-100/50">
                {asset.type}
              </span>
              <h1 className="text-2xl font-bold text-slate-800 mt-1.5 font-heading">
                {asset.make} <span className="font-light text-slate-500">{asset.model}</span>
              </h1>
              <div className="text-xs text-slate-550 mt-1 flex items-center">
                <span className="font-semibold text-slate-550 mr-1.5 uppercase font-mono">S/N:</span>
                <span className="font-mono text-slate-650 font-bold select-all">{asset.sn}</span>
                <button 
                  onClick={() => copyToClipboard(asset.sn, 'sn')}
                  className="ml-2 p-1 rounded hover:bg-slate-100 hover:text-indigo-650 text-slate-400 transition-colors cursor-pointer"
                  title="Copy Serial Number"
                >
                  {copiedField === 'sn' ? <Check className="w-3.5 h-3.5 text-emerald-650 font-bold" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(asset.status)}`}>
              {asset.status}
            </span>
          </div>

          {/* Section 2: User Details */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <User className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
              Assigned User Profile
            </h3>
            {asset.user_name ? (
              <div className="space-y-2">
                <div className="flex items-center text-sm font-semibold text-slate-700">
                  <span className="w-20 text-slate-400 font-normal">Name:</span>
                  <span>{asset.user_name}</span>
                </div>
                <div className="flex items-center text-sm font-semibold text-slate-700">
                  <span className="w-20 text-slate-400 font-normal">Email:</span>
                  <span className="text-indigo-600 flex items-center font-bold">
                    <Mail className="w-3.5 h-3.5 mr-1" />
                    {asset.user_email}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-slate-500 text-xs italic font-light p-1">
                <Info className="w-4 h-4 mr-2" />
                This asset is currently in inventory and not assigned to any user.
              </div>
            )}
          </div>

          {/* Section 3: Password & Configuration */}
          <div className="grid grid-cols-1 gap-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PC Password Card */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                    <Key className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                    User PC Password
                  </h3>
                  {asset.password && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setRevealPassword(!revealPassword)}
                        className="p-1 rounded hover:bg-slate-100 hover:text-slate-700 text-slate-400 cursor-pointer"
                        title={revealPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {revealPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(asset.password || '', 'pwd')}
                        className="p-1 rounded hover:bg-slate-100 hover:text-slate-700 text-slate-400 cursor-pointer"
                        title="Copy Password"
                      >
                        {copiedField === 'pwd' ? <Check className="w-3.5 h-3.5 text-emerald-650" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {asset.password ? (
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg font-mono text-center font-bold tracking-wider text-sm select-all">
                    {revealPassword ? (
                      <span className="text-indigo-700">{asset.password}</span>
                    ) : (
                      <span className="text-slate-300 font-sans tracking-widest font-black">•••••••••••••</span>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs italic font-light p-1">No login password configured.</div>
                )}
              </div>

              {/* Email Password Card */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                    <Key className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                    User Email Password
                  </h3>
                  {asset.email_password && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setRevealEmailPassword(!revealEmailPassword)}
                        className="p-1 rounded hover:bg-slate-100 hover:text-slate-700 text-slate-400 cursor-pointer"
                        title={revealEmailPassword ? 'Hide Email Password' : 'Show Email Password'}
                      >
                        {revealEmailPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(asset.email_password || '', 'emailPwd')}
                        className="p-1 rounded hover:bg-slate-100 hover:text-slate-700 text-slate-400 cursor-pointer"
                        title="Copy Email Password"
                      >
                        {copiedField === 'emailPwd' ? <Check className="w-3.5 h-3.5 text-emerald-650" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {asset.email_password ? (
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg font-mono text-center font-bold tracking-wider text-sm select-all">
                    {revealEmailPassword ? (
                      <span className="text-indigo-700">{asset.email_password}</span>
                    ) : (
                      <span className="text-slate-300 font-sans tracking-widest font-black">•••••••••••••</span>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs italic font-light p-1">No email password configured.</div>
                )}
              </div>
            </div>

            {/* Hardware Configuration Card */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 shadow-sm">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                <Cpu className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                PC Configuration details
              </h3>
              {asset.configuration ? (
                <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-normal leading-relaxed whitespace-pre-line font-mono">
                  {asset.configuration}
                </div>
              ) : (
                <div className="text-slate-400 text-xs italic font-light p-1">No hardware configuration described.</div>
              )}
            </div>
          </div>

          {/* Section 4: History Logs */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <History className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
              Asset Audit Trail
            </h3>
            {assetLogs.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {assetLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-white border border-slate-200/60 rounded-lg text-xs flex justify-between gap-4 shadow-sm">
                    <span className="text-slate-700 font-normal leading-snug">{log.details}</span>
                    <span className="text-slate-400 text-[10px] whitespace-nowrap self-start">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-xs italic font-light p-1">No logs available for this asset.</div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200/80 bg-slate-50 text-xs text-slate-500">
          <span className="flex items-center font-medium">
            <Calendar className="w-3 h-3 mr-1" />
            Registered: {new Date(asset.created_at).toLocaleDateString()}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-650 font-bold rounded-lg cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

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
  Info,
  Monitor,
  Keyboard,
  Headphones,
  Layers
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
        return 'bg-blue-500/20 text-[#38bdf8] border-blue-500/40';
      case 'In Stock':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Maintenance':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'Retired':
        return 'bg-white/5 text-white/50 border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all select-none">
      <div 
        className="w-full max-w-xl glass-panel border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(56,189,248,0.25)] relative flex flex-col max-h-[85vh] overflow-hidden bg-slate-950/70 backdrop-blur-3xl animate-modal-bounce"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/30">
          <div className="flex items-center space-x-2.5">
            <span className={`w-2.5 h-2.5 rounded-full bg-[#38bdf8] animate-pulse`} />
            <h2 className="text-base font-black text-white font-heading uppercase tracking-tight">Asset Profile & Credentials</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 hover:text-white text-white/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Device Brand Header */}
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-extrabold text-[#38bdf8] uppercase bg-[#38bdf8]/10 px-2 py-0.5 rounded tracking-widest border border-[#38bdf8]/20">
                {asset.type}
              </span>
              <h1 className="text-2xl font-black text-white mt-1.5 font-heading">
                {asset.make} <span className="font-light text-white/60">{asset.model}</span>
              </h1>
              <div className="text-xs text-white/40 mt-1 flex items-center">
                <span className="font-semibold mr-1.5 uppercase font-mono">S/N:</span>
                <span className="font-mono text-white font-extrabold select-all">{asset.sn}</span>
                <button 
                  onClick={() => copyToClipboard(asset.sn, 'sn')}
                  className="ml-2 p-1 rounded hover:bg-white/5 hover:text-[#38bdf8] text-white/55 transition-colors cursor-pointer"
                  title="Copy Serial Number"
                >
                  {copiedField === 'sn' ? <Check className="w-3.5 h-3.5 text-emerald-450 font-black" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(asset.status)}`}>
              {asset.status}
            </span>
          </div>

          {/* Section 2: User Details */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 shadow-sm">
            <h3 className="text-xs font-black text-[#38bdf8] uppercase tracking-widest flex items-center">
              <User className="w-3.5 h-3.5 mr-1.5" />
              Assigned User Profile
            </h3>
            {asset.user_name ? (
              <div className="space-y-2">
                <div className="flex items-center text-sm font-semibold text-white">
                  <span className="w-20 text-white/50 font-normal">Name:</span>
                  <span className="font-extrabold text-white">{asset.user_name}</span>
                </div>
                <div className="flex items-center text-sm font-semibold text-white">
                  <span className="w-20 text-white/50 font-normal">Email:</span>
                  <span className="text-[#38bdf8] flex items-center font-black">
                    <Mail className="w-3.5 h-3.5 mr-1 text-[#38bdf8]" />
                    {asset.user_email}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center text-white/50 text-xs italic font-light p-1">
                <Info className="w-4 h-4 mr-2 text-white/40" />
                This asset is currently in inventory and not assigned to any user.
              </div>
            )}
          </div>

          {/* Section 3: Password & Configuration */}
          <div className="grid grid-cols-1 gap-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* PC Password Card */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-white/50 uppercase tracking-widest flex items-center">
                    <Key className="w-3.5 h-3.5 text-[#38bdf8] mr-1.5 animate-key-pulse" />
                    User PC Password
                  </h3>
                  {asset.password && asset.password !== '[Access Restricted]' && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setRevealPassword(!revealPassword)}
                        className="p-1 rounded hover:bg-white/5 hover:text-white text-white/50 cursor-pointer"
                        title={revealPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {revealPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(asset.password || '', 'pwd')}
                        className="p-1 rounded hover:bg-white/5 hover:text-white text-white/50 cursor-pointer"
                        title="Copy Password"
                      >
                        {copiedField === 'pwd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {asset.password ? (
                  <div className="p-2.5 bg-black/30 border border-white/10 rounded-lg font-mono text-center font-bold tracking-wider text-sm select-all">
                    {asset.password === '[Access Restricted]' ? (
                      <span className="text-white/40 italic font-sans font-normal text-xs">{asset.password}</span>
                    ) : revealPassword ? (
                      <span className="text-[#38bdf8]">{asset.password}</span>
                    ) : (
                      <span className="text-white/20 font-sans tracking-widest font-black">•••••••••••••</span>
                    )}
                  </div>
                ) : (
                  <div className="text-white/40 text-xs italic font-light p-1">No login password configured.</div>
                )}
              </div>

              {/* Email Password Card */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-white/50 uppercase tracking-widest flex items-center">
                    <Key className="w-3.5 h-3.5 text-[#38bdf8] mr-1.5 animate-key-pulse" />
                    User Email Password
                  </h3>
                  {asset.email_password && asset.email_password !== '[Access Restricted]' && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setRevealEmailPassword(!revealEmailPassword)}
                        className="p-1 rounded hover:bg-white/5 hover:text-white text-white/50 cursor-pointer"
                        title={revealEmailPassword ? 'Hide Email Password' : 'Show Email Password'}
                      >
                        {revealEmailPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(asset.email_password || '', 'emailPwd')}
                        className="p-1 rounded hover:bg-white/5 hover:text-white text-white/50 cursor-pointer"
                        title="Copy Email Password"
                      >
                        {copiedField === 'emailPwd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>

                {asset.email_password ? (
                  <div className="p-2.5 bg-black/30 border border-white/10 rounded-lg font-mono text-center font-bold tracking-wider text-sm select-all">
                    {asset.email_password === '[Access Restricted]' ? (
                      <span className="text-white/40 italic font-sans font-normal text-xs">{asset.email_password}</span>
                    ) : revealEmailPassword ? (
                      <span className="text-[#38bdf8]">{asset.email_password}</span>
                    ) : (
                      <span className="text-white/20 font-sans tracking-widest font-black">•••••••••••••</span>
                    )}
                  </div>
                ) : (
                  <div className="text-white/40 text-xs italic font-light p-1">No email password configured.</div>
                )}
              </div>
            </div>

            {/* Hardware Configuration Card */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-2 shadow-sm">
              <h3 className="text-xs font-black text-white/50 uppercase tracking-widest flex items-center">
                <Cpu className="w-3.5 h-3.5 text-[#38bdf8] mr-1.5" />
                PC Configuration details
              </h3>
              {asset.configuration ? (
                <div className="p-3 bg-black/30 border border-white/10 rounded-lg text-white/90 text-xs font-normal leading-relaxed whitespace-pre-line font-mono">
                  {asset.configuration}
                </div>
              ) : (
                <div className="text-white/40 text-xs italic font-light p-1">No hardware configuration described.</div>
              )}
            </div>
          </div>

          {/* Section 3.5: Linked Peripherals & Accessories */}
          {(asset.monitor || asset.keyboard_mouse || asset.headphone) && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 shadow-sm">
              <h3 className="text-xs font-black text-[#38bdf8] uppercase tracking-widest flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1.5 text-[#38bdf8]" />
                Assigned Accessories & Peripherals
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {asset.monitor && (
                  <div className="p-2.5 bg-black/35 border border-white/5 rounded-lg flex flex-col justify-between">
                    <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-wider flex items-center mb-1">
                      <Monitor className="w-3.5 h-3.5 text-[#38bdf8] mr-1" /> Monitor
                    </span>
                    <span className="text-xs font-extrabold text-white leading-tight">{asset.monitor}</span>
                  </div>
                )}
                {asset.keyboard_mouse && (
                  <div className="p-2.5 bg-black/35 border border-white/5 rounded-lg flex flex-col justify-between">
                    <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-wider flex items-center mb-1">
                      <Keyboard className="w-3.5 h-3.5 text-[#38bdf8] mr-1" /> Keyboard/Mouse
                    </span>
                    <span className="text-xs font-extrabold text-white leading-tight">{asset.keyboard_mouse}</span>
                  </div>
                )}
                {asset.headphone && (
                  <div className="p-2.5 bg-black/35 border border-white/5 rounded-lg flex flex-col justify-between">
                    <span className="text-[9px] font-extrabold text-white/40 uppercase tracking-wider flex items-center mb-1">
                      <Headphones className="w-3.5 h-3.5 text-[#38bdf8] mr-1" /> Headphones
                    </span>
                    <span className="text-xs font-extrabold text-white leading-tight">{asset.headphone}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 4: History Logs */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-white/50 uppercase tracking-widest flex items-center">
              <History className="w-3.5 h-3.5 text-[#38bdf8] mr-1.5" />
              Asset Audit Trail
            </h3>
            {assetLogs.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {assetLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-black/30 border border-white/10 rounded-lg text-xs flex justify-between gap-4 shadow-sm">
                    <span className="text-white/80 font-normal leading-snug">{log.details}</span>
                    <span className="text-white/40 text-[10px] whitespace-nowrap self-start">
                      {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/40 text-xs italic font-light p-1">No logs available for this asset.</div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-slate-950/30 text-xs text-white/50">
          <span className="flex items-center font-medium">
            <Calendar className="w-3 h-3 mr-1 text-[#38bdf8]" />
            Registered: {new Date(asset.created_at).toLocaleDateString()}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-lg cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

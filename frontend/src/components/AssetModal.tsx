import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import type { Asset } from '../types';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assetData: Partial<Asset>) => Promise<boolean>;
  asset: Asset | null; // Null when adding, defined when editing
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  asset
}) => {
  const [type, setType] = useState<'Laptop' | 'Desktop'>('Laptop');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [sn, setSn] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [password, setPassword] = useState('');
  const [configuration, setConfiguration] = useState('');
  const [status, setStatus] = useState<Asset['status']>('Active');
  
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (asset) {
      setType(asset.type);
      setMake(asset.make);
      setModel(asset.model);
      setSn(asset.sn);
      setUserName(asset.user_name || '');
      setUserEmail(asset.user_email || '');
      setEmailPassword(asset.email_password || '');
      setPassword(asset.password || '');
      setConfiguration(asset.configuration || '');
      setStatus(asset.status);
    } else {
      // Reset to defaults
      setType('Laptop');
      setMake('');
      setModel('');
      setSn('');
      setUserName('');
      setUserEmail('');
      setEmailPassword('');
      setPassword('');
      setConfiguration('');
      setStatus('Active');
    }
    setError(null);
  }, [asset, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simple validations
    if (!make.trim()) return setError('Manufacturer (Make) is required');
    if (!model.trim()) return setError('Device Model is required');
    if (!sn.trim()) return setError('Serial Number (SN) is required');

    setSaving(true);
    const success = await onSave({
      type,
      make: make.trim(),
      model: model.trim(),
      sn: sn.trim().toUpperCase(),
      user_name: userName.trim() || null,
      user_email: userEmail.trim() || null,
      password: password.trim() || null,
      email_password: emailPassword.trim() || null,
      configuration: configuration.trim() || null,
      status
    });
    setSaving(false);

    if (success) {
      onClose();
    } else {
      setError('An error occurred. Check if the Serial Number is unique.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all select-none">
      <div 
        className="w-full max-w-2xl glass-panel border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(56,189,248,0.25)] relative flex flex-col max-h-[90vh] overflow-hidden bg-slate-950/70 backdrop-blur-3xl animate-modal-bounce"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/30">
          <h2 className="text-base font-black text-white font-heading uppercase tracking-tight">
            {asset ? 'Edit IT Asset Details' : 'Register New IT Asset'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/5 hover:text-white text-white/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-center space-x-2 text-rose-450 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Type, Make, Model */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-white/50 text-[10px] font-extrabold uppercase tracking-widest mb-2">Asset Type</label>
              <div className="flex bg-white/5 border border-white/12 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setType('Laptop')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    type === 'Laptop' 
                      ? 'bg-gradient-to-r from-[#0066ff] to-[#38bdf8] text-white shadow-sm' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Laptop
                </button>
                <button
                  type="button"
                  onClick={() => setType('Desktop')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    type === 'Desktop' 
                      ? 'bg-gradient-to-r from-[#0066ff] to-[#38bdf8] text-white shadow-sm' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  Desktop
                </button>
              </div>
            </div>

            <div>
              <label className="block text-white/50 text-[10px] font-extrabold uppercase tracking-widest mb-2">Manufacturer (Make) *</label>
              <input
                type="text"
                placeholder="e.g. Apple, Dell, Lenovo"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/12 rounded-xl text-white placeholder-white/40 text-sm focus:border-[#38bdf8] outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-white/50 text-[10px] font-extrabold uppercase tracking-widest mb-2">Model Name *</label>
              <input
                type="text"
                placeholder="e.g. MacBook Pro, Latitude 5440"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/12 rounded-xl text-white placeholder-white/40 text-sm focus:border-[#38bdf8] outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Row 2: SN & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 text-[10px] font-extrabold uppercase tracking-widest mb-2">Serial Number (S/N) *</label>
              <input
                type="text"
                placeholder="e.g. SN-DEL-12345"
                value={sn}
                onChange={(e) => setSn(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/12 rounded-xl text-white placeholder-white/40 text-sm focus:border-[#38bdf8] outline-none font-mono uppercase tracking-wide transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-white/50 text-[10px] font-extrabold uppercase tracking-widest mb-2">Asset Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Asset['status'])}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/12 rounded-xl text-white text-sm focus:border-[#38bdf8] outline-none cursor-pointer font-bold transition-all"
              >
                <option value="Active" className="bg-slate-950 text-white font-normal">Active</option>
                <option value="In Stock" className="bg-slate-950 text-white font-normal">In Stock</option>
                <option value="Maintenance" className="bg-slate-950 text-white font-normal">Maintenance</option>
                <option value="Retired" className="bg-slate-950 text-white font-normal">Retired</option>
              </select>
            </div>
          </div>

          {/* Row 3: User Assignment (Optional) */}
          <div className="p-4 bg-white/5 border border-white/12 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-xs font-black text-[#38bdf8] uppercase tracking-widest">User Assignment (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-white/50 text-xs font-medium mb-1.5">User Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alice Smith"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/12 rounded-xl text-white placeholder-white/40 text-sm focus:border-[#38bdf8] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-white/50 text-xs font-medium mb-1.5">User Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. alice.smith@novotion.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/12 rounded-xl text-white placeholder-white/40 text-sm focus:border-[#38bdf8] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-white/50 text-xs font-medium mb-1.5">User Email Password</label>
                <input
                  type="text"
                  placeholder="Set email password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white/5 border border-white/12 rounded-xl text-white placeholder-white/40 text-sm focus:border-[#38bdf8] outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Password and PC Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-[10px] font-extrabold uppercase tracking-widest mb-2">User PC Password</label>
              <input
                type="text"
                placeholder="Set device admin/login password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/12 rounded-xl text-white placeholder-white/40 text-sm focus:border-[#38bdf8] outline-none font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-white/50 text-[10px] font-extrabold uppercase tracking-widest mb-2">Hardware Configuration Details</label>
              <textarea
                placeholder="e.g. Intel i7, 32GB RAM, 1TB NVMe SSD, Windows 11 Pro, RTX 4060 GPU"
                value={configuration}
                onChange={(e) => setConfiguration(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-white/5 border border-white/12 rounded-xl text-white placeholder-white/40 text-sm focus:border-[#38bdf8] outline-none font-normal resize-none leading-relaxed transition-all"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-white/10 bg-slate-950/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/5 border border-white/12 hover:bg-white/10 text-white text-sm font-semibold rounded-xl cursor-pointer active:scale-95 transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-[#0066ff] to-[#38bdf8] hover:from-[#38bdf8] hover:to-[#0066ff] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4 text-white" />
            <span>{saving ? 'Saving...' : 'Save Asset'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

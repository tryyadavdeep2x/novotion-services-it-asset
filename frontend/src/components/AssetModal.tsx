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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
      <div 
        className="w-full max-w-2xl glass-panel border border-slate-200 rounded-2xl shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 font-heading">
            {asset ? 'Edit IT Asset Details' : 'Register New IT Asset'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 hover:text-slate-700 text-slate-400 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center space-x-2 text-rose-700 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Type, Make, Model */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Asset Type</label>
              <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setType('Laptop')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    type === 'Laptop' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Laptop
                </button>
                <button
                  type="button"
                  onClick={() => setType('Desktop')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    type === 'Desktop' 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Desktop
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Manufacturer (Make) *</label>
              <input
                type="text"
                placeholder="e.g. Apple, Dell, Lenovo"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-indigo-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Model Name *</label>
              <input
                type="text"
                placeholder="e.g. MacBook Pro, Latitude 5440"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-indigo-500 outline-none"
                required
              />
            </div>
          </div>

          {/* Row 2: SN & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Serial Number (S/N) *</label>
              <input
                type="text"
                placeholder="e.g. SN-DEL-12345"
                value={sn}
                onChange={(e) => setSn(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-indigo-500 outline-none font-mono uppercase tracking-wide"
                required
              />
            </div>

            <div>
              <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Asset Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Asset['status'])}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="Active" className="bg-white">Active</option>
                <option value="In Stock" className="bg-white">In Stock</option>
                <option value="Maintenance" className="bg-white">Maintenance</option>
                <option value="Retired" className="bg-white">Retired</option>
              </select>
            </div>
          </div>

          {/* Row 3: User Assignment (Optional) */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700">User Assignment (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1.5">User Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alice Smith"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1.5">User Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. alice.smith@novotion.com"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-xs font-medium mb-1.5">User Email Password</label>
                <input
                  type="text"
                  placeholder="Set email password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Row 4: Password and PC Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">User PC Password</label>
              <input
                type="text"
                placeholder="Set device admin/login password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-indigo-500 outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Hardware Configuration Details</label>
              <textarea
                placeholder="e.g. Intel i7, 32GB RAM, 1TB NVMe SSD, Windows 11 Pro, RTX 4060 GPU"
                value={configuration}
                onChange={(e) => setConfiguration(e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-indigo-500 outline-none font-normal resize-none"
              />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 border-t border-slate-200/80 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl cursor-pointer active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center space-x-1.5 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow shadow-indigo-500/5 hover:shadow-indigo-500/10 active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Asset'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

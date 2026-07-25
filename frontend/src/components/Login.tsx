import React, { useState } from 'react';
import { User, Mail, Lock, Shield, AlertCircle, FileText, CheckCircle2, X } from 'lucide-react';
import type { UserSession } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserSession) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false); // Controls sliding (false = Login, true = Ticket)
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Support Ticket form state
  const [ticketName, setTicketName] = useState('');
  const [ticketEmail, setTicketEmail] = useState('');
  const [ticketSn, setTicketSn] = useState('');
  const [ticketDescription, setTicketDescription] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginInput.trim() || !loginPassword.trim()) {
      return setError('Please enter both username/email and password.');
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: loginInput.trim(),
          password: loginPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      onLoginSuccess(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ticketName.trim() || !ticketEmail.trim() || !ticketSn.trim() || !ticketDescription.trim()) {
      return setError('Please fill in all ticket details.');
    }

    setLoading(true);
    const generatedId = `TICK-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const res = await fetch(`${API_BASE}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: ticketName.trim(),
          email: ticketEmail.trim(),
          sn: ticketSn.trim().toUpperCase(),
          description: ticketDescription.trim(),
          ticketId: generatedId
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit support ticket');
      }

      // Show success modal
      setCreatedTicketId(generatedId);

      // Reset ticket fields
      setTicketName('');
      setTicketEmail('');
      setTicketSn('');
      setTicketDescription('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Submission failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Background Mesh Orbs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-indigo-500/10 via-sky-500/5 to-purple-500/10" />
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-400/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/10 blur-[120px] rounded-full" />

      {/* Main Card Container */}
      <div className="w-full max-w-4xl h-[560px] bg-white rounded-3xl border border-slate-200/60 shadow-[0_20px_50px_rgba(2,132,199,0.06)] relative overflow-hidden flex transition-all duration-500 hover:shadow-[0_25px_60px_rgba(2,132,199,0.12)] hover:border-sky-500/20">
        
        {/* Forms Container */}
        <div className="w-full h-full flex relative z-10">
          
          {/* Sign In Form (Left Half) */}
          <div className={`w-1/2 h-full flex flex-col justify-center px-12 transition-all duration-600 ease-in-out ${
            isSignUp ? 'opacity-0 translate-x-[20%] pointer-events-none' : 'opacity-100 translate-x-0'
          }`}>
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="flex items-center space-x-2.5 mb-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white shadow shadow-sky-500/20">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="text-slate-900 font-bold tracking-tight text-sm uppercase tracking-widest font-heading">
                  Novotion IT Admin
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight font-heading">Sign In</h2>
                <p className="text-slate-500 text-xs mt-1">Access the central asset infrastructure registry</p>
              </div>

              {error && !isSignUp && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-2 text-rose-700 text-xs font-semibold animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3.5">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Username or Email"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-sky-500 focus:bg-white outline-none"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-sky-500 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-sky-500/10 active:scale-[0.98] transition-all"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>

              <div className="text-center mt-4">
                <span className="text-xs text-slate-500">Need Support? </span>
                <button
                  type="button"
                  onClick={() => { setIsSignUp(true); setError(null); }}
                  className="text-xs text-sky-600 font-bold hover:text-sky-500 underline cursor-pointer"
                >
                  Raise Ticket
                </button>
              </div>
            </form>
          </div>

          {/* IT Ticket Form (Right Half) */}
          <div className={`w-1/2 h-full flex flex-col justify-center px-12 transition-all duration-600 ease-in-out ${
            isSignUp ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-[20%] pointer-events-none'
          }`}>
            <form onSubmit={handleTicketSubmit} className="space-y-3.5">
              <div className="flex items-center space-x-2.5 mb-1">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow shadow-indigo-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-slate-900 font-bold tracking-tight text-sm uppercase tracking-widest font-heading">
                  Novotion Systems
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight font-heading">Raise an IT Ticket</h2>
                <p className="text-slate-500 text-xs mt-0.5">Submit your issue to get assistance from the IT team.</p>
              </div>

              {error && isSignUp && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center space-x-2 text-rose-700 text-xs font-semibold animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2.5">
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-sky-500 focus:bg-white outline-none"
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={ticketEmail}
                    onChange={(e) => setTicketEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-sky-500 focus:bg-white outline-none"
                  />
                </div>

                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="System Serial Number (S/N)"
                    value={ticketSn}
                    onChange={(e) => setTicketSn(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-sky-500 focus:bg-white outline-none uppercase font-mono tracking-wide"
                  />
                </div>

                <div className="relative">
                  <textarea
                    required
                    placeholder="Issue Description (Specify details...)"
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    rows={2.5}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:border-sky-500 focus:bg-white outline-none resize-none leading-relaxed"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md shadow-sky-500/10 active:scale-[0.98] transition-all"
              >
                {loading ? 'Submitting Ticket...' : 'Submit Ticket'}
              </button>

              <div className="text-center mt-3">
                <button
                  type="button"
                  onClick={() => { setIsSignUp(false); setError(null); }}
                  className="text-xs text-sky-600 font-bold hover:text-sky-500 underline cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Sliding Graphic Overlay Banner */}
        <div className={`hidden md:block absolute top-0 w-1/2 h-full transition-transform duration-600 ease-in-out z-20 ${
          isSignUp ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {/* Overlay Inner Container */}
          <div className="relative w-full h-full bg-gradient-to-br from-sky-600 via-sky-500 to-indigo-600 text-white flex flex-col justify-center items-center px-12 text-center overflow-hidden">
            
            {/* Background vector glow circles */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-white/10 blur-[80px] rounded-full" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-sky-300/20 blur-[80px] rounded-full" />

            {/* Sliding Content */}
            <div className={`transition-all duration-500 delay-100 flex flex-col items-center ${
              isSignUp ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-95 translate-x-[-15%] pointer-events-none'
            }`}>
              <h2 className="text-3xl font-extrabold font-heading">Need Support?</h2>
              <p className="text-sky-100 text-sm mt-3.5 mb-8 font-light leading-relaxed max-w-[280px]">
                Facing an issue with your device? Raise a ticket directly to the IT support team.
              </p>
              <button
                onClick={() => { setIsSignUp(false); setError(null); }}
                className="px-8 py-2.5 border border-white hover:bg-white hover:text-sky-650 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer active:scale-95 shadow-sm"
              >
                Return to Sign In
              </button>
            </div>

            <div className={`absolute transition-all duration-500 delay-100 flex flex-col items-center ${
              isSignUp ? 'opacity-0 scale-95 translate-x-[15%] pointer-events-none' : 'opacity-100 scale-100 translate-x-0'
            }`}>
              <h2 className="text-3xl font-extrabold font-heading">Need Support?</h2>
              <p className="text-sky-100 text-sm mt-3.5 mb-8 font-light leading-relaxed max-w-[280px]">
                Facing an issue with your device? Raise a ticket directly to the IT support team.
              </p>
              <button
                onClick={() => { setIsSignUp(true); setError(null); }}
                className="px-8 py-2.5 border border-white hover:bg-white hover:text-sky-650 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer active:scale-95 shadow-sm"
              >
                Raise Ticket
              </button>
            </div>

          </div>
        </div>

      </div>

      {/* Success Ticket Confirmation Popup Modal */}
      {createdTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl p-6 relative overflow-hidden flex flex-col space-y-4">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-sky-500 to-indigo-500" />
            
            <button 
              onClick={() => setCreatedTicketId(null)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 text-emerald-600 pt-1">
              <div className="p-2.5 rounded-2xl bg-emerald-50 border border-emerald-100 shadow-sm flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 font-heading">Ticket Submitted!</h2>
            </div>

            <div className="text-slate-600 text-sm leading-relaxed space-y-3">
              <p>
                Support Ticket <span className="font-mono bg-sky-55/60 border border-sky-100 text-sky-700 font-bold px-2 py-0.5 rounded text-xs select-all">#{createdTicketId}</span> has been created successfully.
              </p>
              <p className="text-xs text-slate-500">
                Our IT Support Team has received your request and will contact you shortly via email.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => { setCreatedTicketId(null); setIsSignUp(false); }}
                className="px-5 py-2 bg-gradient-to-r from-sky-600 to-indigo-650 hover:from-sky-500 hover:to-indigo-550 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-sky-500/10 active:scale-95 transition-all cursor-pointer"
              >
                Okay, Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

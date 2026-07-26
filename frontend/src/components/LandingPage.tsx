import React, { useState } from 'react';
import { YieldCalculator } from './YieldCalculator';
import { 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Cpu, 
  Globe2, 
  Send, 
  CheckCircle2, 
  ArrowUpRight, 
  FileCheck2,
  ChevronDown,
  Laptop
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToItHub: () => void;
  assetCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToItHub, assetCount }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const partners = [
    { name: 'SOC 2 CERTIFIED', icon: ShieldCheck },
    { name: 'ISO 27001 SECURE', icon: FileCheck2 },
    { name: 'GDPR COMPLIANT', icon: Globe2 },
    { name: 'STRIPE FINTECH', icon: Layers },
    { name: 'AWS PARTNER', icon: Cpu },
    { name: 'VERCEL TEAM', icon: ArrowUpRight }
  ];

  return (
    <div className="space-y-0 pb-16 animate-fade-in select-none">
      
      {/* 1. Immersive Full-Viewport Hero Section with Video */}
      <section className="relative w-full h-screen overflow-hidden -mt-24 flex items-center justify-start px-6 sm:px-12 md:px-24">
        
        {/* Full-bleed HTML5 Video Background */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        >
          <source 
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260511_131941_d136af49-e243-493a-be14-6ff3f24e09e6.mp4" 
            type="video/mp4" 
          />
        </video>

        {/* Cinematic dark gradient overlay for high text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/30 via-[#0a0a0a]/50 to-[#0a0a0a] z-10" />

        {/* Hero Left Stack Content */}
        <div className="relative z-20 max-w-2xl flex flex-col space-y-6 pt-16 select-none">
          {/* Metadata Wide Tagline */}
          <span className="text-[10px] text-[#ff5e00] font-black uppercase tracking-[0.4em]">
            SECURE INFRASTRUCTURE / CAPITAL LOGISTICS
          </span>

          {/* Massive 72px tight letter-spacing Header */}
          <h1 className="text-4xl sm:text-7xl font-black text-white leading-[1.0] tracking-[-0.05em] font-heading uppercase">
            Smarter Capital<br />
            Allocation.<br />
            Seamless Growth.
          </h1>

          {/* Muted 18px description paragraph */}
          <p className="text-white/60 text-base sm:text-lg max-w-[450px] leading-[1.6] font-normal">
            Deploy capital with automated compliance audits, algorithmic risk mitigation, and real-time yield optimization. Seamlessly manage security controls and physical hardware infrastructure.
          </p>

          {/* Side-by-Side Glassmorphic CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => {
                const calculator = document.getElementById('yield-optimizer');
                if (calculator) calculator.scrollIntoView({ behavior: 'smooth' });
              }}
              className="glass-btn rounded-full px-8 py-3.5 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Optimize Capital</span>
              <ArrowRight className="w-4.5 h-4.5 text-[#ff5e00]" />
            </button>
            
            <button 
              onClick={onNavigateToItHub}
              className="glass-btn rounded-full px-8 py-3.5 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Configure IT Hub</span>
              <Laptop className="w-4.5 h-4.5 text-[#ff5e00]" />
            </button>
          </div>
        </div>

        {/* Absolute positioned Bottom Status Bar & Indicator */}
        <div className="absolute bottom-10 left-6 sm:left-12 md:left-24 right-6 sm:right-12 md:right-24 z-20 flex justify-between items-end border-t border-white/5 pt-6 select-none">
          {/* Left: Location/Brand info */}
          <div className="text-[11px] text-white/40 font-mono tracking-widest leading-relaxed uppercase">
            NOVOTION SERVICES INC. / NYC DIRECTORY<br />
            LATITUDE: 40.7128° N / LONGITUDE: 74.0060° W
          </div>

          {/* Right: Dynamic stat and animated arrow indicator */}
          <div className="flex items-center space-x-6">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">CURRENT AUDITED INDEX</span>
              <div className="text-white font-black text-sm tracking-tight font-heading mt-0.5">{assetCount} ACTIVE ASSETS</div>
            </div>

            <button 
              onClick={() => {
                const services = document.getElementById('services-grid');
                if (services) services.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-10 h-10 rounded-full border border-white/20 hover:border-white/50 flex items-center justify-center text-white cursor-pointer active:scale-95 transition-all select-none bg-black/20 backdrop-blur-md"
              title="Scroll Down"
            >
              <ChevronDown className="w-5 h-5 text-white animate-float-icon" />
            </button>
          </div>
        </div>

      </section>

      {/* 2. Bento Grid Section (Now Below the fold) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Total AUM */}
          <div className="glass-panel border border-white/10 rounded-3xl p-6 flex flex-col justify-between h-[240px] md:col-span-2 bg-black/40">
            <div>
              <span className="text-[10px] text-white/40 uppercase font-extrabold tracking-widest">AUM Metrics</span>
              <h3 className="text-3xl font-black text-white mt-2 font-heading tracking-tight">$48,290,140</h3>
              <p className="text-xs text-white/60 mt-1">Growth yield compounding at +8.4% APY compared to industry benchmark.</p>
            </div>
            
            {/* Real-time decorative mini stock curve */}
            <div className="w-full h-16 mt-4 opacity-70">
              <svg className="w-full h-full" viewBox="0 0 400 60" preserveAspectRatio="none">
                <path
                  d="M 0 50 Q 50 30 100 40 T 200 15 T 300 25 T 400 5"
                  fill="none"
                  stroke="#ff5e00"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 2: IT Infrastructure Health */}
          <div className="glass-panel border border-white/10 rounded-3xl p-6 flex flex-col justify-between h-[240px] bg-black/40 glass-panel-hover" onClick={onNavigateToItHub}>
            <div>
              <div className="flex justify-between items-start">
                <span className="text-[10px] text-white/40 uppercase font-extrabold tracking-widest">IT Operations</span>
                <span className="text-[9px] text-[#ff5e00] bg-[#ff5e00]/10 border border-[#ff5e00]/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  99.8% Online
                </span>
              </div>
              <h3 className="text-3xl font-black text-white mt-2 font-heading tracking-tight">{assetCount} Active</h3>
              <p className="text-xs text-white/60 mt-1">Laptops & desktops registered and audited inside your secure IT registry.</p>
            </div>
            
            <div className="flex items-center justify-between text-xs text-[#ff5e00] font-bold cursor-pointer group pt-4 border-t border-white/5">
              <span>Access IT Hub Registry</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
            </div>
          </div>

        </div>
      </section>

      {/* 3. Services Grid Section (Below the fold, 128px vertical padding) */}
      <section id="services-grid" className="bg-[#0a0a0a] py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            
            {/* Column 1: Small horizontal orange bar above massive 5xl heading */}
            <div className="flex flex-col space-y-4">
              <div className="w-12 h-1 bg-[#ff5e00] rounded-full" />
              <h2 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-[-0.05em] font-heading uppercase">
                Capital &<br />
                Asset Auditing.
              </h2>
            </div>

            {/* Column 2: Horizontal list of numbered tags followed by description */}
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4 text-[10px] font-extrabold tracking-[0.4em] text-white/45 uppercase border-b border-white/5 pb-4">
                <span>01 / BRADING</span>
                <span>02 / HARDWARE</span>
                <span>03 / COMPLIANCE</span>
              </div>
              <p className="text-white/60 text-lg leading-[1.6] font-normal">
                We integrate institutional compliance standards, hardware assets tracking, and automated auditing into your capital operations. Secure and audit your systems registry while maximizing performance.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Calculator Section */}
      <section id="yield-optimizer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-8 border-t border-white/5 scroll-mt-24">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading uppercase tracking-[-0.05em]">Compound Yield Simulation</h2>
          <p className="text-white/60 text-xs mt-1.5">Adjust asset parameters to review compound gains over the projection path.</p>
        </div>
        <YieldCalculator />
      </section>

      {/* 5. Compliance Partner logo Marquee */}
      <section className="w-full overflow-hidden border-y border-white/5 py-8 bg-black/40 relative">
        <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
          <span className="text-[10px] text-white/40 uppercase font-extrabold tracking-[0.4em]">
            Institutional Trust & Compliance Standards
          </span>
        </div>

        {/* Sliding Marquee */}
        <div className="flex overflow-hidden select-none">
          <div className="animate-marquee flex items-center space-x-12 pr-12">
            {partners.concat(partners).map((partner, index) => (
              <div key={index} className="flex items-center space-x-2.5 text-white/40 hover:text-white/80 transition-colors">
                <partner.icon className="w-5 h-5 text-[#ff5e00] opacity-80" />
                <span className="text-xs font-extrabold tracking-wider font-heading">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Oversized Footer & Newsletter */}
      <footer className="max-w-5xl mx-auto px-4 text-center py-20 space-y-12">
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-[-0.05em] leading-none font-heading uppercase">
            Ready to elevate your portfolio?
          </h2>
          <p className="text-white/65 text-xs max-w-md mx-auto">
            Subscribe to our weekly asset briefs to receive market updates and IT registry auditing alerts.
          </p>
        </div>

        <form onSubmit={handleSubscribeSubmit} className="max-w-md mx-auto relative flex items-center">
          <input
            type="email"
            required
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-4 pr-12 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-xs focus:border-[#ff5e00] focus:bg-black/50 outline-none shadow-sm"
          />
          <button
            type="submit"
            className="absolute right-1.5 p-2 bg-[#ff5e00] hover:bg-orange-500 text-white rounded-xl transition-all cursor-pointer active:scale-95 shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {subscribed && (
          <div className="p-3 max-w-sm mx-auto bg-[#ff5e00]/10 border border-[#ff5e00]/25 rounded-xl flex items-center space-x-2 text-[#ff5e00] text-xs font-semibold animate-fade-in shadow-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Subscribed successfully! Briefings incoming.</span>
          </div>
        )}

        <div className="pt-8 border-t border-white/5 text-[10px] text-white/40 font-medium">
          © {new Date().getFullYear()} Novotion Services Capital Management. All rights reserved. Registered compliance broker.
        </div>
      </footer>

    </div>
  );
};

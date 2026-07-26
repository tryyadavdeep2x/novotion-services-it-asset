import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';

export const YieldCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState<number>(50000); // Default $50,000
  const [apy, setApy] = useState<number>(12); // Default 12% APY
  const [years, setYears] = useState<number>(5); // Default 5 years

  const [futureValue, setFutureValue] = useState<number>(0);
  const [interest, setInterest] = useState<number>(0);
  const [chartPoints, setChartPoints] = useState<{ x: number; y: number }[]>([]);

  // Calculate compound interest and chart coordinates
  useEffect(() => {
    const fValue = principal * Math.pow(1 + apy / 100, years);
    setFutureValue(fValue);
    setInterest(fValue - principal);

    // Generate points for SVG path
    const pointsCount = 10;
    const points = [];
    const width = 450;
    const height = 180;
    const maxVal = principal * Math.pow(1 + apy / 100, Math.max(years, 10)); // Scale graph relative to max range

    for (let i = 0; i <= pointsCount; i++) {
      const yearFraction = (i / pointsCount) * years;
      const val = principal * Math.pow(1 + apy / 100, yearFraction);
      const x = (i / pointsCount) * width;
      // SVG Y coordinates start from top, so subtract from height
      const y = height - (val / maxVal) * (height - 20) - 10;
      points.push({ x, y });
    }
    setChartPoints(points);
  }, [principal, apy, years]);

  // Convert points array to SVG Path string
  const getSvgPath = () => {
    if (chartPoints.length === 0) return '';
    return chartPoints.reduce((acc, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      // Smooth curve calculation using cubic bezier
      const prev = chartPoints[index - 1];
      const cpX1 = prev.x + (point.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (point.x - prev.x) / 2;
      const cpY2 = point.y;
      return `${acc} C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${point.x} ${point.y}`;
    }, '');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="glass-panel border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden bg-black/40 select-none flex flex-col md:flex-row gap-8">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-orange-600 via-[#ff5e00] to-orange-400" />
      
      {/* Slider inputs (Left Side) */}
      <div className="flex-1 space-y-6">
        <div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[#ff5e00] animate-float" />
            <h3 className="text-lg font-bold text-white font-heading tracking-tight">Yield Optimizer</h3>
          </div>
          <p className="text-white/60 text-xs mt-1">Simulate compound growth and projected returns on capital allocation.</p>
        </div>

        <div className="space-y-4">
          {/* Principal Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-white/40">Initial Principal</span>
              <span className="text-white font-bold">{formatCurrency(principal)}</span>
            </div>
            <input
              type="range"
              min={10000}
              max={1000000}
              step={10000}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-none outline-none accent-[#ff5e00]"
              style={{
                background: `linear-gradient(to right, #ff5e00 0%, #ff5e00 ${(principal / 1000000) * 100}%, rgba(255,255,255,0.1) ${(principal / 1000000) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>

          {/* APY Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-white/40">Target Annual APY</span>
              <span className="text-[#ff5e00] font-bold">{apy}%</span>
            </div>
            <input
              type="range"
              min={3}
              max={25}
              step={0.5}
              value={apy}
              onChange={(e) => setApy(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-none outline-none accent-[#ff5e00]"
              style={{
                background: `linear-gradient(to right, #ff5e00 0%, #ff5e00 ${((apy - 3) / 22) * 100}%, rgba(255,255,255,0.1) ${((apy - 3) / 22) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>

          {/* Duration Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-white/40">Investment Period</span>
              <span className="text-white font-bold">{years} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-none outline-none accent-[#ff5e00]"
              style={{
                background: `linear-gradient(to right, #ff5e00 0%, #ff5e00 ${((years - 1) / 9) * 100}%, rgba(255,255,255,0.1) ${((years - 1) / 9) * 100}%, rgba(255,255,255,0.1) 100%)`
              }}
            />
          </div>
        </div>

        {/* Dynamic Outcomes */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/5">
          <div>
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Total Value</span>
            <div className="text-xl font-extrabold text-white mt-0.5 tracking-tight font-heading">{formatCurrency(futureValue)}</div>
          </div>
          <div>
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Interest Earned</span>
            <div className="text-xl font-extrabold text-[#ff5e00] mt-0.5 tracking-tight font-heading">+{formatCurrency(interest)}</div>
          </div>
        </div>
      </div>

      {/* SVG Chart display (Right Side) */}
      <div className="w-full md:w-[480px] h-[220px] bg-black/40 border border-white/5 rounded-2xl p-4 relative flex flex-col justify-between overflow-hidden">
        {/* Subtle grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
          <div className="border-b border-dashed border-white/10 w-full" />
          <div className="border-b border-dashed border-white/10 w-full" />
          <div className="border-b border-dashed border-white/10 w-full" />
          <div className="w-full" />
        </div>

        <div className="flex justify-between items-center z-10">
          <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-[#ff5e00] animate-pulse-glow" /> Projected Growth Path
          </span>
          <span className="text-[9px] text-[#ff5e00] font-bold bg-[#ff5e00]/10 border border-[#ff5e00]/20 px-2 py-0.5 rounded-full">
            {apy}% APY Curve
          </span>
        </div>

        {/* SVG Drawing Canvas */}
        <div className="flex-1 w-full h-[180px] mt-2 relative">
          <svg className="w-full h-full" viewBox="0 0 450 180" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff5e00" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ff5e00" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff7d33" />
                <stop offset="100%" stopColor="#ff5e00" />
              </linearGradient>
            </defs>

            {/* Filled Area */}
            {chartPoints.length > 0 && (
              <path
                d={`${getSvgPath()} L 450 180 L 0 180 Z`}
                fill="url(#chartGradient)"
                className="transition-all duration-300"
              />
            )}

            {/* Spline Curve Line */}
            <path
              d={getSvgPath()}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="transition-all duration-300"
            />

            {/* Draw Dot at the end of the curve */}
            {chartPoints.length > 0 && (
              <circle
                cx={chartPoints[chartPoints.length - 1].x}
                cy={chartPoints[chartPoints.length - 1].y}
                r="6"
                fill="#ff5e00"
                stroke="#ffffff"
                strokeWidth="2.5"
                className="transition-all duration-300 shadow-md shadow-orange-500/50"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};

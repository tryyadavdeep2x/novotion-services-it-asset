import React from 'react';
import type { DashboardStats } from '../types';

interface StatsChartsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const StatsCharts: React.FC<StatsChartsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse select-none">
        <div className="glass-panel border border-white/10 rounded-2xl p-6 h-64 bg-white/5" />
        <div className="glass-panel border border-white/10 rounded-2xl p-6 h-64 bg-white/5" />
      </div>
    );
  }

  // Calculate percentages for manufacturers
  const totalAssets = stats.total || 1;
  const sortedMakes = [...(stats.makeBreakdown || [])].sort((a, b) => b.count - a.count);

  // Status colors helper (Cyan/Blue Theme)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-[#0066ff]';
      case 'In Stock': return 'bg-emerald-500';
      case 'Maintenance': return 'bg-amber-500';
      case 'Retired': return 'bg-slate-500';
      default: return 'bg-[#38bdf8]';
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'Active': return 'border-blue-500/30';
      case 'In Stock': return 'border-emerald-500/30';
      case 'Maintenance': return 'border-amber-500/30';
      case 'Retired': return 'border-white/10';
      default: return 'border-sky-500/30';
    }
  };

  // Status Breakdown calculation
  const statuses = stats.statusBreakdown || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
      {/* Manufacturer Distribution */}
      <div className="glass-panel border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-2xl bg-slate-900/60">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#0066ff] to-[#38bdf8]" />
        <h3 className="text-sm font-bold text-white mb-4 tracking-wider font-heading uppercase">Manufacturer Distribution</h3>
        
        <div className="space-y-4">
          {sortedMakes.length > 0 ? (
            sortedMakes.map((item, idx) => {
              const percentage = Math.round((item.count / totalAssets) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-white/80">{item.make}</span>
                    <span className="text-white/50 font-medium">
                      {item.count} {item.count === 1 ? 'device' : 'devices'}{' '}
                      <span className="text-[9px] text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-0.5 rounded ml-2 font-bold border border-[#38bdf8]/20">
                        {percentage}%
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-white/5 border border-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0066ff] to-[#38bdf8] rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-40 text-white/40 text-sm italic">
              No manufacturer data available
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown & Health */}
      <div className="glass-panel border border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-2xl bg-slate-900/60">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#0066ff] to-indigo-650" />
        <h3 className="text-sm font-bold text-white mb-4 tracking-wider font-heading uppercase">Status Allocation</h3>

        <div className="flex flex-col sm:flex-row items-center justify-around h-full gap-6">
          {/* Custom SVG Donut Chart */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-white/5 fill-transparent"
                strokeWidth="10"
              />
              {/* Dynamic segmented stroke */}
              {(() => {
                let accumulatedPercent = 0;
                return statuses.map((item, idx) => {
                  const percent = (item.count / totalAssets) * 100;
                  const strokeDasharray = `${percent} ${100 - percent}`;
                  const strokeDashoffset = -accumulatedPercent;
                  accumulatedPercent += percent;

                  let color = '#0066ff'; // electric blue
                  if (item.status === 'In Stock') color = '#10b981'; // emerald-500
                  if (item.status === 'Maintenance') color = '#f59e0b'; // amber-500
                  if (item.status === 'Retired') color = '#6b7280'; // slate-500

                  return (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={color}
                      strokeWidth="10"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      pathLength="100"
                      className="transition-all duration-1000 ease-out"
                    />
                  );
                });
              })()}
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white font-heading">{totalAssets}</span>
              <span className="text-[8px] uppercase text-white/40 tracking-wider font-bold">Total Assets</span>
            </div>
          </div>

          {/* Status Indicators list */}
          <div className="flex-1 space-y-2.5 w-full">
            {statuses.map((item, idx) => {
              const percent = Math.round((item.count / totalAssets) * 100);
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-white/5 ${getStatusBorderColor(
                    item.status
                  )} shadow-sm transition-all hover:bg-white/10`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(item.status)}`} />
                    <span className="text-xs font-semibold text-white/80">{item.status}</span>
                  </div>
                  <div className="text-xs text-white/50 font-bold">
                    {item.count} ({percent}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

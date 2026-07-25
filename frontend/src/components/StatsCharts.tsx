import React from 'react';
import type { DashboardStats } from '../types';

interface StatsChartsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const StatsCharts: React.FC<StatsChartsProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
        <div className="glass-panel border border-slate-200 rounded-2xl p-6 h-64 bg-slate-100/50" />
        <div className="glass-panel border border-slate-200 rounded-2xl p-6 h-64 bg-slate-100/50" />
      </div>
    );
  }

  // Calculate percentages for manufacturers
  const totalAssets = stats.total || 1;
  const sortedMakes = [...(stats.makeBreakdown || [])].sort((a, b) => b.count - a.count);

  // Status colors helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-indigo-600';
      case 'In Stock': return 'bg-emerald-600';
      case 'Maintenance': return 'bg-amber-600';
      case 'Retired': return 'bg-slate-500';
      default: return 'bg-blue-600';
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'Active': return 'border-indigo-100';
      case 'In Stock': return 'border-emerald-100';
      case 'Maintenance': return 'border-amber-100';
      case 'Retired': return 'border-slate-150';
      default: return 'border-blue-100';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-indigo-50/50';
      case 'In Stock': return 'bg-emerald-50/50';
      case 'Maintenance': return 'bg-amber-50/50';
      case 'Retired': return 'bg-slate-50/50';
      default: return 'bg-blue-50/50';
    }
  };

  // Status Breakdown calculation
  const statuses = stats.statusBreakdown || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Manufacturer Distribution */}
      <div className="glass-panel border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        <h3 className="text-base font-bold text-slate-800 mb-4 tracking-wide font-heading">Manufacturer Distribution</h3>
        
        <div className="space-y-4">
          {sortedMakes.length > 0 ? (
            sortedMakes.map((item, idx) => {
              const percentage = Math.round((item.count / totalAssets) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-700">{item.make}</span>
                    <span className="text-slate-500 font-medium">
                      {item.count} {item.count === 1 ? 'device' : 'devices'}{' '}
                      <span className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded ml-2 font-bold border border-indigo-100/50">
                        {percentage}%
                      </span>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 border border-slate-200/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              No manufacturer data available
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown & Health */}
      <div className="glass-panel border border-slate-200 rounded-2xl p-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
        <h3 className="text-base font-bold text-slate-800 mb-4 tracking-wide font-heading">Status Allocation</h3>

        <div className="flex flex-col sm:flex-row items-center justify-around h-full gap-6">
          {/* Custom SVG Donut Chart */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-95" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-100 fill-transparent"
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

                  let color = '#4f46e5'; // indigo-600
                  if (item.status === 'In Stock') color = '#10b981'; // emerald-600
                  if (item.status === 'Maintenance') color = '#d97706'; // amber-600
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
              <span className="text-2xl font-bold text-slate-800">{totalAssets}</span>
              <span className="text-[9px] uppercase text-slate-400 tracking-wider font-bold">Total Assets</span>
            </div>
          </div>

          {/* Status Indicators list */}
          <div className="flex-1 space-y-2.5 w-full">
            {statuses.map((item, idx) => {
              const percent = Math.round((item.count / totalAssets) * 100);
              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-2 rounded-xl border ${getStatusBgColor(item.status)} ${getStatusBorderColor(
                    item.status
                  )} shadow-sm`}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(item.status)}`} />
                    <span className="text-xs font-semibold text-slate-700">{item.status}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-bold">
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

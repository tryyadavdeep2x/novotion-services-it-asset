import React from 'react';
import { Laptop, Monitor, Layers, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { DashboardStats } from '../types';

interface DashboardProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, loading }) => {
  // Safe helper to find breakdown counts
  const getStatusCount = (status: string) => {
    if (!stats || !stats.statusBreakdown) return 0;
    const found = stats.statusBreakdown.find((item) => item.status === status);
    return found ? found.count : 0;
  };

  const inStockCount = getStatusCount('In Stock');
  const maintenanceCount = getStatusCount('Maintenance');

  const cardData = [
    {
      title: 'Total IT Assets',
      value: loading ? '...' : stats?.total || 0,
      description: 'Total tracked devices',
      icon: <Layers className="w-6 h-6 text-indigo-600" />,
      glowClass: 'glow-indigo border-indigo-500/10',
      bgColor: 'from-indigo-500/5 to-transparent'
    },
    {
      title: 'Laptops',
      value: loading ? '...' : stats?.laptops || 0,
      description: 'Portable workstations',
      icon: <Laptop className="w-6 h-6 text-blue-600" />,
      glowClass: 'glow-blue border-blue-500/10',
      bgColor: 'from-blue-500/5 to-transparent'
    },
    {
      title: 'Desktops',
      value: loading ? '...' : stats?.desktops || 0,
      description: 'Fixed workstations',
      icon: <Monitor className="w-6 h-6 text-cyan-600" />,
      glowClass: 'glow-cyan border-cyan-500/10',
      bgColor: 'from-cyan-500/5 to-transparent'
    },
    {
      title: 'Available (In Stock)',
      value: loading ? '...' : inStockCount,
      description: 'Ready for new users',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      glowClass: 'glow-emerald border-emerald-500/10',
      bgColor: 'from-emerald-500/5 to-transparent'
    },
    {
      title: 'In Maintenance',
      value: loading ? '...' : maintenanceCount,
      description: 'Devices requiring service',
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      glowClass: 'glow-amber border-amber-500/10',
      bgColor: 'from-amber-500/5 to-transparent'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cardData.map((card, idx) => (
        <div
          key={idx}
          className={`glass-panel border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 ${card.glowClass} flex flex-col justify-between`}
        >
          {/* Subtle background glow */}
          <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.bgColor} blur-2xl rounded-full -mr-4 -mt-4 opacity-50`} />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-slate-500 text-xs font-semibold tracking-wide uppercase">{card.title}</span>
            <div className="p-2 rounded-xl bg-white/95 border border-slate-200 shadow-sm">
              {card.icon}
            </div>
          </div>

          <div className="relative z-10 mt-2">
            <div className="text-3xl font-bold tracking-tight text-slate-800">
              {loading ? (
                <div className="h-9 w-16 bg-slate-200 rounded animate-pulse" />
              ) : (
                card.value
              )}
            </div>
            <p className="text-slate-500 text-xs mt-1.5 font-normal">{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

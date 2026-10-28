import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  AlertTriangle,
  Layers
} from 'lucide-react';

const StatsSummary = ({ stats, selectedStatus, onSelectStatus }) => {
  const statCards = [
    {
      id: 'All',
      label: 'Total Apps',
      count: stats.total || 0,
      icon: Layers,
      bgColor: 'bg-slate-50',
      textColor: 'text-slate-700',
      borderColor: 'border-slate-200',
      activeRing: 'ring-slate-400'
    },
    {
      id: 'Applied',
      label: 'Applied',
      count: stats.Applied || 0,
      icon: FileText,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      activeRing: 'ring-blue-500'
    },
    {
      id: 'Interview',
      label: 'Interview',
      count: stats.Interview || 0,
      icon: Clock,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200',
      activeRing: 'ring-amber-500'
    },
    {
      id: 'Offer',
      label: 'Offer',
      count: stats.Offer || 0,
      icon: Award,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      activeRing: 'ring-purple-500'
    },
    {
      id: 'Accepted',
      label: 'Accepted',
      count: stats.Accepted || 0,
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      activeRing: 'ring-emerald-500'
    },
    {
      id: 'Declined',
      label: 'Declined',
      count: stats.Declined || 0,
      icon: XCircle,
      bgColor: 'bg-zinc-50',
      textColor: 'text-zinc-600',
      borderColor: 'border-zinc-200',
      activeRing: 'ring-zinc-400'
    },
    {
      id: 'Rejected',
      label: 'Rejected',
      count: stats.Rejected || 0,
      icon: XCircle,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-700',
      borderColor: 'border-rose-200',
      activeRing: 'ring-rose-500'
    }
  ];

  return (
    <div className="space-y-3">
      {/* Follow-up Overdue Banner if any */}
      {stats.overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center justify-between text-red-800 text-sm shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <span className="font-semibold">{stats.overdue} application{stats.overdue > 1 ? 's' : ''} require attention:</span>{' '}
              Follow-up period exceeded 7 days in 'Applied' status.
            </div>
          </div>
          <span className="bg-red-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">
            Action Required
          </span>
        </div>
      )}

      {/* Grid of status counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          const isSelected = selectedStatus === card.id;

          return (
            <button
              key={card.id}
              onClick={() => onSelectStatus(card.id)}
              className={`text-left p-3.5 rounded-xl border transition-all duration-150 relative bg-white hover:shadow-md ${
                isSelected
                  ? `ring-2 ${card.activeRing} border-transparent shadow-sm`
                  : `${card.borderColor} hover:border-slate-300`
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">{card.label}</span>
                <div className={`p-1.5 rounded-lg ${card.bgColor} ${card.textColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {card.count}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StatsSummary;

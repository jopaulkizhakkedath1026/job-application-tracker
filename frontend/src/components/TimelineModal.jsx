import React from 'react';
import { X, Calendar, Clock, CheckCircle2, History } from 'lucide-react';

const STATUS_COLORS = {
  Applied: 'bg-blue-500 ring-blue-100 text-blue-700 bg-blue-50',
  Interview: 'bg-amber-500 ring-amber-100 text-amber-700 bg-amber-50',
  Offer: 'bg-purple-500 ring-purple-100 text-purple-700 bg-purple-50',
  Accepted: 'bg-emerald-500 ring-emerald-100 text-emerald-700 bg-emerald-50',
  Declined: 'bg-zinc-500 ring-zinc-100 text-zinc-700 bg-zinc-50',
  Rejected: 'bg-rose-500 ring-rose-100 text-rose-700 bg-rose-50'
};

const TimelineModal = ({ isOpen, onClose, application }) => {
  if (!isOpen || !application) return null;

  const history = application.statusHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Application Lifecycle Timeline</h2>
              <p className="text-xs text-slate-500">
                {application.applicationId} • {application.company} ({application.jobRole})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Vertical Timeline */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {history.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-6">No status history recorded.</p>
          ) : (
            <div className="relative border-l-2 border-indigo-200 ml-4 pl-6 space-y-6 my-2">
              {history.map((entry, index) => {
                const dateObj = new Date(entry.changedAt || application.createdAt);
                const formattedDate = dateObj.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                });
                const formattedTime = dateObj.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div key={index} className="relative group">
                    {/* Timeline Node Dot */}
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-indigo-600 rounded-full border-2 border-white ring-4 ring-indigo-100 shadow-sm" />

                    <div className="bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/80 rounded-xl p-3.5">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-slate-900 text-sm">
                          Stage: {entry.status}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Clock className="w-3 h-3" />
                          <span>{formattedTime}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formattedDate}</span>
                      </div>

                      {entry.comment && (
                        <p className="text-xs text-slate-600 bg-white border border-slate-200/60 rounded-lg p-2 italic">
                          "{entry.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimelineModal;

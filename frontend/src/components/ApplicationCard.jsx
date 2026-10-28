import React from 'react';
import {
  Calendar,
  Building2,
  Briefcase,
  History,
  Edit2,
  Trash2,
  AlertCircle,
  DollarSign,
  ArrowRightCircle,
  FileText
} from 'lucide-react';

const STATUS_BADGE_CONFIG = {
  Applied: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10',
    dot: 'bg-blue-500'
  },
  Interview: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10',
    dot: 'bg-amber-500'
  },
  Offer: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10',
    dot: 'bg-purple-500'
  },
  Accepted: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10',
    dot: 'bg-emerald-500'
  },
  Declined: {
    bg: 'bg-zinc-100 text-zinc-700 border-zinc-200 ring-zinc-500/10',
    dot: 'bg-zinc-400'
  },
  Rejected: {
    bg: 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10',
    dot: 'bg-rose-500'
  }
};

const JOB_TYPE_STYLES = {
  'Full-time': 'bg-indigo-50 text-indigo-700 border-indigo-100',
  'Internship': 'bg-cyan-50 text-cyan-700 border-cyan-100',
  'Contract': 'bg-orange-50 text-orange-700 border-orange-100'
};

const FINAL_STATUSES = ['Rejected', 'Accepted', 'Declined'];

const ApplicationCard = ({
  app,
  onOpenEditModal,
  onOpenStatusModal,
  onOpenTimelineModal,
  onOpenDeleteModal
}) => {
  const isFinal = FINAL_STATUSES.includes(app.status);
  // An application can be deleted only if status is Applied or final status
  const canDelete = app.status === 'Applied' || isFinal;

  const statusConfig = STATUS_BADGE_CONFIG[app.status] || STATUS_BADGE_CONFIG.Applied;
  const formattedAppliedDate = new Date(app.appliedDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedFollowUpDate = app.followUpDate
    ? new Date(app.followUpDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Header: ID, Badges */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 tracking-wider">
              {app.applicationId}
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                JOB_TYPE_STYLES[app.jobType] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {app.jobType}
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {/* Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ring-1 ${statusConfig.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
              {app.status}
            </span>

            {/* Overdue Badge */}
            {app.isOverdue && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-600 text-white shadow-sm animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                Follow-up Overdue
              </span>
            )}
          </div>
        </div>

        {/* Company & Role */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{app.company}</span>
          </h2>
          <p className="text-sm font-medium text-slate-600 flex items-center gap-2 mt-1">
            <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate">{app.jobRole}</span>
          </p>
        </div>

        {/* Details: Applied Date, Salary, Notes */}
        <div className="bg-slate-50 rounded-xl p-3 space-y-1.5 text-xs text-slate-600 border border-slate-100 mb-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5" />
              Applied Date:
            </span>
            <span className="font-medium text-slate-800">{formattedAppliedDate}</span>
          </div>

          {formattedFollowUpDate && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Follow-up Target:</span>
              <span
                className={`font-medium ${
                  app.isOverdue ? 'text-red-600 font-semibold' : 'text-slate-700'
                }`}
              >
                {formattedFollowUpDate}
              </span>
            </div>
          )}

          {app.expectedSalary && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-slate-500">
                <DollarSign className="w-3.5 h-3.5" />
                Expected Salary:
              </span>
              <span className="font-semibold text-slate-800">
                ${Number(app.expectedSalary).toLocaleString()}
              </span>
            </div>
          )}

          {app.notes && (
            <div className="pt-1.5 border-t border-slate-200/60 mt-1">
              <p className="text-slate-500 line-clamp-2 italic">
                "{app.notes}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {/* Status Transition Button */}
          {!isFinal && (
            <button
              onClick={() => onOpenStatusModal(app)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              title="Transition application status"
            >
              <ArrowRightCircle className="w-3.5 h-3.5" />
              <span>Update Status</span>
            </button>
          )}

          {/* Timeline View Button */}
          <button
            onClick={() => onOpenTimelineModal(app)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="View status change history"
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Edit Button */}
          <button
            onClick={() => onOpenEditModal(app)}
            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="Edit details"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onOpenDeleteModal(app)}
            disabled={!canDelete}
            className={`p-1.5 rounded-lg transition-colors ${
              canDelete
                ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer'
                : 'text-slate-200 cursor-not-allowed opacity-50'
            }`}
            title={
              canDelete
                ? 'Delete application'
                : `Cannot delete: applications in '${app.status}' status are protected`
            }
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;

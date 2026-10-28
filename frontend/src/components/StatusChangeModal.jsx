import React, { useState } from 'react';
import { X, ArrowRight, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

const ALLOWED_TRANSITIONS = {
  Applied: ['Interview', 'Rejected'],
  Interview: ['Offer', 'Rejected'],
  Offer: ['Accepted', 'Declined'],
  Rejected: [],
  Accepted: [],
  Declined: []
};

const STATUS_DESCRIPTIONS = {
  Interview: 'Candidate invited for technical/HR interview stages.',
  Offer: 'Job offer letter received.',
  Accepted: 'Offer accepted by candidate (Final stage).',
  Declined: 'Offer declined by candidate (Final stage).',
  Rejected: 'Application rejected by employer (Final stage).'
};

const StatusChangeModal = ({ isOpen, onClose, application, onStatusUpdated }) => {
  if (!isOpen || !application) return null;

  const validNextStatuses = ALLOWED_TRANSITIONS[application.status] || [];
  const [selectedStatus, setSelectedStatus] = useState(validNextStatuses[0] || '');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) return;

    setLoading(true);
    setError('');

    try {
      await onStatusUpdated(application._id, selectedStatus, comment);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Status transition failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Transition Status</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {application.applicationId} • {application.company}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Status Flow Visual */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center justify-between">
            <div className="text-left">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                Current
              </span>
              <div className="font-bold text-slate-800 text-sm">{application.status}</div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-400" />

            <div className="text-right">
              <span className="text-[11px] font-semibold uppercase text-slate-400 tracking-wider">
                Next Stage
              </span>
              <div className="font-bold text-indigo-600 text-sm">
                {selectedStatus || 'Select next'}
              </div>
            </div>
          </div>

          {/* Valid Next Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Next Allowed Stage <span className="text-rose-500">*</span>
            </label>
            {validNextStatuses.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                This application is in a terminal status and cannot be changed.
              </p>
            ) : (
              <div className="space-y-2 mt-2">
                {validNextStatuses.map((status) => (
                  <label
                    key={status}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedStatus === status
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="nextStatus"
                      value={status}
                      checked={selectedStatus === status}
                      onChange={() => setSelectedStatus(status)}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900">{status}</span>
                      <p className="text-slate-500 mt-0.5">
                        {STATUS_DESCRIPTIONS[status] || 'Transition to ' + status}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Optional Stage Comment */}
          {validNextStatuses.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transition Note / Remarks <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows="2"
                placeholder="e.g. Cleared round 1 technical interview, scheduled round 2."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              />
            </div>
          )}

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || validNextStatuses.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Confirm Transition</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StatusChangeModal;

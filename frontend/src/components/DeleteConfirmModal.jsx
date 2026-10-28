import React, { useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, application, onConfirmDelete }) => {
  if (!isOpen || !application) return null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await onConfirmDelete(application._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-2.5 text-rose-700">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-bold text-slate-900">Confirm Deletion</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete application{' '}
            <strong className="text-slate-900 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {application.applicationId}
            </strong>{' '}
            for <strong className="text-slate-900">{application.jobRole}</strong> at{' '}
            <strong className="text-slate-900">{application.company}</strong>?
          </p>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
            <strong>Warning:</strong> This action permanently deletes the application and its entire
            lifecycle history. This operation cannot be reversed.
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl shadow-sm shadow-rose-200 transition-all cursor-pointer disabled:opacity-60"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <Trash2 className="w-3.5 h-3.5" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;

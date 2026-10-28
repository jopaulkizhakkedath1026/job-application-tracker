import React, { useState, useEffect } from 'react';
import { X, Building2, Briefcase, Calendar, DollarSign, FileText, AlertCircle, Loader2 } from 'lucide-react';

const JOB_TYPES = ['Full-time', 'Internship', 'Contract'];

const ApplicationModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const isEditMode = Boolean(initialData);

  const getTodayDateString = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    company: '',
    jobRole: '',
    jobType: 'Full-time',
    appliedDate: getTodayDateString(),
    expectedSalary: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        company: initialData.company || '',
        jobRole: initialData.jobRole || '',
        jobType: initialData.jobType || 'Full-time',
        appliedDate: initialData.appliedDate
          ? new Date(initialData.appliedDate).toISOString().split('T')[0]
          : getTodayDateString(),
        expectedSalary: initialData.expectedSalary ?? '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        company: '',
        jobRole: '',
        jobType: 'Full-time',
        appliedDate: getTodayDateString(),
        expectedSalary: '',
        notes: ''
      });
    }
    setErrors({});
    setServerError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    const today = getTodayDateString();

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.jobRole.trim()) {
      newErrors.jobRole = 'Job role is required';
    }

    if (!formData.jobType) {
      newErrors.jobType = 'Job type is required';
    }

    if (!formData.appliedDate) {
      newErrors.appliedDate = 'Applied date is required';
    } else if (formData.appliedDate > today) {
      newErrors.appliedDate = 'Applied date cannot be in the future';
    }

    if (formData.expectedSalary && Number(formData.expectedSalary) < 0) {
      newErrors.expectedSalary = 'Salary cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        expectedSalary: formData.expectedSalary ? Number(formData.expectedSalary) : null
      });
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed. Please try again.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden transition-all">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isEditMode ? 'Edit Application' : 'Create New Application'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditMode
                ? `Modifying ${initialData.applicationId}`
                : 'Fill in details to log your job application'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server Error / Duplicate Warning Banner */}
        {serverError && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error:</span> {serverError}
            </div>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isEditMode && (
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex items-center justify-between text-xs">
              <span className="font-semibold text-indigo-900">Application ID:</span>
              <span className="font-mono font-bold text-indigo-700 bg-white px-2.5 py-1 rounded-md border border-indigo-200">
                {initialData.applicationId}
              </span>
            </div>
          )}

          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Google, Microsoft, Stripe"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className={`w-full pl-9 pr-3.5 py-2 text-sm bg-white border rounded-xl outline-none transition-all ${
                  errors.company
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                }`}
              />
            </div>
            {errors.company && (
              <p className="text-xs text-rose-600 mt-1">{errors.company}</p>
            )}
          </div>

          {/* Job Role */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Role <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Full Stack Developer, SDE II"
                value={formData.jobRole}
                onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                className={`w-full pl-9 pr-3.5 py-2 text-sm bg-white border rounded-xl outline-none transition-all ${
                  errors.jobRole
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                }`}
              />
            </div>
            {errors.jobRole && (
              <p className="text-xs text-rose-600 mt-1">{errors.jobRole}</p>
            )}
          </div>

          {/* Job Type & Applied Date (Two columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Job Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.jobType}
                onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
              >
                {JOB_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Applied Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Applied Date <span className="text-rose-500">*</span>
                {isEditMode && <span className="text-slate-400 font-normal ml-1">(Immutable)</span>}
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  max={getTodayDateString()}
                  disabled={isEditMode}
                  value={formData.appliedDate}
                  onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                  className={`w-full pl-9 pr-3.5 py-2 text-sm bg-white border rounded-xl outline-none transition-all ${
                    isEditMode ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                  } ${
                    errors.appliedDate
                      ? 'border-rose-400 focus:ring-2 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.appliedDate && (
                <p className="text-xs text-rose-600 mt-1">{errors.appliedDate}</p>
              )}
            </div>
          </div>

          {/* Expected Salary (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Expected Annual Salary ($) <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="e.g. 95000"
                value={formData.expectedSalary}
                onChange={(e) => setFormData({ ...formData, expectedSalary: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
            {errors.expectedSalary && (
              <p className="text-xs text-rose-600 mt-1">{errors.expectedSalary}</p>
            )}
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes / Referral Info <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows="2"
                placeholder="e.g. Referred by Sarah; submitted cover letter..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{isEditMode ? 'Save Changes' : 'Record Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;

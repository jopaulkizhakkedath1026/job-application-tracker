import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsSummary from './components/StatsSummary';
import ApplicationCard from './components/ApplicationCard';
import ApplicationModal from './components/ApplicationModal';
import StatusChangeModal from './components/StatusChangeModal';
import TimelineModal from './components/TimelineModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import {
  getApplications,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication
} from './services/api';
import { Search, Filter, Plus, RefreshCw, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = ['All', 'Applied', 'Interview', 'Offer', 'Accepted', 'Declined', 'Rejected'];

export default function App() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    Applied: 0,
    Interview: 0,
    Offer: 0,
    Accepted: 0,
    Declined: 0,
    Rejected: 0,
    overdue: 0
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Modals state
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  const [statusModalApp, setStatusModalApp] = useState(null);
  const [timelineModalApp, setTimelineModalApp] = useState(null);
  const [deleteModalApp, setDeleteModalApp] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Fetch applications from backend with query parameters
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getApplications(selectedStatus, searchQuery);
      if (res.success && res.data) {
        setApplications(res.data.applications || []);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      showToast(err.response?.data?.message || 'Failed to fetch applications from server', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // Handlers
  const handleCreateOrUpdateApp = async (formData) => {
    if (editingApp) {
      const res = await updateApplication(editingApp._id, formData);
      showToast(`Updated application ${res.data.applicationId} successfully`);
    } else {
      const res = await createApplication(formData);
      showToast(`Logged new application: ${res.data.applicationId}`);
    }
    fetchData();
  };

  const handleStatusTransition = async (id, newStatus, comment) => {
    const res = await updateApplicationStatus(id, newStatus, comment);
    showToast(`Status shifted to '${newStatus}' for ${res.data.applicationId}`);
    fetchData();
  };

  const handleDeleteApp = async (id) => {
    const res = await deleteApplication(id);
    showToast(`Application deleted permanently`);
    fetchData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      {/* Top Navbar */}
      <Navbar
        onOpenCreateModal={() => {
          setEditingApp(null);
          setIsAppModalOpen(true);
        }}
      />

      {/* Floating Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-xs sm:text-sm font-semibold border ${
              notification.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Statistics Breakdown */}
        <StatsSummary
          stats={stats}
          selectedStatus={selectedStatus}
          onSelectStatus={(status) => setSelectedStatus(status)}
        />

        {/* Filter and Search Bar Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by company name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {/* Status Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer font-medium text-slate-700"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchData}
              title="Refresh applications"
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Applications List Grid */}
        {loading && applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm font-medium text-slate-500">Retrieving applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-6">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Briefcase className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No applications found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              {searchQuery || selectedStatus !== 'All'
                ? 'No job applications matched your current search filters.'
                : 'Start tracking your career opportunities by adding your first job application.'}
            </p>
            <button
              onClick={() => {
                setEditingApp(null);
                setIsAppModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Application</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {applications.map((app) => (
              <ApplicationCard
                key={app._id}
                app={app}
                onOpenEditModal={(item) => {
                  setEditingApp(item);
                  setIsAppModalOpen(true);
                }}
                onOpenStatusModal={(item) => setStatusModalApp(item)}
                onOpenTimelineModal={(item) => setTimelineModalApp(item)}
                onOpenDeleteModal={(item) => setDeleteModalApp(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400">
        Job Application Tracker • Evaluator Ready • MERN Stack Architecture
      </footer>

      {/* Modals */}
      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onSubmit={handleCreateOrUpdateApp}
        initialData={editingApp}
      />

      <StatusChangeModal
        isOpen={Boolean(statusModalApp)}
        onClose={() => setStatusModalApp(null)}
        application={statusModalApp}
        onStatusUpdated={handleStatusTransition}
      />

      <TimelineModal
        isOpen={Boolean(timelineModalApp)}
        onClose={() => setTimelineModalApp(null)}
        application={timelineModalApp}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteModalApp)}
        onClose={() => setDeleteModalApp(null)}
        application={deleteModalApp}
        onConfirmDelete={handleDeleteApp}
      />
    </div>
  );
}

import React from 'react';
import { Briefcase, Plus, Sparkles } from 'lucide-react';

const Navbar = ({ onOpenCreateModal }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
                  JobTrack<span className="text-indigo-600">Pro</span>
                </h1>
                <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium border border-indigo-100">
                  MERN Stack
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Streamline and monitor your job hunt pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-sm font-semibold rounded-lg shadow-sm shadow-indigo-200 transition-all duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Application</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

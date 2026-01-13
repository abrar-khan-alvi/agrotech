import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { RequestStatus } from '../types';
import { Wallet, Users, Clock, CheckCircle, ChevronRight, Sprout, TrendingUp, AlertCircle, ArrowUpRight } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { state } = useStore();
  const navigate = useNavigate();

  const completedCount = state.requests.filter(r => r.status === RequestStatus.COMPLETED).length;
  const pendingCount = state.requests.filter(r => r.status !== RequestStatus.COMPLETED && r.status !== RequestStatus.REJECTED).length;
  const earnings = state.earnings;
  const user = state.user;

  const recentRequests = state.requests
    .filter(r => r.status !== RequestStatus.COMPLETED && r.status !== RequestStatus.REJECTED)
    .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())
    .slice(0, 4);

  return (
    <div className="bg-slate-50 min-h-screen md:pl-72 pb-10">

      {/* 🟢 Header Greeting */}
      <div className="px-6 py-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Welcome back, <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">{user?.name || 'Expert'}</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here's your activity overview for today.</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${state.isOnline ? 'text-emerald-600 bg-emerald-50' : 'text-gray-500 bg-gray-100'}`}>
              {state.isOnline ? 'Online • Accepting' : 'Offline'}
            </p>
          </div>
        </div>

        {/* 🔴 Offline Alert */}
        {!state.isOnline && (
          <div className="mb-8 bg-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

            <div className="flex items-center gap-4 mb-3 sm:mb-0 relative z-10">
              <div className="relative flex items-center justify-center w-10 h-10 bg-slate-800 rounded-full border border-slate-700">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              </div>
              <div>
                <p className="font-bold text-white text-sm">You are currently Offline</p>
                <p className="text-xs text-slate-400">You won't receive new consultation requests.</p>
              </div>
            </div>
          </div>
        )}

        {/* 📊 Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

          {/* Earnings */}
          <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet className="w-16 h-16 text-emerald-600" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Earnings</span>
            </div>
            <p className="text-3xl font-black text-slate-800 tracking-tight">৳{earnings}</p>

            <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center text-xs">
              <span className="text-gray-400">Rate/Report</span>
              <span className="font-bold text-slate-700">৳{user?.per_report_rate || 50}</span>
            </div>
          </div>

          {/* Consults */}
          <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="w-16 h-16 text-blue-600" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Consultations</span>
            </div>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{completedCount}</p>
            <p className="text-xs font-medium text-gray-400 mt-2">Successful sessions</p>
          </div>

          {/* Pending */}
          <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Clock className="w-16 h-16 text-orange-500" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</span>
            </div>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{pendingCount}</p>
            <p className="text-xs font-medium text-gray-400 mt-2">Requires attention</p>
          </div>

          {/* Reports */}
          <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <CheckCircle className="w-16 h-16 text-purple-600" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <CheckCircle className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reports</span>
            </div>
            <p className="text-3xl font-black text-slate-800 tracking-tight">{completedCount}</p>
            <p className="text-xs font-medium text-gray-400 mt-2">Total Submitted</p>
          </div>

        </div>

        {/* 📋 Recent Requests */}
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_2px_30px_rgba(0,0,0,0.02)] border border-gray-100/50">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Recent Requests</h2>
            <button
              onClick={() => navigate('/expert/requests')}
              className="group flex items-center gap-1 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              View All <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="space-y-4">
            {recentRequests.length > 0 ? (
              recentRequests.map(req => (
                <div
                  key={req.id}
                  onClick={() => navigate(`/expert/requests/${req.id}`)}
                  className="group bg-slate-50 hover:bg-white border border-transparent hover:border-emerald-100 p-5 rounded-2xl cursor-pointer transition-all hover:shadow-[0_4px_20px_rgba(16,185,129,0.08)] flex items-center justify-between"
                >
                  <div className="flex items-center gap-5">
                    <img
                      src={req.farmer.avatar}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      alt={req.farmer.name}
                    />
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{req.farmer.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-gray-200">
                          {req.field?.crop || 'Crop'}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 font-medium">{req.issueType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Received</p>
                      <p className="text-xs font-semibold text-slate-700">{new Date(req.assignedDate).toLocaleDateString()}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white text-gray-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Clock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No Pending Requests</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto mt-2">You're all caught up! New consultations will appear here when assigned.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

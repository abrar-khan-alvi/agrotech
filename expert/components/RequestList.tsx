import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { RequestStatus } from '../types';
import { Search, MapPin, Sprout, Filter } from 'lucide-react';

export const RequestList: React.FC = () => {
  const { state } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | RequestStatus>('ALL');

  const filtered = state.requests.filter(r =>
    (filter === 'ALL' && r.status !== RequestStatus.REJECTED) || r.status === filter
  );

  const StatusBadge = ({ status }: { status: RequestStatus }) => {
    switch (status) {
      case RequestStatus.NEW: return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">NEW</span>;
      case RequestStatus.IN_PROGRESS: return <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded-full">ONGOING</span>;
      case RequestStatus.COMPLETED: return <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full">DONE</span>;
      default: return null;
    }
  };

  return (
    <div className="p-4 md:p-8 md:pl-72 max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Consultation Requests</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {['ALL', RequestStatus.NEW, RequestStatus.IN_PROGRESS, RequestStatus.COMPLETED].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${filter === f
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
          >
            {f === 'ALL' ? 'All Requests' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-20">
        {filtered.map(req => (
          <div
            key={req.id}
            onClick={() => navigate(`/expert/requests/${req.id}`)}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <img src={req.farmer.avatar} className="w-10 h-10 rounded-full" alt="Farmer" />
                <div>
                  <h3 className="font-bold text-gray-900">{req.farmer.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" /> {req.farmer.location || 'Bangladesh'}
                  </div>
                </div>
              </div>
              <StatusBadge status={req.status} />
            </div>

            <div className="bg-gray-50 p-3 rounded-xl mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Crop:</span>
                <span className="font-medium text-gray-900">{req.field?.crop || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Issue:</span>
                <span className="font-medium text-red-600">{req.issueType}</span>
              </div>
            </div>

            <button className={`w-full py-2.5 rounded-xl text-sm font-bold transition-colors ${req.status === RequestStatus.COMPLETED
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}>
              {req.status === RequestStatus.COMPLETED ? 'রিপোর্ট দেখুন' : 'কনসাল্ট করুন'}
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">No requests found</div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Badge, Button, Card, Input } from '../components/UI';
import { Search, FileCheck, Award, Star } from 'lucide-react';
import { Expert } from '../types';

const MOCK_EXPERTS: Expert[] = [
  { id: '1', name: 'Dr. Alice Wong', specialization: 'Soil Health', certificationId: 'CERT-A100', isVerified: true, status: 'ACTIVE', rating: 4.8, region: 'Northern Region', earnings: 12400 },
  { id: '2', name: 'Mr. David Kim', specialization: 'Pest Control', certificationId: 'CERT-B200', isVerified: false, status: 'PENDING', rating: 0, region: 'Eastern Valley', earnings: 0 },
  { id: '3', name: 'Sarah Jenkins', specialization: 'Irrigation Systems', certificationId: 'CERT-C300', isVerified: true, status: 'ACTIVE', rating: 4.5, region: 'Western Plains', earnings: 8900 },
  { id: '4', name: 'Mohammed Ali', specialization: 'Organic Farming', certificationId: 'CERT-D400', isVerified: false, status: 'PENDING', rating: 0, region: 'Southern Hills', earnings: 0 },
];

export const ExpertsView: React.FC = () => {
  const [experts, setExperts] = useState<Expert[]>(MOCK_EXPERTS);

  const handleActivate = (id: string) => {
    setExperts(prev => prev.map(e => e.id === id ? { ...e, isVerified: true, status: 'ACTIVE' } : e));
  };

  const handleReject = (id: string) => {
    setExperts(prev => prev.map(e => e.id === id ? { ...e, status: 'REJECTED' } : e));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Expert Management</h1>
          <p className="text-slate-500">Validate certifications and assign specializations.</p>
        </div>
        <Button>
          <FileCheck size={18} className="mr-2" /> Review New Applications
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {experts.map((expert) => (
          <Card key={expert.id} className="p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-4">
               <div className="flex items-center space-x-3">
                 <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {expert.name.charAt(0)}
                 </div>
                 <div>
                   <h3 className="font-semibold text-slate-900">{expert.name}</h3>
                   <div className="flex items-center text-xs text-slate-500 mt-1">
                     <Award size={12} className="mr-1" /> {expert.certificationId}
                   </div>
                 </div>
               </div>
               <Badge variant={expert.status === 'ACTIVE' ? 'success' : expert.status === 'PENDING' ? 'warning' : 'error'}>
                 {expert.status}
               </Badge>
            </div>

            <div className="space-y-3 mb-6">
              <div>
                <span className="text-xs text-slate-400 uppercase font-medium">Specialization</span>
                <p className="text-sm font-medium text-slate-700">{expert.specialization || "Not Assigned"}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 uppercase font-medium">Region</span>
                <p className="text-sm font-medium text-slate-700">{expert.region}</p>
              </div>
              {expert.status === 'ACTIVE' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star size={14} className="text-amber-400 mr-1 fill-current" />
                    <span className="text-sm font-medium text-slate-700">{expert.rating} / 5.0</span>
                  </div>
                  <div className="text-sm text-slate-500">
                    ৳ {expert.earnings.toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-2 pt-4 border-t border-slate-100">
              {expert.status === 'PENDING' ? (
                <>
                  <Button size="sm" className="flex-1" onClick={() => handleActivate(expert.id)}>Approve</Button>
                  <Button size="sm" variant="outline" className="flex-1 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200" onClick={() => handleReject(expert.id)}>Reject</Button>
                </>
              ) : (
                <Button size="sm" variant="outline" className="w-full">View Profile</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
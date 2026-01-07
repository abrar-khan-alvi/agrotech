import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import { UserCog, MapPin, TabletSmartphone } from 'lucide-react';
import { SubAdmin } from '../types';

const MOCK_SUB_ADMINS: SubAdmin[] = [
  { id: 'SA-01', name: 'Mark Wilson', region: 'Northern Region', assignedDevices: 12, accuracyScore: 98, status: 'ACTIVE' },
  { id: 'SA-02', name: 'Sarah Lee', region: 'Western Plains', assignedDevices: 8, accuracyScore: 92, status: 'ACTIVE' },
  { id: 'SA-03', name: 'James Carter', region: 'Southern Hills', assignedDevices: 15, accuracyScore: 88, status: 'INACTIVE' },
];

export const SubAdminsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sub-Admin Management</h1>
          <p className="text-slate-500">Field operations staff and device assignments.</p>
        </div>
        <Button>
          <UserCog size={18} className="mr-2" /> Add Sub-Admin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_SUB_ADMINS.map((admin) => (
           <Card key={admin.id} className="p-6">
             <div className="flex items-start justify-between mb-4">
               <div className="flex items-center space-x-3">
                 <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                   {admin.name.charAt(0)}
                 </div>
                 <div>
                   <h3 className="font-semibold text-slate-900">{admin.name}</h3>
                   <div className="flex items-center text-xs text-slate-500">
                     <MapPin size={10} className="mr-1" /> {admin.region}
                   </div>
                 </div>
               </div>
               <Badge variant={admin.status === 'ACTIVE' ? 'success' : 'neutral'}>{admin.status}</Badge>
             </div>
             
             <div className="space-y-3">
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500 flex items-center"><TabletSmartphone size={14} className="mr-1"/> Devices</span>
                 <span className="font-medium text-slate-900">{admin.assignedDevices}</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-500">Data Accuracy</span>
                 <span className={`font-bold ${admin.accuracyScore > 95 ? 'text-emerald-600' : 'text-slate-900'}`}>{admin.accuracyScore}%</span>
               </div>
             </div>
             
             <div className="mt-6 flex space-x-2">
               <Button size="sm" variant="outline" className="flex-1">View Logs</Button>
               <Button size="sm" variant="outline" className="flex-1">Assign Task</Button>
             </div>
           </Card>
        ))}
      </div>
    </div>
  );
};

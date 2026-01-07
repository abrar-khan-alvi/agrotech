import React from 'react';
import { Card, Button, Input } from '../components/UI';
import { MapPin, Search, Database, User } from 'lucide-react';
import { IoTDevice } from '../types';

const MOCK_DEVICES: IoTDevice[] = [
  { id: 'IOT-001', type: 'SOIL_SENSOR', location: 'Field F-101 (North)', assignedTo: 'Sub-Admin Mark', samplingSessionId: 'SESS-2024-001' },
  { id: 'IOT-002', type: 'WEATHER_STATION', location: 'Sector 4 Hub', assignedTo: 'Sub-Admin Mark' },
  { id: 'IOT-003', type: 'SOIL_SENSOR', location: 'Field F-103 (West)', assignedTo: 'Sub-Admin Sarah', samplingSessionId: 'SESS-2024-005' },
  { id: 'IOT-004', type: 'DRONE_BASE', location: 'Central Depot', assignedTo: 'Tech Support' },
];

export const IoTView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">IoT Device Management</h1>
          <p className="text-slate-500">Manage device assignments and sampling sessions.</p>
        </div>
        <div className="w-full sm:w-auto">
          <Input icon={<Search size={18} />} placeholder="Search Device ID..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {MOCK_DEVICES.map((device) => (
          <Card key={device.id} className="p-5 border-t-4 border-t-transparent hover:border-t-emerald-500 transition-all">
            <div className="flex justify-between items-start mb-2">
               <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{device.id}</span>
            </div>
            
            <h3 className="font-bold text-slate-900 mb-1">{device.type.replace('_', ' ')}</h3>
            <div className="flex items-center text-sm text-slate-500 mb-4">
              <MapPin size={14} className="mr-1" /> {device.location}
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm mb-4">
              <div className="bg-slate-50 p-2 rounded">
                 <div className="flex items-center text-slate-400 text-xs mb-1">
                   <User size={12} className="mr-1" /> Assigned To
                 </div>
                 <span className="font-medium text-slate-700">{device.assignedTo}</span>
              </div>
              {device.samplingSessionId && (
                <div className="bg-blue-50 p-2 rounded border border-blue-100">
                   <div className="flex items-center text-blue-500 text-xs mb-1">
                     <Database size={12} className="mr-1" /> Active Session
                   </div>
                   <span className="font-medium text-blue-700">{device.samplingSessionId}</span>
                </div>
              )}
            </div>

            <Button size="sm" variant="outline" className="w-full">View Assignment Log</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};
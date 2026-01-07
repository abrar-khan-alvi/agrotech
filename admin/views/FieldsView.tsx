import React, { useState } from 'react';
import { Card, Badge, Button, Input } from '../components/UI';
import { Search, Map, Sprout, Activity, Eye, Link } from 'lucide-react';
import { Field } from '../types';

const MOCK_FIELDS: Field[] = [
  { id: 'F-101', ownerName: 'John Doe', location: 'Northern Region, Sector 4', area: 12.5, crop: 'Wheat', status: 'ACTIVE', sensorId: 'IOT-A1', lastSatelliteScan: '2024-03-20' },
  { id: 'F-102', ownerName: 'Jane Smith', location: 'Eastern Valley', area: 5.0, crop: 'Rice', status: 'ACTIVE', sensorId: 'IOT-B2', lastSatelliteScan: '2024-03-21' },
  { id: 'F-103', ownerName: 'Robert Johnson', location: 'Western Plains', area: 25.0, crop: 'Fallow', status: 'RESTING', lastSatelliteScan: '2024-03-15' },
];

export const FieldsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Fields & Farms</h1>
          <p className="text-slate-500">Monitor field status, sensor data, and crop history.</p>
        </div>
        <div className="w-full sm:w-auto">
          <Input 
            icon={<Search size={18} />} 
            placeholder="Search fields or owners..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_FIELDS.map((field) => (
          <Card key={field.id} className="overflow-hidden group hover:shadow-md transition-all">
            <div className="h-32 bg-slate-200 relative">
               <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                  <Map size={32} />
                  <span className="ml-2 text-sm font-medium">Satellite Map View</span>
               </div>
               <div className="absolute top-3 right-3">
                 <Badge variant={field.status === 'ACTIVE' ? 'success' : 'neutral'}>{field.status}</Badge>
               </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900">{field.location}</h3>
                  <p className="text-sm text-slate-500">{field.ownerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600">{field.area} <span className="text-xs font-normal text-slate-500">acres</span></p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-xs text-slate-400 block mb-1">Current Crop</span>
                  <div className="flex items-center font-medium text-slate-700">
                    <Sprout size={14} className="mr-1.5 text-emerald-500" /> {field.crop}
                  </div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-xs text-slate-400 block mb-1">IoT Status</span>
                  <div className="flex items-center font-medium text-slate-700">
                    {field.sensorId ? (
                       <>
                         <Link size={14} className="mr-1.5 text-blue-500" /> Device Linked
                       </>
                    ) : (
                       <span className="text-slate-400 italic">No Device</span>
                    )}
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full group-hover:border-emerald-200 group-hover:text-emerald-700">
                <Eye size={16} className="mr-2" /> View Field Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
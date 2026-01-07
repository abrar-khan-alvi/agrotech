import React, { useState } from 'react';
import { Badge, Button, Card, Input } from '../components/UI';
import { Search, MapPin, CheckCircle, Ban } from 'lucide-react';
import { Farmer } from '../types';

const MOCK_FARMERS: Farmer[] = [
  { id: '1', name: 'John Doe', location: 'Northern Region', nid: 'NID12345678', isVerified: true, status: 'ACTIVE', farmSize: 12.5, cropType: 'Wheat', registrationDate: '2023-11-12' },
  { id: '2', name: 'Jane Smith', location: 'Eastern Valley', nid: 'NID87654321', isVerified: false, status: 'ACTIVE', farmSize: 5.0, cropType: 'Rice', registrationDate: '2024-01-05' },
  { id: '3', name: 'Robert Johnson', location: 'Western Plains', nid: 'NID55667788', isVerified: true, status: 'DISABLED', farmSize: 25.0, cropType: 'Corn', registrationDate: '2023-08-20' },
  { id: '4', name: 'Emily Davis', location: 'Southern Hills', nid: 'NID99887766', isVerified: false, status: 'ACTIVE', farmSize: 8.2, cropType: 'Soybean', registrationDate: '2024-02-14' },
  { id: '5', name: 'Michael Brown', location: 'Central District', nid: 'NID11223344', isVerified: true, status: 'ACTIVE', farmSize: 15.0, cropType: 'Cotton', registrationDate: '2023-12-01' },
];

export const FarmersView: React.FC = () => {
  const [farmers, setFarmers] = useState<Farmer[]>(MOCK_FARMERS);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleStatus = (id: string) => {
    setFarmers(prev => prev.map(f => f.id === id ? { ...f, status: f.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' } : f));
  };

  const handleVerify = (id: string) => {
    setFarmers(prev => prev.map(f => f.id === id ? { ...f, isVerified: true } : f));
  };

  const filteredFarmers = farmers.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.nid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Farmer Management</h1>
          <p className="text-slate-500">Verify identities and manage farmer access.</p>
        </div>
        <div className="w-full sm:w-auto">
          <Input 
            icon={<Search size={18} />} 
            placeholder="Search by name or NID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Farmer</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Farm Details</th>
                <th className="px-6 py-4">Verification</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFarmers.map((farmer) => (
                <tr key={farmer.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-semibold text-slate-900">{farmer.name}</div>
                      <div className="text-slate-500 text-xs">{farmer.nid}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-slate-600">
                      <MapPin size={14} className="mr-1.5" />
                      {farmer.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-900">{farmer.cropType}</div>
                    <div className="text-slate-500 text-xs">{farmer.farmSize} acres</div>
                  </td>
                  <td className="px-6 py-4">
                    {farmer.isVerified ? (
                      <Badge variant="success">Verified</Badge>
                    ) : (
                      <Badge variant="warning">Pending</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={farmer.status === 'ACTIVE' ? 'neutral' : 'error'}>
                      {farmer.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {!farmer.isVerified && (
                      <Button size="sm" variant="outline" onClick={() => handleVerify(farmer.id)} className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200">
                        <CheckCircle size={14} className="mr-1.5" /> Verify
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className={farmer.status === 'ACTIVE' ? "text-red-600 hover:bg-red-50" : "text-emerald-600 hover:bg-emerald-50"}
                      onClick={() => handleToggleStatus(farmer.id)}
                    >
                      {farmer.status === 'ACTIVE' ? (
                        <>
                          <Ban size={14} className="mr-1.5" /> Disable
                        </>
                      ) : 'Enable'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredFarmers.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              No farmers found matching your search.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

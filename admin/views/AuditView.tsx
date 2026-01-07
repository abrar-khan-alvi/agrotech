import React from 'react';
import { Card, Badge, Input } from '../components/UI';
import { Shield, Search, Filter } from 'lucide-react';
import { AuditLog } from '../types';

const MOCK_LOGS: AuditLog[] = [
  { id: 'LOG-001', action: 'REPORT_APPROVED', user: 'Admin User', role: 'SUPER_ADMIN', timestamp: '2024-03-22 14:30', details: 'Approved report R-002 for Consultation C-005' },
  { id: 'LOG-002', action: 'FARMER_VERIFIED', user: 'Regional Admin North', role: 'REGIONAL_ADMIN', timestamp: '2024-03-22 11:15', details: 'Verified Farmer ID 1 (John Doe)' },
  { id: 'LOG-003', action: 'PAYOUT_INITIATED', user: 'Finance Manager', role: 'CENTRAL_ADMIN', timestamp: '2024-03-21 09:45', details: 'Initiated monthly payout for experts batch #44' },
  { id: 'LOG-004', action: 'DEVICE_RESET', user: 'Sub-Admin Mark', role: 'SUB_ADMIN', timestamp: '2024-03-21 08:30', details: 'Remote reset command sent to IoT-003' },
];

export const AuditView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-500">Immutable record of all system actions for compliance.</p>
        </div>
        <div className="flex space-x-2">
          <Input icon={<Search size={18} />} placeholder="Search logs..." />
          <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50">
            <Filter size={20} className="text-slate-500" />
          </button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-mono text-slate-500 text-xs">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{log.user}</div>
                    <div className="text-xs text-slate-500">{log.role.replace('_', ' ')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="neutral">{log.action}</Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

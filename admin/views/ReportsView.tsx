import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import { FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Report } from '../types';

const MOCK_REPORTS: Report[] = [
  { id: 'R-001', consultationId: 'C-003', expertName: 'Mr. David Kim', date: '2024-03-22', status: 'PENDING_APPROVAL', qualityScore: 88, flags: 0 },
  { id: 'R-002', consultationId: 'C-005', expertName: 'Dr. Alice Wong', date: '2024-03-21', status: 'APPROVED', qualityScore: 95, flags: 0 },
  { id: 'R-003', consultationId: 'C-008', expertName: 'New Expert', date: '2024-03-20', status: 'REVISION_REQUESTED', qualityScore: 65, flags: 2 },
];

export const ReportsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Report Quality Control</h1>
          <p className="text-slate-500">Review and approve consultation reports before release.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {MOCK_REPORTS.map((report) => (
          <Card key={report.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${
                report.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' : 
                report.status === 'REVISION_REQUESTED' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
              }`}>
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Consultation Report #{report.consultationId}</h3>
                <p className="text-sm text-slate-500">By {report.expertName} • {report.date}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={report.status === 'APPROVED' ? 'success' : report.status === 'REVISION_REQUESTED' ? 'error' : 'warning'}>
                    {report.status.replace('_', ' ')}
                  </Badge>
                  {report.flags > 0 && (
                    <Badge variant="error" >{report.flags} Flags</Badge>
                  )}
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Score: {report.qualityScore}%</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline">View Content</Button>
              {report.status === 'PENDING_APPROVAL' && (
                <>
                  <Button size="sm" variant="danger" className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100">
                    Request Revision
                  </Button>
                  <Button size="sm">
                    Approve
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

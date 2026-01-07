import React, { useState } from 'react';
import { Badge, Button, Card, Modal } from '../components/UI';
import { Leaf, Download, FileText, Sparkles } from 'lucide-react';
import { CarbonRecord } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateAiReport } from '../services/geminiService';

const CARBON_RECORDS: CarbonRecord[] = [
  { id: 'C-101', activity: 'No-Till Farming', co2Saved: 12.5, date: '2024-03-01', status: 'VERIFIED', region: 'North' },
  { id: 'C-102', activity: 'Cover Cropping', co2Saved: 8.2, date: '2024-03-05', status: 'VERIFIED', region: 'East' },
  { id: 'C-103', activity: 'Reforestation', co2Saved: 25.0, date: '2024-03-10', status: 'ESTIMATED', region: 'South' },
  { id: 'C-104', activity: 'Reduced Fertilizer', co2Saved: 5.4, date: '2024-03-12', status: 'VERIFIED', region: 'West' },
];

const CHART_DATA = [
  { day: 'Mon', credits: 120 },
  { day: 'Tue', credits: 132 },
  { day: 'Wed', credits: 101 },
  { day: 'Thu', credits: 134 },
  { day: 'Fri', credits: 190 },
  { day: 'Sat', credits: 230 },
  { day: 'Sun', credits: 210 },
];

export const CarbonView: React.FC = () => {
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportContent, setReportContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setIsReportModalOpen(true);
    setReportContent('');
    setIsGenerating(true);

    const context = "Annual Carbon Sequestration Report for Agricultural Activities. The goal is to certify these credits for the international market.";
    const result = await generateAiReport(context, CARBON_RECORDS);
    
    setReportContent(result);
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Carbon Credits</h1>
          <p className="text-slate-500">Track environmental impact and credit estimation.</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleGenerateReport}>
            <Sparkles size={18} className="mr-2 text-purple-600" /> Generate AI Report
          </Button>
          <Button>
            <Download size={18} className="mr-2" /> Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Carbon Credit Generation Trend</h3>
          <div className="h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <LineChart data={CHART_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="credits" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 bg-emerald-900 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Leaf className="text-emerald-400" size={24} />
              <h3 className="text-lg font-semibold">Total Impact</h3>
            </div>
            <p className="text-emerald-200 text-sm">Total CO2 Sequestered</p>
            <p className="text-4xl font-bold mt-2">1,245.8 <span className="text-lg font-normal text-emerald-300">Tons</span></p>
          </div>
          
          <div className="mt-8 space-y-4">
            <div className="bg-emerald-800/50 p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-emerald-200">Pending Verification</span>
                <span className="font-semibold">340 Tons</span>
              </div>
              <div className="w-full bg-emerald-900 rounded-full h-1.5">
                <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
             <div className="bg-emerald-800/50 p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-emerald-200">Sold Credits</span>
                <span className="font-semibold">$45,200</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6 border-b border-slate-100">
           <h3 className="text-lg font-semibold text-slate-900">Activity Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Activity</th>
                <th className="px-6 py-4">Region</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">CO2 Saved (Tons)</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CARBON_RECORDS.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-900">{record.activity}</td>
                  <td className="px-6 py-4 text-slate-500">{record.region}</td>
                  <td className="px-6 py-4 text-slate-500">{record.date}</td>
                  <td className="px-6 py-4 text-emerald-600 font-semibold">+{record.co2Saved}</td>
                  <td className="px-6 py-4">
                    <Badge variant={record.status === 'VERIFIED' ? 'success' : 'neutral'}>{record.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="AI Sustainability Report">
        <div className="space-y-4">
          {isGenerating ? (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 space-y-4">
              <Sparkles className="animate-pulse w-8 h-8 text-purple-500" />
              <p>Generating insights from carbon data...</p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none bg-slate-50 p-4 rounded-lg border border-slate-200">
               <pre className="whitespace-pre-wrap font-sans text-slate-700">{reportContent}</pre>
            </div>
          )}
          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
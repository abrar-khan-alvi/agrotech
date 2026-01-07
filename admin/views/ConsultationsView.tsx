import React, { useState } from 'react';
import { Card, Badge, Button, Modal } from '../components/UI';
import { MessageSquare, Clock, AlertCircle, FileText, CheckCircle, Sparkles } from 'lucide-react';
import { Consultation } from '../types';
import { analyzeAdvisoryRequest } from '../services/geminiService';

const MOCK_CONSULTATIONS: Consultation[] = [
  { 
    id: 'C-001', 
    farmerName: 'John Doe', 
    expertName: 'Dr. Alice Wong',
    topic: 'Leaf Yellowing - Nitrogen Deficiency', 
    status: 'ACTIVE', 
    priority: 'HIGH', 
    timestamp: '2 hours ago', 
    duration: '15:30',
    reportStatus: 'PENDING'
  },
  { 
    id: 'C-002', 
    farmerName: 'Emily Davis', 
    topic: 'Irrigation Scheduling', 
    status: 'NEW', 
    priority: 'MEDIUM', 
    timestamp: '5 hours ago', 
    reportStatus: 'PENDING'
  },
  { 
    id: 'C-003', 
    farmerName: 'Michael Brown', 
    expertName: 'Mr. David Kim',
    topic: 'Pest Control Strategy', 
    status: 'COMPLETED', 
    priority: 'LOW', 
    timestamp: '1 day ago', 
    duration: '45:00',
    reportStatus: 'APPROVED'
  },
];

export const ConsultationsView: React.FC = () => {
  const [consultations] = useState<Consultation[]>(MOCK_CONSULTATIONS);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAiAssist = async (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setIsModalOpen(true);
    setAiInsight("Analyzing request context...");
    // Simulate AI call or use real one
    const insight = await analyzeAdvisoryRequest(consultation.topic);
    setAiInsight(insight);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Consultations</h1>
          <p className="text-slate-500">Manage active sessions and assign experts.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {consultations.map((item) => (
          <Card key={item.id} className="p-0 overflow-hidden flex flex-col md:flex-row hover:bg-slate-50/50 transition-colors">
            <div className={`w-full md:w-1.5 bg-${item.priority === 'HIGH' ? 'red' : item.priority === 'MEDIUM' ? 'amber' : 'blue'}-500`} />
            <div className="p-6 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-slate-900">{item.topic}</h3>
                  <Badge variant={item.status === 'NEW' ? 'warning' : item.status === 'ACTIVE' ? 'info' : 'success'}>
                    {item.status}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center text-sm text-slate-500 gap-4">
                  <span className="flex items-center"><Clock size={14} className="mr-1" /> {item.timestamp}</span>
                  <span>Farmer: <span className="font-medium text-slate-700">{item.farmerName}</span></span>
                  {item.expertName && <span>Expert: <span className="font-medium text-emerald-600">{item.expertName}</span></span>}
                  {item.duration && <span>Duration: {item.duration}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.status === 'NEW' && (
                  <Button size="sm">Assign Expert</Button>
                )}
                {item.status === 'ACTIVE' && (
                  <Button size="sm" variant="secondary" onClick={() => handleAiAssist(item)}>
                    <Sparkles size={14} className="mr-1.5 text-purple-600" /> AI Insights
                  </Button>
                )}
                {item.reportStatus === 'APPROVED' && (
                  <Button size="sm" variant="outline" className="text-emerald-600 border-emerald-200">
                    <CheckCircle size={14} className="mr-1.5" /> Report Ready
                  </Button>
                )}
                <Button size="sm" variant="ghost">Details</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="AI Consultation Assistant">
        <div className="space-y-4">
           <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
             <h4 className="font-semibold text-slate-900 mb-2">Topic Analysis</h4>
             <p className="text-slate-700 text-sm whitespace-pre-line">{aiInsight}</p>
           </div>
           <div className="flex justify-end">
             <Button onClick={() => setIsModalOpen(false)}>Close</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

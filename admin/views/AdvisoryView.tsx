import React, { useState } from 'react';
import { Badge, Button, Card, Modal } from '../components/UI';
import { MessageSquare, Clock, Sparkles, User, AlertCircle } from 'lucide-react';
import { AdvisoryRequest } from '../types';
import { analyzeAdvisoryRequest } from '../services/geminiService';
import ReactMarkdown from 'react-markdown'; // Actually I can't add new libs. I will just render text.

const MOCK_REQUESTS: AdvisoryRequest[] = [
  { 
    id: '1', 
    farmerName: 'John Doe', 
    topic: 'Leaf Yellowing', 
    status: 'PENDING', 
    priority: 'HIGH', 
    timestamp: '2 hours ago', 
    description: 'My wheat crop leaves are turning yellow rapidly starting from the tips. I suspect nitrogen deficiency but need confirmation. It has spread to 20% of the field.' 
  },
  { 
    id: '2', 
    farmerName: 'Emily Davis', 
    topic: 'Irrigation Timing', 
    status: 'IN_PROGRESS', 
    priority: 'MEDIUM', 
    timestamp: '5 hours ago', 
    description: 'With the upcoming dry spell forecast, when is the optimal time to irrigate my soybean field to maximize water retention?' 
  },
  { 
    id: '3', 
    farmerName: 'Michael Brown', 
    topic: 'Pest Identification', 
    status: 'PENDING', 
    priority: 'LOW', 
    timestamp: '1 day ago', 
    description: 'Found small black beetles on the underside of cotton leaves. They seem to be eating the leaf tissue.' 
  },
];

export const AdvisoryView: React.FC = () => {
  const [requests, setRequests] = useState<AdvisoryRequest[]>(MOCK_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<AdvisoryRequest | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (request: AdvisoryRequest) => {
    setSelectedRequest(request);
    setIsAiModalOpen(true);
    setAiAnalysis('');
    setIsAnalyzing(true);
    
    const result = await analyzeAdvisoryRequest(request.description);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Advisory Monitoring</h1>
          <p className="text-slate-500">Track farmer queries and SLA compliance.</p>
        </div>
      </div>

      <div className="grid gap-4">
        {requests.map((req) => (
          <Card key={req.id} className="p-0 overflow-hidden flex flex-col md:flex-row">
            <div className={`w-full md:w-2 bg-${req.priority === 'HIGH' ? 'red' : req.priority === 'MEDIUM' ? 'amber' : 'blue'}-500`} />
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{req.topic}</h3>
                  <div className="flex items-center text-sm text-slate-500 mt-1">
                    <User size={14} className="mr-1" /> {req.farmerName}
                    <span className="mx-2">•</span>
                    <Clock size={14} className="mr-1" /> {req.timestamp}
                  </div>
                </div>
                <Badge variant={req.status === 'PENDING' ? 'warning' : 'info'}>{req.status}</Badge>
              </div>
              <p className="text-slate-600 mb-4 text-sm bg-slate-50 p-3 rounded-lg border border-slate-100">
                "{req.description}"
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                   {req.priority === 'HIGH' && <span className="text-xs font-bold text-red-600 flex items-center"><AlertCircle size={12} className="mr-1"/> High Priority</span>}
                </div>
                <div className="flex space-x-3">
                  <Button size="sm" variant="secondary" onClick={() => handleAnalyze(req)}>
                    <Sparkles size={14} className="mr-1.5 text-purple-600" /> AI Analyze
                  </Button>
                  <Button size="sm">Assign Expert</Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} title="AI Request Analysis">
        {selectedRequest && (
          <div className="space-y-4">
             <div className="bg-slate-50 p-3 rounded border border-slate-200">
                <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Original Request</p>
                <p className="text-sm text-slate-800">{selectedRequest.description}</p>
             </div>
             
             <div className="min-h-[150px]">
               {isAnalyzing ? (
                 <div className="flex items-center justify-center h-32 space-x-2 text-purple-600">
                   <Sparkles className="animate-pulse" />
                   <span className="font-medium">Gemini is analyzing...</span>
                 </div>
               ) : (
                 <div className="prose prose-sm prose-slate max-w-none">
                   <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center">
                     <Sparkles size={16} className="text-purple-600 mr-2" /> 
                     Analysis Result
                   </h4>
                   <div className="whitespace-pre-line text-sm text-slate-700 bg-purple-50 p-4 rounded-lg border border-purple-100">
                     {aiAnalysis}
                   </div>
                 </div>
               )}
             </div>
             
             <div className="flex justify-end pt-4">
               <Button onClick={() => setIsAiModalOpen(false)}>Close</Button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

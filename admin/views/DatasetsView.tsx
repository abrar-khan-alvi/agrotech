import React from 'react';
import { Card, Button } from '../components/UI';
import { Database, Download, Lock } from 'lucide-react';

export const DatasetsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Data Exports</h1>
        <p className="text-slate-500">Access anonymized agricultural datasets for research and partners.</p>
      </div>

      <Card className="p-8 text-center border-dashed border-2 border-slate-300 bg-slate-50">
        <div className="mx-auto w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
          <Lock className="text-slate-400" size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Secure Access Area</h3>
        <p className="text-slate-500 max-w-md mx-auto mt-2 mb-6">
          Dataset exports contain sensitive aggregated data. Actions are strictly logged. Only Super Admins can generate new exports.
        </p>
        <div className="flex justify-center gap-4">
          <Button>
            <Database size={18} className="mr-2" /> Generate New Export
          </Button>
          <Button variant="outline">
            <Download size={18} className="mr-2" /> Download History
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Card className="p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded text-blue-600"><Database size={20} /></div>
             <div>
               <h4 className="font-semibold text-slate-900">Q1 2024 Yield Data</h4>
               <p className="text-xs text-slate-500">Region: Northern • Size: 245MB</p>
             </div>
           </div>
           <Button size="sm" variant="outline">Download</Button>
         </Card>
         <Card className="p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded text-blue-600"><Database size={20} /></div>
             <div>
               <h4 className="font-semibold text-slate-900">Soil Health 2023 Aggregate</h4>
               <p className="text-xs text-slate-500">Region: All • Size: 1.2GB</p>
             </div>
           </div>
           <Button size="sm" variant="outline">Download</Button>
         </Card>
      </div>
    </div>
  );
};

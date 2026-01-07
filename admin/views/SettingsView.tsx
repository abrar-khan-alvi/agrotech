import React from 'react';
import { Card, Button, Input } from '../components/UI';
import { Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-slate-500">Configure regional pricing, thresholds, and notifications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Pricing Configuration</h3>
          <div className="space-y-4">
            <Input label="Standard Consultation Fee (৳)" defaultValue="500" />
            <Input label="Premium Consultation Fee (৳)" defaultValue="1200" />
            <Input label="Carbon Credit Base Price ($)" defaultValue="25.00" />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">Thresholds & Alerts</h3>
          <div className="space-y-4">
             <Input label="Pest Alert Threshold (Reports/Day)" defaultValue="15" />
             <Input label="Soil Moisture Warning Level (%)" defaultValue="20" />
             <div className="flex items-center justify-between pt-2">
               <span className="text-sm font-medium text-slate-700">Auto-approve Low Priority Reports</span>
               <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-emerald-600" />
             </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save size={18} className="mr-2" /> Save Changes
        </Button>
      </div>
    </div>
  );
};

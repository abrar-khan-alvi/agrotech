import React from 'react';
import { Users, Sprout, MessageSquare, TrendingUp, AlertTriangle, Activity, ArrowUpRight } from 'lucide-react';
import { Card, Badge, Button } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const KPI_STATS = [
  { label: 'Total Farmers', value: '12,453', change: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Active Fields', value: '8,230', change: '+8%', icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Consultations Today', value: '142', change: '+24%', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
  { label: 'Daily Revenue', value: '৳ 125K', change: '+18%', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

const ALERTS = [
  { id: 1, type: 'WARNING', message: 'High volume of pest reports in Eastern Valley', time: '45m ago' },
  { id: 2, type: 'INFO', message: '3 Experts waiting for verification', time: '2h ago' },
];

const REGIONAL_PERFORMANCE = [
  { region: 'Northern', requests: 450, revenue: 32000, status: 'High' },
  { region: 'Eastern', requests: 380, revenue: 28000, status: 'Normal' },
  { region: 'Southern', requests: 210, revenue: 15000, status: 'Low' },
  { region: 'Western', requests: 520, revenue: 41000, status: 'High' },
];

export const DashboardView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
          <p className="text-slate-500">Real-time operational metrics across all regions.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-slate-500 bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm">
           <Activity size={16} className="text-emerald-500" />
           <span>System Status: <strong>Operational</strong></span>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_STATS.map((stat, index) => (
          <Card key={index} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
              <span className={`text-xs font-medium ${stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'} flex items-center mt-1`}>
                <ArrowUpRight size={12} className="mr-0.5" /> {stat.change} vs last week
              </span>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area - Regional Performance */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Regional Performance</h3>
            <Button size="sm" variant="ghost">View Full Report</Button>
          </div>
          <div className="h-72 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={REGIONAL_PERFORMANCE}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Revenue" barSize={32} />
                <Bar dataKey="requests" fill="#10b981" radius={[4, 4, 0, 0]} name="Requests" barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Alerts Panel */}
        <Card className="p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-red-50/50 flex justify-between items-center">
             <h3 className="font-bold text-slate-900 flex items-center">
               <AlertTriangle size={18} className="text-red-500 mr-2" />
               System Alerts
             </h3>
             <Badge variant="error">{ALERTS.length}</Badge>
          </div>
          <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
            {ALERTS.map((alert) => (
              <div key={alert.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start">
                  <div className={`mt-0.5 w-2 h-2 rounded-full mr-3 shrink-0 ${
                    alert.type === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-slate-800">{alert.message}</p>
                    <span className="text-xs text-slate-500 mt-1 block">{alert.time}</span>
                  </div>
                </div>
              </div>
            ))}
            {ALERTS.length === 0 && (
               <div className="p-8 text-center text-slate-400 text-sm">No active alerts.</div>
            )}
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
            <Button variant="ghost" size="sm" className="w-full text-slate-600">View All Logs</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
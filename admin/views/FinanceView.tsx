import React from 'react';
import { Card, Badge, Button } from '../components/UI';
import { CreditCard, Download, TrendingUp } from 'lucide-react';
import { Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const TRANSACTIONS: Transaction[] = [
  { id: 'TX-1001', amount: 450, date: '2024-03-15', status: 'COMPLETED', payer: 'Northern Co-op', type: 'SUBSCRIPTION' },
  { id: 'TX-1002', amount: 120, date: '2024-03-14', status: 'COMPLETED', payer: 'John Doe', type: 'SERVICE_FEE' },
  { id: 'TX-1003', amount: 2500, date: '2024-03-12', status: 'PENDING', payer: 'Eastern AgriGroup', type: 'SUBSCRIPTION' },
  { id: 'TX-1004', amount: 75, date: '2024-03-10', status: 'FAILED', payer: 'Robert Johnson', type: 'SERVICE_FEE' },
];

const REVENUE_BY_REGION = [
  { name: 'Northern', value: 4500 },
  { name: 'Southern', value: 3200 },
  { name: 'Eastern', value: 2800 },
  { name: 'Western', value: 5100 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1'];

export const FinanceView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subscription & Payments</h1>
          <p className="text-slate-500">Monitor revenue streams and transaction history.</p>
        </div>
        <Button variant="outline">
          <Download size={18} className="mr-2" /> Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 col-span-1 lg:col-span-2">
           <h3 className="text-lg font-semibold text-slate-900 mb-6">Recent Transactions</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                 <tr>
                   <th className="px-4 py-3">Transaction ID</th>
                   <th className="px-4 py-3">Date</th>
                   <th className="px-4 py-3">Payer</th>
                   <th className="px-4 py-3">Type</th>
                   <th className="px-4 py-3">Amount</th>
                   <th className="px-4 py-3">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {TRANSACTIONS.map((tx) => (
                   <tr key={tx.id}>
                     <td className="px-4 py-3 font-medium text-slate-900">{tx.id}</td>
                     <td className="px-4 py-3 text-slate-500">{tx.date}</td>
                     <td className="px-4 py-3 text-slate-900">{tx.payer}</td>
                     <td className="px-4 py-3 text-xs text-slate-500">{tx.type}</td>
                     <td className="px-4 py-3 font-semibold text-slate-900">${tx.amount}</td>
                     <td className="px-4 py-3">
                       <Badge variant={tx.status === 'COMPLETED' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'error'}>
                         {tx.status}
                       </Badge>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </Card>

        <Card className="p-6">
           <h3 className="text-lg font-semibold text-slate-900 mb-2">Revenue by Region</h3>
           <div className="h-64 w-full min-w-0">
             <ResponsiveContainer width="100%" height="100%" minWidth={0}>
               <PieChart>
                 <Pie
                   data={REVENUE_BY_REGION}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={80}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {REVENUE_BY_REGION.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip />
                 <Legend verticalAlign="bottom" height={36}/>
               </PieChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-4 text-center">
             <p className="text-sm text-slate-500">Total Monthly Revenue</p>
             <p className="text-2xl font-bold text-slate-900">$15,600</p>
           </div>
        </Card>
      </div>
    </div>
  );
};
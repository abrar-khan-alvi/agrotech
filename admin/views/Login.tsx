import React, { useState } from 'react';
import { Button, Card, Input } from '../components/UI';
import { Leaf, Lock, Mail } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
           <div className="flex items-center space-x-2">
             <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
               <Leaf className="text-white" size={24} />
             </div>
             <span className="text-2xl font-bold text-slate-900 tracking-tight">AgriGuard</span>
           </div>
        </div>
        
        <Card className="p-8 shadow-xl border-0">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-slate-900">Admin Sign In</h2>
            <p className="text-slate-500 text-sm mt-1">Enter your credentials to access the dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="admin@agriguard.com" 
              icon={<Mail size={18}/>}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              icon={<Lock size={18}/>}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-600">
                <input type="checkbox" className="mr-2 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                Remember me
              </label>
              <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">Forgot password?</a>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
        </Card>
        
        <p className="text-center text-slate-400 text-xs mt-8">
          &copy; 2024 AgriGuard Inc. All rights reserved.
        </p>
      </div>
    </div>
  );
};

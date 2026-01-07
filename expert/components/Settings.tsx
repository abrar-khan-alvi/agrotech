import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Bell, Globe, Lock } from 'lucide-react';

export const Settings: React.FC = () => {
  const { dispatch } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <div className="p-4 md:p-8 md:pl-72 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Globe className="w-5 h-5" /></div>
             <div>
               <h3 className="font-bold text-gray-900">Language</h3>
               <p className="text-sm text-gray-500">English (Default)</p>
             </div>
          </div>
          <span className="text-xs font-bold text-gray-400">CHANGE</span>
        </div>

        <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><Bell className="w-5 h-5" /></div>
             <div>
               <h3 className="font-bold text-gray-900">Notifications</h3>
               <p className="text-sm text-gray-500">Push, Email</p>
             </div>
          </div>
          <span className="text-xs font-bold text-gray-400">EDIT</span>
        </div>

         <div className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center gap-4">
             <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Lock className="w-5 h-5" /></div>
             <div>
               <h3 className="font-bold text-gray-900">Security</h3>
               <p className="text-sm text-gray-500">Change Password</p>
             </div>
          </div>
          <span className="text-xs font-bold text-gray-400">UPDATE</span>
        </div>
      </div>

      <button 
        onClick={handleLogout}
        className="mt-8 w-full bg-red-50 text-red-600 font-bold py-3 rounded-xl border border-red-100 flex items-center justify-center gap-2"
      >
        <LogOut className="w-5 h-5" /> Log Out
      </button>
    </div>
  );
};

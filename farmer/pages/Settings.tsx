import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">সেটিংস</h2>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center space-x-4">
          <div className="w-12 h-12 bg-leaf-100 rounded-full flex items-center justify-center text-leaf-600 text-xl font-bold">
            {user?.name[0]}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.phone}</p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 text-left">
            <span className="flex items-center text-gray-700">
              <i className="fa-solid fa-language w-8 text-gray-400"></i> ভাষা পরিবর্তন
            </span>
            <span className="text-sm text-gray-400">বাংলা <i className="fa-solid fa-chevron-right ml-2"></i></span>
          </button>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 text-left">
            <span className="flex items-center text-gray-700">
              <i className="fa-solid fa-location-dot w-8 text-gray-400"></i> ঠিকানা পরিবর্তন
            </span>
            <i className="fa-solid fa-chevron-right text-gray-300"></i>
          </button>
          <button className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 text-left">
            <span className="flex items-center text-gray-700">
              <i className="fa-solid fa-shield-halved w-8 text-gray-400"></i> প্রাইভেসি পলিসি
            </span>
            <i className="fa-solid fa-chevron-right text-gray-300"></i>
          </button>
        </div>
      </div>

      <button onClick={handleLogout} className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold border border-red-100 hover:bg-red-100">
        লগআউট
      </button>
    </div>
  );
};

export default Settings;
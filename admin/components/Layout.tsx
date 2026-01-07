import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  UserCog, 
  Shield,
  Sprout,
  MessageSquare,
  FileText,
  Wifi,
  Leaf, 
  CreditCard,
  Database,
  History,
  Settings,
  Menu, 
  X,
  Bell,
  LogOut,
  Search,
  MapPin,
  ChevronDown,
  Map as MapIcon
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, setIsOpen, onLogout }) => {
  const menuGroups = [
    {
      label: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'map', label: 'Map & Operations', icon: <MapIcon size={18} /> },
      ]
    },
    {
      label: 'USERS',
      items: [
        { id: 'farmers', label: 'Farmers', icon: <Users size={18} /> },
        { id: 'experts', label: 'Experts', icon: <GraduationCap size={18} /> },
        { id: 'sub-admins', label: 'Sub-Admins', icon: <UserCog size={18} /> },
        { id: 'admins', label: 'Admins', icon: <Shield size={18} /> },
      ]
    },
    {
      label: 'OPERATIONS',
      items: [
        { id: 'fields', label: 'Fields & Farms', icon: <Sprout size={18} /> },
        { id: 'consultations', label: 'Consultations', icon: <MessageSquare size={18} /> },
        { id: 'reports', label: 'Report Review', icon: <FileText size={18} /> },
        { id: 'iot', label: 'IoT Devices', icon: <Wifi size={18} /> },
      ]
    },
    {
      label: 'BUSINESS',
      items: [
        { id: 'carbon', label: 'Carbon & ESG', icon: <Leaf size={18} /> },
        { id: 'finance', label: 'Finance', icon: <CreditCard size={18} /> },
        { id: 'datasets', label: 'Datasets', icon: <Database size={18} /> },
      ]
    },
    {
      label: 'SYSTEM',
      items: [
        { id: 'audits', label: 'Audit Logs', icon: <History size={18} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
      ]
    }
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed top-0 left-0 z-30 h-full w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Leaf className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">AgriGuard</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {menuGroups.map((group, idx) => (
            <div key={idx}>
              <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                {group.label}
              </h3>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id);
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all text-sm font-medium ${
                      activeView === item.id 
                        ? 'bg-emerald-600/10 text-emerald-400' 
                        : 'hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export const Layout: React.FC<{ 
  children: React.ReactNode; 
  activeView: string; 
  setActiveView: (view: string) => void;
  onLogout: () => void;
}> = ({ children, activeView, setActiveView, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('All Regions');

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        onLogout={onLogout}
      />
      
      <div className="flex flex-col lg:ml-64 transition-all duration-300 min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center flex-1">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 mr-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={24} />
            </button>
            
            {/* Search */}
            <div className="hidden md:flex items-center text-slate-400 bg-slate-50 rounded-lg px-3 py-1.5 w-64 border border-transparent focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-200 transition-all mr-4">
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="bg-transparent border-none focus:outline-none ml-2 w-full text-sm text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Region Selector */}
            <div className="hidden sm:flex items-center bg-slate-100 rounded-md px-3 py-1.5 border border-slate-200 cursor-pointer hover:bg-slate-200 transition-colors">
              <MapPin size={16} className="text-slate-500 mr-2" />
              <span className="text-sm font-medium text-slate-700 mr-1">{selectedRegion}</span>
              <ChevronDown size={14} className="text-slate-400" />
            </div>

            <button className="relative p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">Admin User</p>
                <p className="text-xs text-slate-500 font-medium">Super Admin</p>
              </div>
              <div className="h-9 w-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                SA
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

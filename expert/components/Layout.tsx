import React, { useEffect, useState } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useStore } from '../context/StoreContext';
// @ts-ignore
import { notificationService } from '../services/NotificationService';
import { LayoutDashboard, ClipboardList, User as UserIcon, LogOut, Settings, ToggleLeft, ToggleRight, MapPin } from 'lucide-react';

import { ExpertRequest, RequestStatus, Urgency } from '../types';

import toast from 'react-hot-toast';
import { FirebaseService } from '../services/FirebaseService';

export const Layout: React.FC = () => {
  const { state, dispatch } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (state.user?.id) {
      // --- FIREBASE INTEGRATION ---
      const unsubscribe = FirebaseService.listenToAllRequests((requests: any[]) => {
        console.log("Firebase Sync: Received", requests.length, "requests");

        // Filter requests relevant to this expert (or all if simulated)
        // For now, take all Pending + Assigned to Me
        const myRequests = requests.filter(r =>
          r.status === RequestStatus.NEW || // Show all pending
          (r.expert_id && r.expert_id.toString() === state.user?.id) // Or assigned to me
        );

        myRequests.forEach(apiReq => {
          // Check if we already have this request to avoid duplicate toasts (basic check)
          const exists = state.requests.find(r => r.id === apiReq.id.toString());

          const mappedReq: ExpertRequest = {
            id: apiReq.id.toString(),
            farmer: {
              id: apiReq.farmer.id.toString(),
              name: apiReq.farmer_name || apiReq.farmer?.name || "Unknown Farmer", // Handle different payload shapes
              phone: apiReq.farmer?.phone || "",
              location: apiReq.farmer?.location || 'Unknown',
              avatar: apiReq.farmer?.profile_picture || `https://ui-avatars.com/api/?name=${apiReq.farmer_name}&background=random`,
              experienceLevel: 'Intermediate',
              fields: apiReq.farmer?.fields || [],
            },
            status: apiReq.status,
            urgency: Urgency.MEDIUM,
            assignedDate: apiReq.created_at,
            issueType: apiReq.issue_type,
            description: apiReq.description,
            field: apiReq.field_details ? {
              name: apiReq.field_details.name,
              area: `${apiReq.field_details.area} acres`,
              crop: apiReq.field_details.crop || 'N/A',
              harvestTimeline: 'N/A',
              coordinates: apiReq.field_details.center
                ? [apiReq.field_details.center.lat, apiReq.field_details.center.lng]
                : [23.8103, 90.4125]
            } : {
              name: 'General Farm Profile',
              area: 'N/A',
              crop: 'N/A',
              harvestTimeline: 'N/A',
              coordinates: [23.8103, 90.4125]
            },
            aiAnalysis: apiReq.id === '21' ? {
              summary: "Leaf analysis indicates early-stage blight features. Recommended immediate fungicidal treatment to prevent spread.",
              confidence: "94%",
              riskAlerts: ["Fungal Infection", "High Humidity Risk"]
            } : undefined
          };

          // Upsert (Add or Update)
          if (!exists && mappedReq.status === RequestStatus.NEW) {
            toast.success(`New Request from ${mappedReq.farmer.name}`, { duration: 5000, icon: '🔔' });
            dispatch({ type: 'ADD_REQUEST', payload: mappedReq });
          } else if (exists && exists.status !== mappedReq.status) {
            dispatch({ type: 'UPDATE_REQUEST_STATUS', payload: { id: mappedReq.id, status: mappedReq.status } });
          } else if (!exists) {
            dispatch({ type: 'ADD_REQUEST', payload: mappedReq });
          }
        });
      });

      return () => unsubscribe();
    }
  }, [state.user?.id]);

  if (!state.user) {
    return <Navigate to="/login" replace />;
  }

  const handleToggleOnline = () => {
    setLoading(true);
    // OPTIMISTIC UPDATE: Update UI immediately
    dispatch({ type: 'TOGGLE_ONLINE_STATUS' });
    // Simulate API call or if we had a socket available here we would use it.
    // For now, since we are moving away from raw socket in Context to NotificationService (which is mostly receive-only or specialized),
    // we might just stick to the optimistic update or call an API endpoint if we had one.
    setTimeout(() => setLoading(false), 500);
  };

  const navItemClass = (path: string) => `
    flex flex-col items-center justify-center p-2 rounded-xl transition-all
    ${location.pathname === path ? 'text-green-700 bg-green-50' : 'text-gray-400 hover:text-green-600'}
  `;

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden relative">

      {/* 🔝 HEADER: Expert Info & Status */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center z-30 shadow-sm sticky top-0">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 mr-4 border-r pr-4 border-gray-200">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-gray-800 text-lg">Shonali Desh</span>
          </div>
          <img
            src={state.user?.avatar || `https://ui-avatars.com/api/?name=${state.user?.name || 'User'}&background=0D9488&color=fff`}
            alt="Profile"
            className="w-10 h-10 rounded-full border border-gray-200 object-cover"
          />
          <div>
            <h1 className="text-sm font-bold text-gray-900 leading-tight">{state.user?.name}</h1>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3" />
              {state.user?.region || 'BD'}
            </div>
          </div>
        </div>

        <button
          onClick={handleToggleOnline}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${state.isOnline
            ? 'bg-green-100 border-green-200 text-green-700'
            : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}
        >
          <span className="text-sm font-bold">{state.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          {state.isOnline ? <ToggleRight className="w-5 h-5 fill-current" /> : <ToggleLeft className="w-5 h-5" />}
        </button>
      </header>

      {/* 📱 MAIN CONTENT AREA */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0 scroll-smooth">
        <Outlet />
      </main>

      {/* 📱 BOTTOM NAVBAR (Mobile-First) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-40 safe-area-pb shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={() => navigate('/expert/dashboard')} className={navItemClass('/expert/dashboard')}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Dashboard</span>
        </button>
        <button onClick={() => navigate('/expert/requests')} className={navItemClass('/expert/requests')}>
          <div className="relative">
            <ClipboardList className="w-6 h-6" />
            {state.requests.filter(r => r.status === 'NEW').length > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
            )}
          </div>
          <span className="text-[10px] font-medium mt-1">Requests</span>
        </button>
        <button onClick={() => navigate('/expert/profile')} className={navItemClass('/expert/profile')}>
          <UserIcon className="w-6 h-6" />
          <span className="text-[10px] font-medium mt-1">Profile</span>
        </button>
      </nav>

      {/* 💻 DESKTOP SIDEBAR (Hidden on mobile) */}
      <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 flex-col p-4 z-20">
        <nav className="space-y-1 flex-1">
          <button onClick={() => navigate('/expert/dashboard')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${location.pathname.includes('dashboard') ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </button>
          <button onClick={() => navigate('/expert/requests')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${location.pathname.includes('requests') ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <ClipboardList className="w-5 h-5" /> Requests
          </button>
          <button onClick={() => navigate('/expert/profile')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${location.pathname.includes('profile') ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <UserIcon className="w-5 h-5" /> Profile
          </button>
          <button onClick={() => navigate('/expert/settings')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium ${location.pathname.includes('settings') ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}>
            <Settings className="w-5 h-5" /> Settings
          </button>
        </nav>
        <button onClick={() => { dispatch({ type: 'LOGOUT' }); navigate('/login'); }} className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium mt-auto">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      {/* Desktop Main Content Padding */}
      <div className="hidden md:block fixed top-16 left-64 right-0 bottom-0 pointer-events-none border-l border-transparent"></div>
    </div>
  );
};

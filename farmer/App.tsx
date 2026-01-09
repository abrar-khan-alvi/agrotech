import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppContext } from './context/AppContext';
import { FarmerProfile, ConsultationRequest, RiskLevel, Field } from './types';

// Components
import Login from './pages/Login';
import Register from './pages/Register';
import FieldList from './pages/FieldList';
import AddField from './pages/AddField';
import Dashboard from './pages/Dashboard';
import Experts from './pages/Consultation';
import Chatbot from './pages/Chatbot';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Layout from './components/Layout';

// Mock Data
const MOCK_PROFILE: FarmerProfile = {
  id: 'f123',
  name: 'রহিম উদ্দিন',
  phone: '01712345678',
  division: 'সিলেট',
  district: 'সিলেট',
  upazila: 'সদর',
  address: 'গ্রাম: খাদিমনগর, পোস্ট: লাক্কাতুরা',
  password: 'password123'
};

const MOCK_FIELDS: Field[] = [
  {
    id: '1',
    name: 'উত্তর পাড়ার জমি',
    crop_type: 'টি-আমন ধান',
    harvest_time: 'নভেম্বর ২০২৪',
    area: '৩০ শতাংশ',
    area_in_acres: 0.3,
    boundary: [
      { lat: 23.8103, lng: 90.4125 },
      { lat: 23.8115, lng: 90.4125 },
      { lat: 23.8115, lng: 90.4135 },
      { lat: 23.8103, lng: 90.4135 }
    ],
    center: { lat: 23.8109, lng: 90.4130 },
    lastUpdate: 'আজ সকাল ১০:০০',
    soilHealth: { nitrogen: 'Low', phosphorus: 'Good', potassium: 'Medium', phLevel: 6.5 },
    sensorData: { moisture: '42%', temperature: '28°C', humidity: '75%' },
    risks: { flood: RiskLevel.HIGH, salinity: RiskLevel.LOW, disease: RiskLevel.MEDIUM }
  },
  {
    id: '2',
    name: 'পুকুর পাড় সবজি ক্ষেত',
    crop_type: 'আলু',
    area: '১৫ শতাংশ',
    area_in_acres: 0.15,
    boundary: [
      { lat: 23.8200, lng: 90.4200 },
      { lat: 23.8210, lng: 90.4200 },
      { lat: 23.8210, lng: 90.4210 },
      { lat: 23.8200, lng: 90.4210 }
    ],
    center: { lat: 23.8205, lng: 90.4205 },
    lastUpdate: 'গতকাল',
    soilHealth: { nitrogen: 'Good', phosphorus: 'Good', potassium: 'Good', phLevel: 7.0 },
    sensorData: { moisture: '28%', temperature: '26°C', humidity: '60%' },
    risks: { flood: RiskLevel.LOW, salinity: RiskLevel.LOW, disease: RiskLevel.LOW }
  }
];

// Moved to context/AppContext.tsx
// Hooks were misplaced here. Removed.

// React.useEffect(() => {
//   if (user) {
//     const ws = new WebSocket(`ws://127.0.0.1:8000/ws/status/?user_id=${user.id}`);

//     ws.onopen = () => console.log("✅ WebSocket Connected (Farmer App)");

//     ws.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         if (data.type === 'status_update') {
//           console.log("Status Update Received:", data);
//           setLastExpertUpdate({ expertId: data.expert_id.toString(), isOnline: data.is_online });
//         }

//         if (data.type === 'request_status_update') {
//           console.log("Your request status updated:", data);
//           // Verify if we have this request in state, update it
const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FarmerProfile | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastExpertUpdate, setLastExpertUpdate] = useState<{ expertId: string; isOnline: boolean } | null>(null);

  // WebSocket Connection via Service (DISABLED)
  /*
  React.useEffect(() => {
    if (user?.id) {
      import('./services/NotificationService').then(({ notificationService }) => {
        notificationService.connect(user.id);

        notificationService.onNotification((data) => {
          if (data.event === 'expert_status' && data.data) {
            console.log("Status Update Received:", data.data);
            setLastExpertUpdate({ expertId: data.data.expert_id.toString(), isOnline: data.data.is_online });
          }

          if (data.event === 'status_change' && data.data) { // Check payload structure from backend
            // The backend sends: type: "notification", payload: { event: "status_change", message: "...", data: {...} }
            // Our service unwraps 'type: notification' and passes 'payload'.
            // So 'data' here IS that payload.
            console.log("Request Update:", data);
            const backendData = data.data; // The inner data object

            setRequests(prev => prev.map(r => r.id.toString() === backendData.id.toString() ? { ...r, status: backendData.status } : r));
            alert(`Request Update: ${data.message}`);
          }
        });
      });

      };
    }
  }, [user?.id]);
  */

  // Load User from LocalStorage on mount
  React.useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      fetchFields(); // Load fields if logged in
      fetchRequests(); // Load requests 
    }
    setLoading(false);
  }, []);

  const fetchFields = async () => {
    try {
      const { default: api } = await import('./services/api');
      const res = await api.get('/fields/');
      // Transform Backend Field to Frontend Field
      const mappedFields = res.data.map((f: any) => ({
        id: (f.fieldID || f.id).toString(),
        name: f.fieldName || f.name,
        crop_type: f.fieldCropName || f.crop_type,
        harvestTime: f.fieldCropHarvestTime || f.harvest_time,
        area: `${f.fieldArea || f.area} একর`,
        area_in_acres: f.fieldArea || f.area_in_acres,
        boundary: f.fieldCoordinates || f.boundary,
        center: f.center || (f.fieldCoordinates && f.fieldCoordinates[0]) || { lat: 23.8, lng: 90.4 },
        created_at: f.createTime || f.created_at,
        lastUpdate: new Date(f.createTime || f.created_at || Date.now()).toLocaleDateString(),
        soilHealth: { nitrogen: 'Unknown', phosphorus: 'Unknown', potassium: 'Unknown', phLevel: 0 }, // Placeholder until sensor data
        sensorData: { moisture: '--', temperature: '--', humidity: '--' },
        risks: { flood: RiskLevel.LOW, salinity: RiskLevel.LOW, disease: RiskLevel.LOW }
      }));
      setFields(mappedFields);
    } catch (err: any) {
      console.error("Failed to fetch fields", err);
      if (err.response && err.response.status === 401) {
        logout();
      }
    }
  };

  const fetchRequests = async () => {
    try {
      const { default: api } = await import('./services/api');
      // Base URL is /api/v1/, so we just need /consultations/
      const res = await api.get('/consultations/');
      const dataWithStringIds = res.data.map((r: any) => ({
        ...r,
        id: r.id.toString()
      }));
      setRequests(dataWithStringIds);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  const login = (profile: FarmerProfile, token?: string) => {
    setUser(profile);
    localStorage.setItem('user', JSON.stringify(profile));
    if (token) localStorage.setItem('accessToken', token);
    fetchFields();
  };

  const logout = () => {
    setUser(null);
    setFields([]);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
  };

  const addField = async (field: any) => {
    // NOTE: We will handle API call in AddField.tsx, here we just refresh
    fetchFields();
  };

  // NOTE: isRegistered is now handled by backend 404/200 flow, not client side check
  const isRegistered = (phone: string) => true;

  const updateField = (fieldId: string, updates: Partial<Field>) => {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, ...updates } : f));
  };

  const removeField = async (fieldId: string) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে আপনি এই জমিটি মুছে ফেলতে চান?")) return;
    try {
      const { default: api } = await import('./services/api');
      await api.delete(`/fields/${fieldId}/`);
      setFields(prev => prev.filter(f => f.id !== fieldId));
    } catch (err) {
      console.error("Failed to delete field", err);
      alert("জমি মুছতে সমস্যা হয়েছে!");
    }
  };

  const addRequest = (req: ConsultationRequest) => {
    setRequests(prev => [req, ...prev]);
  };

  return (
    <AppContext.Provider value={{ user, login, logout, fields, addField, updateField, removeField, requests, addRequest, isRegistered, lastExpertUpdate }}>
      {!loading && children}
    </AppContext.Provider>
  );
};

// --- Protected Route Wrapper ---
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useContext(AppContext); // Use useContext with AppContext
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Routes without Bottom Nav */}
      <Route path="/fields" element={<ProtectedRoute><Layout><FieldList /></Layout></ProtectedRoute>} />
      <Route path="/field/add" element={<ProtectedRoute><Layout><AddField /></Layout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />

      {/* Routes with Bottom Nav (Field Context) */}
      <Route path="/field/:fieldId" element={<ProtectedRoute><Layout><Outlet /></Layout></ProtectedRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="experts" element={<Experts />} />
        <Route path="chat" element={<Chatbot />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      <Route path="/" element={<Navigate to="/fields" replace />} />
      <Route path="*" element={<Navigate to="/fields" replace />} />
    </Routes >
  );
};

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
}
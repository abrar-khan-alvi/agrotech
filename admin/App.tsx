import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { DashboardView } from './views/Dashboard';
import { MapView } from './views/MapView';
import { FarmersView } from './views/FarmersView';
import { ExpertsView } from './views/ExpertsView';
import { SubAdminsView } from './views/SubAdminsView';
import { FieldsView } from './views/FieldsView';
import { ConsultationsView } from './views/ConsultationsView';
import { ReportsView } from './views/ReportsView';
import { IoTView } from './views/IoTView';
import { CarbonView } from './views/CarbonView';
import { FinanceView } from './views/FinanceView';
import { DatasetsView } from './views/DatasetsView';
import { AuditView } from './views/AuditView';
import { SettingsView } from './views/SettingsView';
import { Login } from './views/Login';

// Placeholder for Admins View
const AdminsView = () => (
  <div className="space-y-6">
     <h1 className="text-2xl font-bold text-slate-900">Admin Hierarchy</h1>
     <div className="p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center text-slate-500">
       Management interface for Regional and Central Admins.
     </div>
  </div>
);

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <DashboardView />;
      case 'map': return <MapView />;
      
      // Users
      case 'farmers': return <FarmersView />;
      case 'experts': return <ExpertsView />;
      case 'sub-admins': return <SubAdminsView />;
      case 'admins': return <AdminsView />;
      
      // Operations
      case 'fields': return <FieldsView />;
      case 'consultations': return <ConsultationsView />;
      case 'reports': return <ReportsView />;
      case 'iot': return <IoTView />;
      
      // Business
      case 'carbon': return <CarbonView />;
      case 'finance': return <FinanceView />;
      case 'datasets': return <DatasetsView />;
      
      // System
      case 'audits': return <AuditView />;
      case 'settings': return <SettingsView />;
      
      default: return <DashboardView />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Layout 
      activeView={activeView} 
      setActiveView={setActiveView}
      onLogout={() => setIsAuthenticated(false)}
    >
      {renderView()}
    </Layout>
  );
};

export default App;

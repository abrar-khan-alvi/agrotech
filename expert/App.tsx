import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { Register } from './components/Register';
import CompleteProfile from './pages/CompleteProfile';
import { Dashboard } from './components/Dashboard';
import { RequestList } from './components/RequestList';
import { RequestDetail } from './components/RequestDetail';
import { ConsultationCall } from './components/ConsultationCall';
import { ReportSubmission } from './components/ReportSubmission';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';

import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />

          <Route path="/expert" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="requests" element={<RequestList />} />
            <Route path="requests/:id" element={<RequestDetail />} />
            <Route path="report/:id" element={<ReportSubmission />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/call/:id" element={<ConsultationCall />} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
};

export default App;

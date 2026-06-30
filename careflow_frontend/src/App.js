import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import QueueManagementDashboard from './pages/QueueManagementDashboard';
import CustomerDashboard from './pages/CustomerDashboard';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('loan_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('loan_user');
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />

        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute allowedRoles={['customer', 'patient']}>
              <Layout user={user} setUser={setUser}>
                <CustomerDashboard user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Layout user={user} setUser={setUser}>
                <PatientDashboard user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/queue-management"
          element={
            <ProtectedRoute allowedRoles={['doctor', 'receptionist', 'admin']}>
              <Layout user={user} setUser={setUser}>
                <QueueManagementDashboard user={user} />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

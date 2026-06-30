import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userRaw = localStorage.getItem('loan_user');

  if (!token || !userRaw) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'customer') {
      return <Navigate to="/customer-dashboard" replace />;
    }
    if (role === 'patient') {
      return <Navigate to="/patient-dashboard" replace />;
    }
    return <Navigate to="/queue-management" replace />;
  }

  return children;
}

import React from 'react';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) return <div className="loading">Checking authentication...</div>;

  if (!isAuthenticated) {
    window.location.href = '/landing.html';
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
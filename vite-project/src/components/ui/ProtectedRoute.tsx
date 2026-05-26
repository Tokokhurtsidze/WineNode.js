import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B0E14]">
        <div className="w-8 h-8 border-2 border-[#5b1f1f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/auth/login" state={{ from: location }} replace />;
};

export const AdminRoute = () => {
  const { user, userProfile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0B0E14]">
        <div className="w-8 h-8 border-2 border-[#B89968] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth/login" state={{ from: location }} replace />;
  if (userProfile?.role !== 'admin') return <Navigate to="/" replace />;

  return <Outlet />;
};

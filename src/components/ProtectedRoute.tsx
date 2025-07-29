import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
  const location = useLocation();

  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Rol kontrolü
  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = authService.getUserRole();
    if (!userRole || !requiredRoles.includes(userRole)) {
      return <Navigate to="/products" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;

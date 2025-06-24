import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

interface LogoutRouteProps {
  children: React.ReactNode;
}

const LogoutRoute: React.FC<LogoutRouteProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Clear token and redirect immediately if on login page
  React.useEffect(() => {
    if (location.pathname === '/login') {
      // Clear token from localStorage and cookies
      authService.clearToken();
      localStorage.removeItem('auth_token');
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // Redirect to login page
      navigate('/login', { replace: true });
    }
  }, [location.pathname, navigate]);

  return <>{children}</>;
};

export default LogoutRoute;

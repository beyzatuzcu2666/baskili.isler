import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';

interface AuthCheckProps {
  children: React.ReactNode;
}

const AuthCheck: React.FC<AuthCheckProps> = ({ children }) => {
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!authService.isAuthenticated()) {
        navigate('/login');
      }
      setIsInitialized(true);
    };
    checkAuth();
  }, [navigate]);

  if (!isInitialized) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default AuthCheck;

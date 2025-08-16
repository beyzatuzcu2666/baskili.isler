import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import Products from './components/Products';
import Offers from './components/Offers';
import Brands from './components/Brands';
import Dealers from './components/Dealers';
import DealerDetail from './components/DealerDetail';
import Orders from './components/Orders';
import Factories from './components/Factories';
import Notifications from './components/Notifications';
import Users from './components/Users';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCheck from './components/AuthCheck';
import LogoutRoute from './components/LogoutRoute';
import { DealerProvider } from './contexts/DealerContext';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Sidebar genişlik değerleri - tek yerden yönetim
const DRAWER_WIDTH = 280;
const COLLAPSED_DRAWER_WIDTH = 80;

// Layout component - Outlet kullanarak stabil layout
const Layout = () => {
  const theme = useTheme();
  const isMobileQuery = useMediaQuery(theme.breakpoints.down('md'));
  
  // Debounced mobile state
  const [isMobile, setIsMobile] = useState(isMobileQuery);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsMobile(isMobileQuery);
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [isMobileQuery]);

  const drawerWidth = useMemo(() => {
    if (isMobile) return DRAWER_WIDTH;
    return isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH;
  }, [isMobile, isCollapsed]);

  const handleToggleCollapse = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  return (
    <AuthCheck>
      <ProtectedRoute>
        <Box sx={{ 
          display: 'flex', 
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Sidebar 
            isCollapsed={isCollapsed} 
            setIsCollapsed={handleToggleCollapse}
          />
          <Topbar 
            drawerWidth={drawerWidth}
            isCollapsed={isCollapsed}
            onToggleSidebar={handleToggleSidebar}
          />
          <Box 
            component="main" 
            sx={{
              flexGrow: 1,
              width: isMobile ? '100%' : `calc(100% - ${COLLAPSED_DRAWER_WIDTH}px)`,
              ml: isMobile ? 0 : `${COLLAPSED_DRAWER_WIDTH}px`,
              p: 0,
              pt: isMobile ? 8 : 9,
              minHeight: '100vh',
              overflow: 'auto',
              maxWidth: '100%',
              boxSizing: 'border-box',
              backgroundColor: '#f8fafc',
              position: 'relative',
              transition: theme.transitions.create(['margin-left', 'width'], {
                easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
                duration: '300ms',
              }),
            }}
          >
            <Outlet />
          </Box>
        </Box>
      </ProtectedRoute>
    </AuthCheck>
  );
};

function App() {
  return (
    <Router>
      <DealerProvider>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          backgroundColor: 'background.default'
        }}>
          <LogoutRoute>
                          <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/" element={<Navigate to="/login" replace />} />

              {/* Layout route with nested routes */}
              <Route path="/" element={<Layout />}>
                <Route path="orders" element={<Orders />} />
                {/* FACTORY_USER dışındaki roller için diğer route'lar */}
                <Route path="products" element={<ProtectedRoute requiredRoles={['SUPER_ADMIN','DEALER_ADMIN','DEALER_USER']}> <Products /> </ProtectedRoute>} />
                <Route path="offers" element={<ProtectedRoute requiredRoles={['SUPER_ADMIN','DEALER_ADMIN','DEALER_USER']}> <Offers /> </ProtectedRoute>} />
                <Route path="brands" element={<ProtectedRoute requiredRoles={['SUPER_ADMIN','DEALER_ADMIN','DEALER_USER']}> <Brands /> </ProtectedRoute>} />
                <Route path="dealers" element={<ProtectedRoute requiredRoles={['SUPER_ADMIN','DEALER_ADMIN']}> <Dealers /> </ProtectedRoute>} />
                <Route path="dealers/:id" element={<ProtectedRoute requiredRoles={['SUPER_ADMIN','DEALER_ADMIN']}> <DealerDetail /> </ProtectedRoute>} />
                <Route path="factory" element={<ProtectedRoute requiredRoles={['SUPER_ADMIN','FACTORY_USER']}> <Factories /> </ProtectedRoute>} />
                <Route path="notifications" element={<ProtectedRoute requiredRoles={['SUPER_ADMIN','DEALER_ADMIN','FACTORY_USER']}> <Notifications /> </ProtectedRoute>} />
                <Route path="users" element={<ProtectedRoute requiredRoles={['SUPER_ADMIN','DEALER_ADMIN']}> <Users /> </ProtectedRoute>} />
                <Route path="dashboard" element={<ProtectedRoute requiredRoles={['SUPER_ADMIN']}> <Dashboard /> </ProtectedRoute>} />
                {/* Varsayılan yönlendirme */}
                <Route path="*" element={<Navigate to="/orders" replace />} />
              </Route>
            </Routes>
          </LogoutRoute>
          
          {/* Global Loading Overlay */}
          <GlobalLoadingOverlay />
          
          {/* Toast Container */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
            style={{
              fontSize: '16px',
              zIndex: 9999,
            }}
          />
        </Box>
      </DealerProvider>
    </Router>
  );
}

// Export constants for other components
export { DRAWER_WIDTH, COLLAPSED_DRAWER_WIDTH };
export default App;

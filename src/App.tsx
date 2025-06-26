import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Login from './components/Login';
import Products from './components/Products';
import Offers from './components/Offers';
import Brands from './components/Brands';
import Orders from './components/Orders';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthCheck from './components/AuthCheck';
import LogoutRoute from './components/LogoutRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authService } from './services/auth';

const drawerWidth = 232;

function App() {
  useEffect(() => {
    // Clear any existing token on initial load
    authService.clearToken();
  }, []);

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <LogoutRoute>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/products" element={
            <AuthCheck>
              <ProtectedRoute>
                <>
                  <Sidebar />
                  <Box sx={{
                    marginLeft: '210px',
                  }}>
                    <Topbar />
                    <Box
                      component="main"
                      sx={{
                        flexGrow: 1,
                        p: 3,
                        width: `calc(100% - ${drawerWidth}px)`,
                        transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
                      }}
                    >
                      <Toolbar />
                      <Products />
                    </Box>
                  </Box>
                </>
              </ProtectedRoute>
            </AuthCheck>
          } />

          <Route path="/offers" element={
            <AuthCheck>
              <ProtectedRoute>
                <>
                  <Sidebar />
                  <Box sx={{
                    marginLeft: '210px',
                  }}>
                    <Topbar />
                    <Box
                      component="main"
                      sx={{
                        flexGrow: 1,
                        p: 3,
                        width: `calc(100% - ${drawerWidth}px)`,
                        transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
                      }}
                    >
                      <Toolbar />
                      <Offers />
                    </Box>
                  </Box>
                </>
              </ProtectedRoute>
            </AuthCheck>
          } />

          <Route path="/brands" element={
            <AuthCheck>
              <ProtectedRoute>
                <>
                  <Sidebar />
                  <Box sx={{ 
                    marginLeft: '210px',
                  }}>
                    <Topbar />
                    <Box
                      component="main"
                      sx={{
                        flexGrow: 1,
                        p: 3,
                        width: `calc(100% - ${drawerWidth}px)`,
                        transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
                      }}
                    >
                      <Toolbar />
                      <Brands />
                    </Box>
                  </Box>
                </>
              </ProtectedRoute>
            </AuthCheck>
          } />

          <Route path="/orders" element={
            <AuthCheck>
              <ProtectedRoute>
                <>
                  <Sidebar />
                  <Box sx={{ 
                    marginLeft: '210px',
                  }}>
                    <Topbar />
                    <Box
                      component="main"
                      sx={{
                        flexGrow: 1,
                        p: 3,
                        width: `calc(100% - ${drawerWidth}px)`,
                        transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
                      }}
                    >
                      <Toolbar />
                      <Orders />
                    </Box>
                  </Box>
                </>
              </ProtectedRoute>
            </AuthCheck>
          } />
          </Routes>
        </LogoutRoute>
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
        />
      </Box>
    </Router>
  );
}

export default App;

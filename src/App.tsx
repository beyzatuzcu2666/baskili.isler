import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './components/Sidebar';
import Topbar from "./components/Topbar";
import Login from './components/Login';
import Products from './components/Products';
import Offers from './components/Offers';
import Brands from './components/Brands';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { authService } from './services/auth';

const drawerWidth = 232;

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/products" replace />} />

          <Route path="/products" element={
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
                      width: '100%',
                      transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
                    }}
                  >
                    <Toolbar />
                    <Products />
                  </Box>
                </Box>
              </>
            </ProtectedRoute>
          } />

          <Route path="/offers" element={
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
                      width: '100%',
                      transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
                    }}
                  >
                    <Toolbar />
                    <Offers />
                  </Box>
                </Box>
              </>
            </ProtectedRoute>
          } />

          <Route path="/brands" element={
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
                      width: '100%',
                      transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out'
                    }}
                  >
                    <Toolbar />
                    <Brands />
                  </Box>
                </Box>
              </>
            </ProtectedRoute>
          } />
        </Routes>
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

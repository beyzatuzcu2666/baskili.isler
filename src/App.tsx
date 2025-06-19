import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Brands from './pages/Brands';
import Employees from './pages/Employees';
import { Box, Toolbar } from '@mui/material';
import Topbar from "./components/Topbar";
import Orders from "./pages/Orders";
import Login from './components/Login';
import { authService } from './services/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const drawerWidth = 240;

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/" 
            element={authService.isAuthenticated() ? <Navigate to="/brands" /> : <Navigate to="/login" />}
          />
          <Route 
            path="/brands" 
            element={authService.isAuthenticated() ? (
              <>
                <Sidebar />
                <Box sx={{ flexGrow: 1 }}>
                  <Topbar />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      p: 3,
                      width: `calc(100% - ${drawerWidth}px)`,
                    }}
                  >
                    <Toolbar />
                    <Brands />
                  </Box>
                </Box>
              </>
            ) : <Navigate to="/login" />}
          />
          <Route 
            path="/orders" 
            element={authService.isAuthenticated() ? (
              <>
                <Sidebar />
                <Box sx={{ flexGrow: 1 }}>
                  <Topbar />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      p: 3,
                      width: `calc(100% - ${drawerWidth}px)`,
                    }}
                  >
                    <Toolbar />
                    <Orders />
                  </Box>
                </Box>
              </>
            ) : <Navigate to="/login" />}
          />
          <Route 
            path="/employees" 
            element={authService.isAuthenticated() ? (
              <>
                <Sidebar />
                <Box sx={{ flexGrow: 1 }}>
                  <Topbar />
                  <Box
                    component="main"
                    sx={{
                      flexGrow: 1,
                      p: 3,
                      width: `calc(100% - ${drawerWidth}px)`,
                    }}
                  >
                    <Toolbar />
                    <Employees />
                  </Box>
                </Box>
              </>
            ) : <Navigate to="/login" />}
          />
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

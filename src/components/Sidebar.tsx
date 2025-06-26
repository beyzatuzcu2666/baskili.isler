import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  IconButton, 
  Box
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StoreIcon from '@mui/icons-material/Store';
import ListAltIcon from '@mui/icons-material/ListAlt';
import logo from '../assets/logo.png';

const drawerWidth = 250;
const collapsedWidth = 70;

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Ürünler', path: '/products', icon: <StoreIcon /> },
    { text: 'Teklifler', path: '/offers', icon: <ListAltIcon /> },
    { text: 'Markalar', path: '/brands', icon: <StoreIcon /> },
    { text: 'Siparişler', path: '/orders', icon: <ListAltIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: isCollapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: isCollapsed ? collapsedWidth : drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#0D47A1',
          color: '#fff',
          transition: 'width 0.3s ease-in-out',
        },
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 2,
        pb: 1,
        bgcolor: '#0D47A1'
      }}>
        <img
          src={logo}
          alt="Baskılı İşler Logo"
          style={{
            width: '100px',
            height: 'auto',
            marginBottom: '1rem',
            display: isCollapsed ? 'none' : 'block'
          }}
        />
      </Box>
      <Toolbar>
        <IconButton onClick={() => setIsCollapsed(!isCollapsed)} sx={{ ml: 1 }}>
          {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </IconButton>
      </Toolbar>
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {menuItems.map((item) => (
            <ListItem 
              disablePadding 
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 16px',
                borderRadius: 1,
                backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ color: 'inherit', display: isCollapsed ? 'none' : 'block' }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;

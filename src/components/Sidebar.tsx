import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Box,
  Typography,
  Tooltip,
  Divider,
  useTheme,
  useMediaQuery,
  SwipeableDrawer,
  Chip
} from '@mui/material';


import MenuIcon from '@mui/icons-material/Menu';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import BusinessIcon from '@mui/icons-material/Business';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PrintIcon from '@mui/icons-material/Print';
import FactoryIcon from '@mui/icons-material/Factory';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { DRAWER_WIDTH, COLLAPSED_DRAWER_WIDTH } from '../App';
import { authService } from '../services/auth';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobileQuery = useMediaQuery(theme.breakpoints.down('md'));
  

  
  // Debounced mobile state to prevent unnecessary re-renders
  const [isMobile, setIsMobile] = useState(isMobileQuery);

  // Debounce mobile state changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsMobile(isMobileQuery);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isMobileQuery]);

  const menuItems = [
    { 
      text: 'Ürünler', 
      path: '/products', 
      icon: <InventoryIcon />,
      color: '#64748b',
      description: 'Ürün kataloğu',
      requiredRoles: ['SUPER_ADMIN', 'DEALER_ADMIN', 'DEALER_USER', 'FACTORY_USER']
    },
    { 
      text: 'Müşteriler', 
      path: '/brands', 
      icon: <BusinessIcon />,
      color: '#10b981',
      description: 'Müşteri yönetimi',
      requiredRoles: ['SUPER_ADMIN', 'DEALER_ADMIN', 'DEALER_USER', 'FACTORY_USER']
    },
    { 
      text: 'Teklifler', 
      path: '/offers', 
      icon: <LocalOfferIcon />,
      color: '#f97316',
      description: 'Fiyat teklifleri',
      requiredRoles: ['SUPER_ADMIN', 'DEALER_ADMIN', 'DEALER_USER', 'FACTORY_USER']
    },
    { 
      text: 'Siparişler', 
      path: '/orders', 
      icon: <ShoppingCartIcon />,
      color: '#1e3a8a',
      description: 'Sipariş takibi',
      requiredRoles: ['SUPER_ADMIN', 'DEALER_ADMIN', 'FACTORY_USER']
    },
    { 
      text: 'Bildirimler', 
      path: '/notifications', 
      icon: <NotificationsIcon />,
      color: '#f59e0b',
      description: 'Sistem bildirimleri',
      requiredRoles: ['SUPER_ADMIN', 'DEALER_ADMIN', 'FACTORY_USER']
    },
  ];

  const managementItems = [
    {
      text: 'Fabrika',
      path: '/factory',
      icon: <FactoryIcon />,
      color: '#8b5cf6',
      description: 'Fabrika yönetimi',
      isNew: true,
      requiredRoles: ['SUPER_ADMIN', 'FACTORY_USER']
    },
    {
      text: 'Kullanıcılar',
      path: '/users',
      icon: <PersonIcon />,
      color: '#06b6d4',
      description: 'Kullanıcı yönetimi',
      isNew: true,
      requiredRoles: ['SUPER_ADMIN']
    }
  ];



  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const getDrawerWidth = () => {
    if (isMobile) return DRAWER_WIDTH;
    return isCollapsed ? COLLAPSED_DRAWER_WIDTH : DRAWER_WIDTH;
  };

  // Kullanıcının rolüne göre menü öğelerini filtrele
  const filterMenuItemsByRole = (items: any[]) => {
    const userRole = authService.getUserRole();
    return items.filter(item => {
      if (!item.requiredRoles) return true;
      return item.requiredRoles.includes(userRole);
    });
  };

  const userRole = authService.getUserRole();

  // FACTORY_USER ise sadece Siparişler menüsü
  const filteredMenuItems = userRole === 'FACTORY_USER'
    ? [
        {
          text: 'Siparişler',
          path: '/orders',
          icon: <ShoppingCartIcon />,
          color: '#1e3a8a',
          description: 'Sipariş takibi',
        },
      ]
    : filterMenuItemsByRole(menuItems);

  const filteredManagementItems = userRole === 'FACTORY_USER' ? [] : filterMenuItemsByRole(managementItems);

  const renderMenuItem = (item: any, isActive: boolean) => (
    <Tooltip 
      key={item.path} 
      title={(isCollapsed && !isMobile) ? item.text : ''} 
      placement="right"
      disableHoverListener={!isCollapsed || isMobile}
    >
      <ListItem 
        onClick={() => handleNavigation(item.path)}
      sx={{
          mb: 1,
          borderRadius: 2,
          cursor: 'pointer',
          position: 'relative',
          py: 1.5,
          px: 2,
          background: isActive 
            ? `rgba(${item.color === '#10b981' ? '16, 185, 129' : item.color === '#f97316' ? '249, 115, 22' : item.color === '#1e3a8a' ? '30, 58, 138' : item.color === '#8b5cf6' ? '139, 92, 246' : item.color === '#06b6d4' ? '6, 182, 212' : '100, 116, 139'}, 0.15)`
            : 'transparent',
          border: isActive ? `1px solid ${item.color}40` : '1px solid transparent',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.1)',
            transform: 'translateX(2px)',
          },
          '&::before': isActive ? {
            content: '""',
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: '60%',
            background: item.color,
            borderRadius: '0 2px 2px 0',
          } : {},
        }}
      >
        <ListItemIcon 
          sx={{ 
            color: isActive ? item.color : 'rgba(255, 255, 255, 0.8)',
            minWidth: (isCollapsed && !isMobile) ? 'auto' : 40,
            mr: (isCollapsed && !isMobile) ? 0 : 2,
            transition: 'color 0.2s ease-in-out',
            justifyContent: 'center',
          }}
        >
          {item.icon}
        </ListItemIcon>
        
        {(!isCollapsed || isMobile) && (
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: isActive ? 'white' : 'rgba(255, 255, 255, 0.9)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.9rem',
                    }}
                  >
                    {item.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      fontSize: '0.7rem',
                      display: 'block',
                      mt: 0.2,
                    }}
                  >
                    {item.description}
                  </Typography>
                </Box>
                {item.isNew && (
                  <Chip
                    label="YENİ"
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.6rem',
                      fontWeight: 600,
                      backgroundColor: '#10b981',
                      color: 'white',
                      '& .MuiChip-label': {
                        px: 1,
                      }
                    }}
                  />
                )}
              </Box>
            }
          />
        )}
        
        {(!isCollapsed || isMobile) && isActive && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: item.color,
              boxShadow: `0 0 8px ${item.color}60`,
      }}
          />
        )}
      </ListItem>
    </Tooltip>
  );

  const DrawerContent = () => (
      <Box sx={{
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header Section */}
      <Box
        sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
          pt: 3,
          pb: 2,
          px: 2,
          background: 'rgba(255, 255, 255, 0.05)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        {(!isCollapsed || isMobile) && (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f97316 0%, #1e3a8a 100%)',
                mb: 2,
                boxShadow: '0 8px 25px rgba(249, 115, 22, 0.3)',
              }}
            >
              <PrintIcon sx={{ fontSize: 28, color: 'white' }} />
      </Box>
            
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '1.1rem',
                textAlign: 'center',
                color: 'white',
                mb: 0.5,
              }}
            >
              Baskılı İşler
            </Typography>
            
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.75rem',
                textAlign: 'center',
                fontWeight: 400,
              }}
            >
              Matbaa Yönetim Sistemi
            </Typography>
          </>
        )}
        
        {(isCollapsed && !isMobile) && (
          <Tooltip title="Baskılı İşler" placement="right">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f97316 0%, #1e3a8a 100%)',
                boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)',
              }}
            >
              <PrintIcon sx={{ fontSize: 20, color: 'white' }} />
            </Box>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mx: 2, mb: 2 }} />

      {/* Navigation Menu */}
      <Box sx={{ px: 2, flex: 1, overflow: 'auto' }}>
        {/* Ana Menü */}
        {(!isCollapsed || isMobile) && (
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              mb: 1,
              display: 'block',
              px: 2,
              }}
            >
            Ana Menü
          </Typography>
        )}
        
        <List sx={{ padding: 0, mb: 2 }}>
          {filteredMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return renderMenuItem(item, isActive);
          })}
        </List>

        {/* Yönetim Bölümü */}
        {(!isCollapsed || isMobile) && (
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              mb: 1,
              display: 'block',
              px: 2,
            }}
          >
            Yönetim
          </Typography>
        )}
        
        <List sx={{ padding: 0, mb: 2 }}>
          {filteredManagementItems.map((item) => {
            const isActive = location.pathname === item.path;
            return renderMenuItem(item, isActive);
          })}
        </List>


      </Box>

      {/* Footer */}
      {(!isCollapsed || isMobile) && (
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '0.7rem',
              textAlign: 'center',
              display: 'block',
            }}
          >
            v1.0.0 - 2024
          </Typography>
        </Box>
      )}
    </Box>
  );

  // Mobile Menu Button
  const MobileMenuButton = () => (
    <IconButton
      color="inherit"
      aria-label="open drawer"
      edge="start"
      onClick={handleDrawerToggle}
      sx={{
        position: 'fixed',
        top: 16,
        left: 16,
        zIndex: 1201,
        background: 'rgba(30, 58, 138, 0.9)',
        color: 'white',
        borderRadius: 2,
        width: 48,
        height: 48,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(30, 58, 138, 0.3)',
        '&:hover': {
          background: 'rgba(30, 58, 138, 1)',
          transform: 'scale(1.05)',
        },
        display: { md: 'none' },
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <MenuIcon />
    </IconButton>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && <MobileMenuButton />}
      
      {/* Mobile Drawer */}
      {isMobile ? (
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onOpen={() => setMobileOpen(true)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              background: 'linear-gradient(180deg, #374151 0%, #1f2937 100%)',
              borderRight: 'none',
              borderRadius: 0,
              boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
            },
          }}
        >
          <DrawerContent />
        </SwipeableDrawer>
      ) : (
        // Desktop Drawer
        <Drawer
          variant="permanent"
          sx={{
            width: getDrawerWidth(),
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: {
              width: getDrawerWidth(),
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #374151 0%, #1f2937 100%)',
              color: '#fff',
              transition: theme.transitions.create('width', {
                easing: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
                duration: '300ms',
              }),
              borderRight: 'none',
              borderRadius: 0,
              boxShadow: '4px 0 20px rgba(0, 0, 0, 0.15)',
              overflowX: 'hidden',
            },
          }}
        >
          <DrawerContent />
    </Drawer>
      )}
    </>
  );
};

export default Sidebar;

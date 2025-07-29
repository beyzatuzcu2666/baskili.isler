import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Badge,
    Tooltip,
    Divider,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    NotificationsNone as NotificationsIcon,
    Person as PersonIcon,
    ExitToApp as LogoutIcon,
    Menu as MenuIcon,
    FullscreenExit as FullscreenIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth';
import { notificationsService } from '../services/notifications';
import NotificationPanel from './NotificationPanel';


interface TopbarProps {
  drawerWidth: number;
  isCollapsed: boolean;
  onToggleSidebar?: () => void;
}

const Topbar = ({ drawerWidth, isCollapsed, onToggleSidebar }: TopbarProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
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

    const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
        setNotificationAnchor(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
        setNotificationAnchor(null);
    };

    const handleLogout = async () => {
        try {
            authService.clearToken();
            navigate('/login');
        } catch (error) {
            console.error('Çıkış yaparken bir hata oluştu:', error);
        }
        handleClose();
    };



    // Load notification count on mount
    useEffect(() => {
        const loadNotificationCount = async () => {
            try {
                const count = await notificationsService.getUnreadCount();
                setUnreadCount(count);
            } catch (error) {
                console.error('Error loading notification count:', error);
            }
        };

        loadNotificationCount();
        
        // Refresh count every 30 seconds
        const interval = setInterval(loadNotificationCount, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
                ml: isMobile ? 0 : `${drawerWidth}px`,
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid #e2e8f0',
                borderRadius: '0 0 16px 16px',
                color: '#1f2937',
                zIndex: theme.zIndex.drawer + 1,
                transition: theme.transitions.create(['width', 'margin'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
        >
            <Toolbar 
                sx={{ 
                    justifyContent: 'space-between',
                    minHeight: '64px !important',
                    px: { xs: 2, sm: 3, md: 1 }, // Sol padding minimum
                    pr: { xs: 2, sm: 3, md: 3 }, // Sağ padding normal
                    borderRadius: '0 0 16px 16px',
                }}
            >
                {/* Sol Taraf - Sidebar Toggle ve Bayi Seçici */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Sidebar Toggle Button */}
                    <Tooltip title={isMobile ? "Menüyü Aç/Kapat" : (isCollapsed ? "Sidebar'ı Genişlet" : "Sidebar'ı Daralt")}>
                        <IconButton
                            onClick={onToggleSidebar}
                            sx={{
                                color: '#64748b',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                borderRadius: '12px',
                                '&:hover': { 
                                    backgroundColor: 'rgba(255, 255, 255, 1)',
                                    transform: 'scale(1.05)',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <MenuIcon />
                        </IconButton>
                    </Tooltip>


                </Box>

                {/* Sağ Taraf */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Tam Ekran */}
                    <Tooltip title="Tam Ekran">
                        <IconButton
                            sx={{
                                color: '#64748b',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                borderRadius: '12px',
                                '&:hover': { 
                                    backgroundColor: 'rgba(255, 255, 255, 1)',
                                    transform: 'scale(1.05)',
                                },
                                transition: 'all 0.2s ease',
                            }}
                            onClick={() => {
                                if (!document.fullscreenElement) {
                                    document.documentElement.requestFullscreen();
                                } else {
                                    document.exitFullscreen();
                                }
                            }}
                        >
                            <FullscreenIcon />
                        </IconButton>
                    </Tooltip>

                    {/* Bildirimler */}
                    <Tooltip title="Bildirimler">
                        <IconButton
                            onClick={handleNotificationClick}
                            sx={{
                                color: '#64748b',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                borderRadius: '12px',
                                '&:hover': { 
                                    backgroundColor: 'rgba(255, 255, 255, 1)',
                                    transform: 'scale(1.05)',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <Badge badgeContent={unreadCount} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* Profil */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 1 }}>


                        {/* Avatar */}
                        <Tooltip title="Profil">
                            <IconButton 
                                onClick={handleProfileClick}
                                sx={{ 
                                    p: 0,
                                    '&:hover': {
                                        '& .MuiAvatar-root': {
                                            transform: 'scale(1.1)',
                                            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                                        }
                                    }
                                }}
                            >
                                <Avatar 
                                    sx={{ 
                                        width: 40, 
                                        height: 40,
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        fontWeight: 700,
                                        fontSize: '1rem',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)',
                                    }}
                                >
                                    BT
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Toolbar>

            {/* Notification Panel */}
            <NotificationPanel
                anchorEl={notificationAnchor}
                open={Boolean(notificationAnchor)}
                onClose={handleClose}
            />

            {/* Profil Menüsü */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 200,
                        mt: 1,
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                        border: '1px solid #e2e8f0',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem 
                    onClick={handleClose}
                    sx={{ 
                        py: 2,
                        px: 3,
                        borderRadius: '8px',
                        mx: 1,
                        my: 0.5,
                        '&:hover': { backgroundColor: '#f8fafc' }
                    }}
                >
                    <ListItemIcon>
                        <PersonIcon sx={{ color: '#64748b' }} />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Profil" 
                        sx={{ '& .MuiListItemText-primary': { color: '#1e293b', fontWeight: 500 } }}
                    />
                </MenuItem>
                
                <Divider sx={{ my: 1, mx: 2 }} />
                
                <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                        py: 2,
                        px: 3,
                        borderRadius: '8px',
                        mx: 1,
                        my: 0.5,
                        '&:hover': { backgroundColor: '#fef2f2' }
                    }}
                >
                    <ListItemIcon>
                        <LogoutIcon sx={{ color: '#ef4444' }} />
                    </ListItemIcon>
                    <ListItemText 
                        primary="Çıkış Yap" 
                        sx={{ '& .MuiListItemText-primary': { color: '#ef4444', fontWeight: 500 } }}
                    />
                </MenuItem>
            </Menu>
        </AppBar>
    );
};

export default Topbar;

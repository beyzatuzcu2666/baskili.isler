import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Box,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import StoreIcon from '@mui/icons-material/Store';
import ListAltIcon from '@mui/icons-material/ListAlt';
import PeopleIcon from '@mui/icons-material/People';

const drawerWidth = 240;

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Markalar', path: '/brands', icon: <StoreIcon /> },
        { text: 'Siparişler', path: '/orders', icon: <ListAltIcon /> },
        { text: 'Çalışanlar', path: '/employees', icon: <PeopleIcon /> },
    ];

    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: {
                    width: drawerWidth,
                    boxSizing: 'border-box',
                    backgroundColor: '#0D47A1',
                    color: '#fff',
                },
            }}
        >
            <Toolbar>
                <Typography
                    variant="h6"
                    noWrap
                    component="div"
                    sx={{ color: '#fff', fontWeight: 'bold' }}
                >
                    Baskılı İşler
                </Typography>
            </Toolbar>
            <Box sx={{ overflow: 'auto' }}>
                <List>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;

                        return (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton
                                    onClick={() => navigate(item.path)}
                                    sx={{
                                        color: isActive ? '#0D47A1' : '#fff',
                                        backgroundColor: isActive ? '#fff' : 'transparent',
                                        '&:hover': {
                                            backgroundColor: isActive ? '#e3f2fd' : '#1565C0',
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{ color: isActive ? '#0D47A1' : '#fff' }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar;

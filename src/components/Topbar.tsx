import React, { useState } from 'react';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
} from '@mui/material';

const Topbar = () => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfile = () => {
        alert('Profil sayfasına yönlendiriliyor...');
        handleClose();
    };

    const handleLogout = () => {
        alert('Çıkış yapılıyor...');
        handleClose();
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                width: `calc(100% - 240px)`,
                ml: `240px`,
                backgroundColor: '#1976d2',
            }}
        >
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" noWrap>
                </Typography>
                <Box>
                    <IconButton onClick={handleClick} sx={{ p: 0 }}>
                        <Avatar alt="Beyza Tuzcu" src="/static/images/avatar/1.jpg" />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                    >
                        <MenuItem onClick={handleProfile}>Profil</MenuItem>
                        <MenuItem onClick={handleLogout}>Çıkış Yap</MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Topbar;

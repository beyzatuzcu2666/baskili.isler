import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import { useDealer } from '../contexts/DealerContext';

const GlobalLoadingOverlay: React.FC = () => {
  const { isChangingDealer } = useDealer();

  if (!isChangingDealer) {
    return null;
  }

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.drawer + 2,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(4px)',
      }}
      open={true}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          p: 4,
          borderRadius: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <CircularProgress 
          size={60} 
          thickness={4}
          sx={{ 
            color: 'primary.main',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }}
        />
        <Box sx={{ textAlign: 'center' }}>
          <BusinessIcon 
            sx={{ 
              fontSize: 40, 
              color: 'primary.main',
              mb: 1,
              animation: 'pulse 2s infinite'
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: 'white',
              mb: 1
            }}
          >
            Bayi Değiştiriliyor...
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)',
              maxWidth: 300
            }}
          >
            Seçili bayinin verileri yükleniyor. Lütfen bekleyin.
          </Typography>
        </Box>
      </Box>
    </Backdrop>
  );
};

export default GlobalLoadingOverlay; 
import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import { useDealer } from '../contexts/DealerContext';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showDealerBadge?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  showDealerBadge = true 
}) => {
  const { selectedDealer, isSuperAdmin } = useDealer();

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
          {title}
        </Typography>
        
        {/* Bayi Rozeti - Sadece Super Admin için ve bayi seçiliyse */}
        {showDealerBadge && isSuperAdmin && selectedDealer && (
          <Chip
            icon={<BusinessIcon />}
            label={`${selectedDealer.name} (${selectedDealer.code})`}
            size="small"
            sx={{
              backgroundColor: '#10b98120',
              color: '#10b981',
              fontWeight: 500,
              fontSize: '0.75rem',
              height: 24,
              '& .MuiChip-icon': {
                color: '#10b981',
                fontSize: '0.875rem',
              }
            }}
          />
        )}
      </Box>
      
      {subtitle && (
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}; 
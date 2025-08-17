import React from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  CircularProgress,
  Typography,
  Chip,
  Tooltip
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import { useDealer } from '../contexts/DealerContext';
import { authService } from '../services/auth';

const DealerSelector: React.FC = () => {
  const { selectedDealer, setSelectedDealer, dealers, loading, error, isSuperAdmin } = useDealer();

  if (!isSuperAdmin) {
    return null;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Yükleniyor...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Tooltip title={error}>
        <Chip
          icon={<BusinessIcon />}
          label="Hata"
          color="error"
          size="small"
          variant="outlined"
        />
      </Tooltip>
    );
  }

  return (
    <Autocomplete
      options={dealers}
      value={selectedDealer}
      onChange={(_, newValue) => {
        setSelectedDealer(newValue);
      }}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          size="small"
          placeholder="Dealer seçin..."
          sx={{
            minWidth: 200,
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            },
          }}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                <BusinessIcon color="primary" fontSize="small" />
              </Box>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                {option.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.admin?.email || 'E-posta bilgisi yok'}
              </Typography>
            </Box>
            {option.id === 1 && (
              <Chip
                label="Ana Bayi"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </Box>
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id}
            label={option.name}
            icon={<BusinessIcon />}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))
      }
      sx={{
        '& .MuiAutocomplete-popupIndicator': {
          color: 'primary.main',
        },
      }}
    />
  );
};

export default DealerSelector; 
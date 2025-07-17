import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Switch,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, Factory as FactoryIcon } from '@mui/icons-material';
import { Factory } from '../types/factory';

interface FactoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Factory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Factory;
  title: string;
  isUpdate?: boolean;
}

export const FactoryFormModal: React.FC<FactoryFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  title,
  isUpdate = false,
}) => {
  const [formData, setFormData] = useState<Omit<Factory, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    address: '',
    phoneNumber: '',
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        address: initialData.address,
        phoneNumber: initialData.phoneNumber,
        active: initialData.active,
      });
    } else {
      setFormData({
        name: '',
        address: '',
        phoneNumber: '',
        active: true,
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Fabrika adı gereklidir';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adres gereklidir';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Telefon numarası gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          pb: 2,
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              backgroundColor: '#10b98120',
              color: '#10b981',
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FactoryIcon />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
            {title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#6b7280' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Fabrika Adı"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              error={!!errors.name}
              helperText={errors.name}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10b981',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#10b981',
                },
              }}
            />
            <TextField
              fullWidth
              label="Telefon Numarası"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10b981',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#10b981',
                },
              }}
            />
          </Box>

          <TextField
            fullWidth
            label="Adres"
            multiline
            rows={3}
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            error={!!errors.address}
            helperText={errors.address}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#10b981',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#10b981',
              },
            }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#10b981',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#10b981',
                  },
                }}
              />
            }
            label={
              <Typography variant="body1" sx={{ color: '#374151', fontWeight: 500 }}>
                Fabrika Aktif
              </Typography>
            }
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb', gap: 2 }}>
        <Button 
          onClick={onClose}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            color: '#6b7280',
            '&:hover': {
              backgroundColor: '#f3f4f6',
            },
          }}
        >
          İptal
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            backgroundColor: '#10b981',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            '&:hover': {
              backgroundColor: '#059669',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
            },
          }}
        >
          {isUpdate ? 'Güncelle' : 'Ekle'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 
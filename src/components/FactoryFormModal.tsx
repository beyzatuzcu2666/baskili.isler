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
  Divider,
} from '@mui/material';
import { Close as CloseIcon, Factory as FactoryIcon, Person as PersonIcon } from '@mui/icons-material';
import { Factory, CreateFactoryRequest, UpdateFactoryRequest } from '../types/factory';

interface FactoryFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFactoryRequest | UpdateFactoryRequest) => void;
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
  const [formData, setFormData] = useState<CreateFactoryRequest>({
    factory: {
      name: '',
      address: '',
      factoryNumber: '',
      active: true,
    },
    user: {
      name: '',
      email: '',
      phoneNumber: '',
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData && isUpdate) {
      // Update mode - sadece factory bilgileri
      setFormData({
        factory: {
          name: initialData.name,
          address: initialData.address,
          factoryNumber: initialData.factoryNumber || '',
          active: initialData.active ?? true,
        },
        user: {
          name: '',
          email: '',
          phoneNumber: '',
        }
      });
    } else {
      // Create mode - tüm bilgiler
      setFormData({
        factory: {
          name: '',
          address: '',
          factoryNumber: '',
          active: true,
        },
        user: {
          name: '',
          email: '',
          phoneNumber: '',
        }
      });
    }
    setErrors({});
  }, [initialData, open, isUpdate]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Factory validation
    if (!formData.factory.name.trim()) {
      newErrors['factory.name'] = 'Fabrika adı gereklidir';
    }

    if (!formData.factory.address.trim()) {
      newErrors['factory.address'] = 'Adres gereklidir';
    }

    if (!formData.factory.factoryNumber.trim()) {
      newErrors['factory.factoryNumber'] = 'Fabrika numarası gereklidir';
    }

    // User validation - sadece create mode'da
    if (!isUpdate) {
      if (!formData.user.name.trim()) {
        newErrors['user.name'] = 'Kullanıcı adı gereklidir';
      }

      if (!formData.user.email.trim()) {
        newErrors['user.email'] = 'E-posta gereklidir';
      } else if (!/\S+@\S+\.\S+/.test(formData.user.email)) {
        newErrors['user.email'] = 'Geçerli bir e-posta adresi giriniz';
      }

      if (!formData.user.phoneNumber.trim()) {
        newErrors['user.phoneNumber'] = 'Kullanıcı telefon numarası gereklidir';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      if (isUpdate) {
        // Update mode - sadece factory bilgileri
        const updateData: UpdateFactoryRequest = {
          name: formData.factory.name,
          address: formData.factory.address,
          factoryNumber: formData.factory.factoryNumber,
          active: initialData?.active ?? true,
        };
        onSubmit(updateData);
      } else {
        // Create mode - tüm bilgiler
        onSubmit(formData);
      }
      onClose();
    }
  };

  const handleInputChange = (section: 'factory' | 'user', field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    
    const errorKey = `${section}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
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
              value={formData.factory.name}
              onChange={(e) => handleInputChange('factory', 'name', e.target.value)}
              error={!!errors['factory.name']}
              helperText={errors['factory.name']}
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
              label="Adres"
              multiline
              rows={3}
              value={formData.factory.address}
              onChange={(e) => handleInputChange('factory', 'address', e.target.value)}
              error={!!errors['factory.address']}
              helperText={errors['factory.address']}
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
            label="Fabrika Numarası"
            value={formData.factory.factoryNumber}
            onChange={(e) => handleInputChange('factory', 'factoryNumber', e.target.value)}
            error={!!errors['factory.factoryNumber']}
            helperText={errors['factory.factoryNumber']}
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

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              fullWidth
              label="Kullanıcı Adı"
              value={formData.user.name}
              onChange={(e) => handleInputChange('user', 'name', e.target.value)}
              error={!!errors['user.name']}
              helperText={errors['user.name']}
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
              label="E-posta"
              value={formData.user.email}
              onChange={(e) => handleInputChange('user', 'email', e.target.value)}
              error={!!errors['user.email']}
              helperText={errors['user.email']}
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
            label="Kullanıcı Telefon Numarası"
            value={formData.user.phoneNumber}
            onChange={(e) => handleInputChange('user', 'phoneNumber', e.target.value)}
            error={!!errors['user.phoneNumber']}
            helperText={errors['user.phoneNumber']}
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
                checked={formData.factory.active}
                onChange={(e) => handleInputChange('factory', 'active', e.target.checked)}
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
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import { brandsService } from '../services/brands';
import { usersService } from '../services/users';
import { toast } from 'react-toastify';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useDealer } from '../contexts/DealerContext';
import { authService } from '../services/auth';

interface BrandFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    contactEmail: string;
    contactPhone: string;
    assignedUserId?: number;
  }) => Promise<{ id: number } | void>;
  initialData?: {
    name: string;
    contactEmail: string;
    contactPhone: string;
    logoUrl?: string;
    assignedUserId?: number;
  };
  title: string;
  isUpdate?: boolean;
  brandId?: number;
  loading?: boolean;
}

export const BrandFormModal: React.FC<BrandFormModalProps> = ({ open, onClose, onSubmit, initialData, title, isUpdate, brandId, loading = false }) => {
  const { selectedDealer } = useDealer();
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
    assignedUserId: initialData?.assignedUserId || undefined,
  });
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  
  // Kullanıcı listesi için state
  const [users, setUsers] = useState<Array<{ id: number; name: string; email: string }>>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Logo önizlemesi için effect
  React.useEffect(() => {
    if (logoFile) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(logoFile);
    } else {
      setLogoPreview(null);
    }
  }, [logoFile]);

  // Güncellemede mevcut logo varsa göster
  React.useEffect(() => {
    if (initialData && (initialData as any).logoUrl) {
      setLogoPreview((initialData as any).logoUrl);
    }
  }, [initialData]);

  // Kullanıcıları yükle
  useEffect(() => {
    const loadUsers = async () => {
      if (!open) return; // Modal açık değilse yükleme
      
      try {
        setUsersLoading(true);
        const userRole = authService.getUserRole();
        let usersData;
        
        if (userRole === 'DEALER_ADMIN') {
          // DEALER_ADMIN için kendi bayisinin kullanıcıları
          usersData = await usersService.getUsers();
        } else if (userRole === 'SUPER_ADMIN' && selectedDealer) {
          // SUPER_ADMIN için seçili dealer'ın kullanıcıları
          usersData = await usersService.getUsers(selectedDealer.id);
        } else {
          // SUPER_ADMIN için dealer seçilmemişse tüm kullanıcılar
          usersData = await usersService.getUsers();
        }
        
        setUsers(usersData || []);
      } catch (error) {
        console.error('Error loading users:', error);
        toast.error('Kullanıcı listesi yüklenemedi');
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, [open, selectedDealer]);

  // Türkiye telefon numarası validation fonksiyonu
  const validatePhoneNumber = (phone: string): string => {
    if (!phone.trim()) {
      return '';
    }

    // Sadece rakam, boşluk, tire, parantez ve + işaretine izin ver
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    // Türkiye telefon formatları:
    // +90XXXXXXXXXX (13 karakter)
    // 0XXXXXXXXXX (11 karakter)
    // 5XXXXXXXXX (10 karakter - cep telefonu)
    
    if (cleanPhone.startsWith('+90')) {
      if (cleanPhone.length !== 13) {
        return 'Telefon numarası +90 ile başlıyorsa 13 haneli olmalıdır (+90XXXXXXXXXX)';
      }
      const phoneWithoutCountryCode = cleanPhone.substring(3);
      if (!/^[1-9]\d{9}$/.test(phoneWithoutCountryCode)) {
        return 'Geçersiz telefon numarası formatı';
      }
    } else if (cleanPhone.startsWith('0')) {
      if (cleanPhone.length !== 11) {
        return 'Telefon numarası 0 ile başlıyorsa 11 haneli olmalıdır (0XXXXXXXXXX)';
      }
      if (!/^0[1-9]\d{9}$/.test(cleanPhone)) {
        return 'Geçersiz telefon numarası formatı';
      }
    } else if (cleanPhone.startsWith('5')) {
      if (cleanPhone.length !== 10) {
        return 'Cep telefonu numarası 10 haneli olmalıdır (5XXXXXXXXX)';
      }
      if (!/^5\d{9}$/.test(cleanPhone)) {
        return 'Geçersiz cep telefonu numarası formatı';
      }
    } else {
      return 'Telefon numarası +90, 0 veya 5 ile başlamalıdır';
    }

    return '';
  };

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        contactEmail: initialData.contactEmail,
        contactPhone: initialData.contactPhone,
        assignedUserId: initialData.assignedUserId,
      });
      setPhoneError('');
    }
  }, [initialData]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Sadece rakam, boşluk, tire, parantez ve + işaretine izin ver
    const filteredValue = value.replace(/[^\d\s\-\(\)\+]/g, '');
    
    // Maksimum 15 karakter sınırı (uluslararası format için +90XXXXXXXXXX)
    if (filteredValue.length > 15) {
      return;
    }
    
    setFormData({ ...formData, contactPhone: filteredValue });
    
    // Validation çalıştır
    const error = validatePhoneNumber(filteredValue);
    setPhoneError(error);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Sadece PNG veya JPG dosyası yükleyebilirsiniz.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo en fazla 2MB olmalı.');
      return;
    }
    setLogoFile(file);
  };

  const handleSubmit = async () => {
    // Form submit öncesi final validation
    const phoneValidationError = validatePhoneNumber(formData.contactPhone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      return;
    }
    setIsSubmitting(true);
    try {
      console.log('1) Brand oluşturuluyor...');
      // Önce brand kaydı/güncellemesi
      const result = await onSubmit(formData);
      console.log('2) Brand oluşturuldu, result:', result);
      let id = brandId;
      if (!isUpdate && result && (result as { id: number }).id) {
        id = (result as { id: number }).id;
        console.log('2.1) Yeni brand id:', id);
      }
      // Logo seçildiyse yükle
      if (logoFile && id) {
        console.log('3) Logo yükleniyor...');
        setLogoUploading(true);
        await brandsService.uploadBrandLogo(id, logoFile);
        setLogoUploading(false);
        console.log('4) Logo yüklendi!');
        toast.success('Logo başarıyla yüklendi!');
      }
      onClose();
    } catch (error) {
      console.error('HATA:', error);
      toast.error('Form gönderilirken hata oluştu.');
      setIsSubmitting(false);
      setLogoUploading(false);
      return;
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {/* Logo Yükle Alanı */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Box
            sx={{
              border: `2px dashed ${logoFile ? '#10b981' : '#cbd5e1'}`,
              borderRadius: 2,
              p: 0,
              width: 140,
              height: 140,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              cursor: 'pointer',
              backgroundColor: '#f8fafc',
              transition: 'border-color 0.2s',
              '&:hover': {
                borderColor: '#10b981',
              },
              mx: 'auto',
            }}
            component="label"
          >
            <input
              type="file"
              accept="image/png, image/jpeg"
              hidden
              onChange={handleLogoChange}
              disabled={logoUploading || isSubmitting}
            />
            {logoPreview ? (
              <>
                <img
                  src={logoPreview}
                  alt="Logo Önizleme"
                  style={{
                    maxWidth: 120,
                    maxHeight: 120,
                    borderRadius: 8,
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    bgcolor: 'rgba(0,0,0,0.35)',
                    color: '#fff',
                    opacity: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 2,
                    fontWeight: 500,
                    fontSize: 16,
                    transition: 'opacity 0.2s',
                    pointerEvents: 'none',
                    zIndex: 2,
                    '&:hover': {
                      opacity: 1,
                      pointerEvents: 'auto',
                    },
                  }}
                  className="logo-upload-overlay"
                >
                  Değiştir
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', color: '#94a3b8' }}>
                <CloudUploadIcon sx={{ fontSize: 40, mb: 1 }} />
                <Box sx={{ fontWeight: 500, fontSize: 16 }}>Logo Yükle</Box>
              </Box>
            )}
          </Box>
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 400 }}>
              PNG/JPG, max 2MB
            </span>
          </Box>
        </Box>
        {/* Diğer form alanları */}
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Müşteri Adı"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="E-posta"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Telefon Numarası"
            value={formData.contactPhone}
            onChange={handlePhoneChange}
            margin="normal"
            error={!!phoneError}
            helperText={phoneError || 'Örnek: +905XXXXXXXXX, 05XXXXXXXXX veya 5XXXXXXXXX'}
            placeholder="+905XXXXXXXXX"
            inputProps={{
              maxLength: 15,
              inputMode: 'tel',
            }}
          />
          
          {/* Assigned User Seçimi */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Atanan Kullanıcı</InputLabel>
            <Select
              value={formData.assignedUserId || ''}
              onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value as number || undefined })}
              label="Atanan Kullanıcı"
              disabled={usersLoading}
            >
              <MenuItem value="">
                <em>Kullanıcı seçiniz</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {user.email}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
            {usersLoading && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                <Typography variant="caption" color="text.secondary">
                  Kullanıcılar yükleniyor...
                </Typography>
              </Box>
            )}
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading || isSubmitting || logoUploading}>İptal</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || isSubmitting || !!phoneError || logoUploading}
        >
          {(loading || isSubmitting || logoUploading) ? (
            <>
              <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
              {isUpdate ? 'Güncelleniyor...' : 'Kaydediliyor...'}
            </>
          ) : (
            'Kaydet'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

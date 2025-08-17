import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Close as CloseIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { authService } from '../services/auth';

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(3);

  // Profile Info Tab
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: '',
  });

  // Password Change Tab
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  useEffect(() => {
    if (open) {
      loadUserProfile();
      // Modal açıldığında state'leri temizle
      setSuccessMessage('');
      setErrorMessage('');
      setCountdown(3);
    } else {
      // Modal kapandığında tüm state'leri temizle
      setSuccessMessage('');
      setErrorMessage('');
      setCountdown(3);
      setLoading(false);
    }
  }, [open]);

  // Countdown effect'i
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (successMessage && countdown > 0 && open) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [successMessage, countdown, open]);

  const loadUserProfile = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setProfileData({
          name: user.name || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          role: user.role || '',
        });
      }
    } catch (error) {
      console.error('Kullanıcı bilgileri yüklenemedi:', error);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Role field'ını çıkar, sadece güncellenebilir alanları gönder
      const { name, email, phoneNumber } = profileData;
      await authService.updateUserProfile({ name, email, phoneNumber, role: profileData.role });
      
      setSuccessMessage('Profil bilgileri başarıyla güncellendi!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setErrorMessage('Yeni şifre en az 8 karakter olmalıdır');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    setCountdown(3);

    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setSuccessMessage('Şifreniz başarıyla değiştirildi! Tekrar giriş yapmanız gerekiyor.');
      
      // Form'u temizle
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // 3 saniye sonra logout yap
      const logoutTimer = setTimeout(() => {
        if (open) { // Modal hala açıksa logout yap
          authService.logout();
          window.location.href = '/login';
        }
      }, 3000);

      // Cleanup function
      return () => {
        if (logoutTimer) {
          clearTimeout(logoutTimer);
        }
      };
      
    } catch (error: any) {
      // Backend'den gelen hata mesajlarını göster
      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (error.response?.data?.validationErrors) {
        // Validation error'ları varsa ilkini göster
        const firstError = Object.values(error.response.data.validationErrors)[0];
        setErrorMessage(Array.isArray(firstError) ? firstError[0] : firstError);
      } else if (error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Şifre değiştirilirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Şifre değiştirme butonunun aktif olup olmadığını kontrol et
  const isPasswordChangeButtonDisabled = () => {
    return !passwordData.currentPassword.trim() || 
           !passwordData.newPassword.trim() || 
           !passwordData.confirmPassword.trim() ||
           passwordData.newPassword !== passwordData.confirmPassword ||
           passwordData.newPassword.length < 8;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Modal'ın ne zaman kapanabileceğini kontrol et
  const canCloseModal = () => {
    return !loading && !successMessage;
  };

  return (
    <Dialog
      open={open}
      onClose={canCloseModal() ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
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
            <PersonIcon />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
            Profil Ayarları
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          disabled={!canCloseModal()}
          sx={{ 
            color: '#6b7280',
            '&:disabled': { color: '#d1d5db' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Success/Error Messages */}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2,
              '& .MuiAlert-message': {
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <CheckCircleIcon sx={{ color: '#10b981' }} />
              <Typography variant="body1" sx={{ flex: 1 }}>
                {successMessage}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: '#10b981' }} />
                <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 500 }}>
                  {countdown} saniye sonra çıkış yapılıyor...
                </Typography>
              </Box>
            </Box>
          </Alert>
        )}
        
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="profile tabs"
          >
            <Tab 
              label="Profil Bilgileri" 
              icon={<PersonIcon />} 
              iconPosition="start"
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                '&.Mui-selected': { color: '#10b981' },
                opacity: (loading || !!successMessage) ? 0.5 : 1,
                pointerEvents: (loading || !!successMessage) ? 'none' : 'auto'
              }}
            />
            <Tab 
              label="Şifre Değiştir" 
              icon={<LockIcon />} 
              iconPosition="start"
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                '&.Mui-selected': { color: '#10b981' },
                opacity: (loading || !!successMessage) ? 0.5 : 1,
                pointerEvents: (loading || !!successMessage) ? 'none' : 'auto'
              }}
            />
          </Tabs>
        </Box>

        {/* Profile Info Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  fontWeight: 700,
                  fontSize: '2rem',
                }}
              >
                {profileData.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
                  {profileData.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  {profileData.email}
                </Typography>
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Ad Soyad"
              value={profileData.name}
              onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
              disabled={loading || !!successMessage}
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
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
              disabled={loading || !!successMessage}
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
              label="Telefon"
              value={profileData.phoneNumber}
              onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
              disabled={loading || !!successMessage}
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
              label="Rol"
              value={profileData.role}
              disabled
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f9fafb',
                  '&.Mui-disabled': {
                    backgroundColor: '#f3f4f6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#6b7280',
                },
              }}
            />
          </Box>
        </TabPanel>

        {/* Password Change Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
              Şifrenizi güvenli tutmak için güçlü bir şifre seçin. En az 8 karakter olmalıdır.
            </Typography>

            <TextField
              fullWidth
              label="Mevcut Şifre"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              disabled={loading || !!successMessage}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('current')}
                    edge="end"
                    disabled={loading || !!successMessage}
                  >
                    {showPasswords.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
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
              label="Yeni Şifre"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              disabled={loading || !!successMessage}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('new')}
                    edge="end"
                    disabled={loading || !!successMessage}
                  >
                    {showPasswords.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
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
              label="Yeni Şifre (Tekrar)"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              disabled={loading || !!successMessage}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={() => togglePasswordVisibility('confirm')}
                    edge="end"
                    disabled={loading || !!successMessage}
                  >
                    {showPasswords.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                ),
              }}
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
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={!canCloseModal()}
          sx={{ 
            color: '#6b7280',
            '&:disabled': { color: '#d1d5db' }
          }}
        >
          İptal
        </Button>
        
        {tabValue === 0 ? (
          <Button
            onClick={handleProfileUpdate}
            disabled={loading || !!successMessage}
            variant="contained"
            sx={{
              backgroundColor: '#10b981',
              '&:hover': { backgroundColor: '#059669' },
              '&:disabled': { backgroundColor: '#9ca3af' }
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Güncelle'}
          </Button>
        ) : (
          <Button
            onClick={handlePasswordChange}
            disabled={loading || !!successMessage || isPasswordChangeButtonDisabled()}
            variant="contained"
            sx={{
              backgroundColor: '#10b981',
              '&:hover': { backgroundColor: '#059669' },
              '&:disabled': { backgroundColor: '#9ca3af' }
            }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Şifre Değiştir'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

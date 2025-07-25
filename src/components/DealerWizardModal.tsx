import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress,
  Alert,
  Divider,
  Chip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { dealersService } from '../services/dealers';
import { DealerWizardData } from '../types/dealer';
import { UserResponseDto } from '../types/user';
import { toast } from 'react-toastify';

interface DealerWizardModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (result: UserResponseDto) => void;
}

const steps = ['Bayi Bilgileri', 'Admin Kullanıcı', 'Özet'];

export const DealerWizardModal: React.FC<DealerWizardModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<UserResponseDto | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<DealerWizardData>({
    dealer: {
      code: '',
      name: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
    },
    adminUser: {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      // Bayi bilgileri validasyonu
      if (!formData.dealer.code.trim()) {
        newErrors.dealerCode = 'Bayi kodu gereklidir';
      }
      if (!formData.dealer.name.trim()) {
        newErrors.dealerName = 'Bayi adı gereklidir';
      }
      if (!formData.dealer.contactEmail.trim()) {
        newErrors.dealerEmail = 'E-posta gereklidir';
      } else if (!/\S+@\S+\.\S+/.test(formData.dealer.contactEmail)) {
        newErrors.dealerEmail = 'Geçerli bir e-posta adresi giriniz';
      }
      if (!formData.dealer.contactPhone.trim()) {
        newErrors.dealerPhone = 'Telefon numarası gereklidir';
      }
    } else if (step === 1) {
      // Admin kullanıcı validasyonu
      if (!formData.adminUser.email.trim()) {
        newErrors.adminEmail = 'E-posta gereklidir';
      } else if (!/\S+@\S+\.\S+/.test(formData.adminUser.email)) {
        newErrors.adminEmail = 'Geçerli bir e-posta adresi giriniz';
      }
      if (!formData.adminUser.firstName.trim()) {
        newErrors.adminFirstName = 'Ad gereklidir';
      }
      if (!formData.adminUser.lastName.trim()) {
        newErrors.adminLastName = 'Soyad gereklidir';
      }
      if (!formData.adminUser.password.trim()) {
        newErrors.adminPassword = 'Şifre gereklidir';
      } else if (formData.adminUser.password.length < 6) {
        newErrors.adminPassword = 'Şifre en az 6 karakter olmalıdır';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) return;

    setIsSubmitting(true);
    try {
      const result = await dealersService.createWithAdmin(formData);
      setResult(result);
      toast.success('Bayi ve admin kullanıcı başarıyla oluşturuldu!');
      onSuccess?.(result);
    } catch (error: any) {
      console.error('Error creating dealer with admin:', error);
      toast.error(error.message || 'Bayi oluşturulurken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setActiveStep(0);
      setFormData({
        dealer: { code: '', name: '', contactEmail: '', contactPhone: '', address: '' },
        adminUser: { email: '', firstName: '', lastName: '', password: '' }
      });
      setErrors({});
      setResult(null);
      setShowPassword(false);
      onClose();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Şifre panoya kopyalandı!');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <BusinessIcon color="primary" />
              Bayi Bilgileri
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Bayi Kodu *"
                value={formData.dealer.code}
                onChange={(e) => setFormData({
                  ...formData,
                  dealer: { ...formData.dealer, code: e.target.value }
                })}
                error={!!errors.dealerCode}
                helperText={errors.dealerCode}
                placeholder="Örn: BAYI001"
              />
              <TextField
                fullWidth
                label="Bayi Adı *"
                value={formData.dealer.name}
                onChange={(e) => setFormData({
                  ...formData,
                  dealer: { ...formData.dealer, name: e.target.value }
                })}
                error={!!errors.dealerName}
                helperText={errors.dealerName}
              />
              <TextField
                fullWidth
                label="E-posta *"
                type="email"
                value={formData.dealer.contactEmail}
                onChange={(e) => setFormData({
                  ...formData,
                  dealer: { ...formData.dealer, contactEmail: e.target.value }
                })}
                error={!!errors.dealerEmail}
                helperText={errors.dealerEmail}
              />
              <TextField
                fullWidth
                label="Telefon *"
                value={formData.dealer.contactPhone}
                onChange={(e) => setFormData({
                  ...formData,
                  dealer: { ...formData.dealer, contactPhone: e.target.value }
                })}
                error={!!errors.dealerPhone}
                helperText={errors.dealerPhone}
                placeholder="+905XXXXXXXXX"
              />
              <TextField
                fullWidth
                label="Adres"
                multiline
                rows={3}
                value={formData.dealer.address}
                onChange={(e) => setFormData({
                  ...formData,
                  dealer: { ...formData.dealer, address: e.target.value }
                })}
                sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
              />
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon color="primary" />
              Admin Kullanıcı Bilgileri
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Ad *"
                value={formData.adminUser.firstName}
                onChange={(e) => setFormData({
                  ...formData,
                  adminUser: { ...formData.adminUser, firstName: e.target.value }
                })}
                error={!!errors.adminFirstName}
                helperText={errors.adminFirstName}
              />
              <TextField
                fullWidth
                label="Soyad *"
                value={formData.adminUser.lastName}
                onChange={(e) => setFormData({
                  ...formData,
                  adminUser: { ...formData.adminUser, lastName: e.target.value }
                })}
                error={!!errors.adminLastName}
                helperText={errors.adminLastName}
              />
              <TextField
                fullWidth
                label="E-posta *"
                type="email"
                value={formData.adminUser.email}
                onChange={(e) => setFormData({
                  ...formData,
                  adminUser: { ...formData.adminUser, email: e.target.value }
                })}
                error={!!errors.adminEmail}
                helperText={errors.adminEmail}
                sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
              />
              <TextField
                fullWidth
                label="Şifre *"
                type="password"
                value={formData.adminUser.password}
                onChange={(e) => setFormData({
                  ...formData,
                  adminUser: { ...formData.adminUser, password: e.target.value }
                })}
                error={!!errors.adminPassword}
                helperText={errors.adminPassword || 'En az 6 karakter'}
                sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon color="primary" />
              Özet
            </Typography>
            
            {result ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Bayi ve admin kullanıcı başarıyla oluşturuldu!
                </Alert>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Bayi Bilgileri:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography><strong>Kod:</strong> {formData.dealer.code}</Typography>
                    <Typography><strong>Ad:</strong> {formData.dealer.name}</Typography>
                    <Typography><strong>E-posta:</strong> {formData.dealer.contactEmail}</Typography>
                    <Typography><strong>Telefon:</strong> {formData.dealer.contactPhone}</Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                    Admin Kullanıcı Bilgileri:
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    <Typography><strong>Ad Soyad:</strong> {formData.adminUser.firstName} {formData.adminUser.lastName}</Typography>
                    <Typography><strong>E-posta:</strong> {formData.adminUser.email}</Typography>
                    <Typography><strong>Rol:</strong> <Chip label="Bayi Admin" size="small" color="primary" /></Typography>
                  </Box>
                </Box>

                {result.temporaryPassword && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Geçici Şifre:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          backgroundColor: '#f3f4f6', 
                          px: 1, 
                          py: 0.5, 
                          borderRadius: 1,
                          flex: 1
                        }}
                      >
                        {showPassword ? result.temporaryPassword : '••••••••'}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => setShowPassword(!showPassword)}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        {showPassword ? 'Gizle' : 'Göster'}
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => result.temporaryPassword && copyToClipboard(result.temporaryPassword)}
                        sx={{ minWidth: 'auto', px: 1 }}
                      >
                        Kopyala
                      </Button>
                    </Box>
                  </Alert>
                )}
              </Box>
            ) : (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Oluşturulacak Bayi:
                </Typography>
                <Box sx={{ pl: 2, mb: 3 }}>
                  <Typography><strong>Kod:</strong> {formData.dealer.code}</Typography>
                  <Typography><strong>Ad:</strong> {formData.dealer.name}</Typography>
                  <Typography><strong>E-posta:</strong> {formData.dealer.contactEmail}</Typography>
                  <Typography><strong>Telefon:</strong> {formData.dealer.contactPhone}</Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Oluşturulacak Admin Kullanıcı:
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography><strong>Ad Soyad:</strong> {formData.adminUser.firstName} {formData.adminUser.lastName}</Typography>
                  <Typography><strong>E-posta:</strong> {formData.adminUser.email}</Typography>
                  <Typography><strong>Rol:</strong> <Chip label="Bayi Admin" size="small" color="primary" /></Typography>
                </Box>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          minHeight: 500
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Bayi Sihirbazı
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Yeni bayi ve admin kullanıcı oluşturun
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          {result ? 'Kapat' : 'İptal'}
        </Button>
        
        {!result && (
          <>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Geri
            </Button>
            
            {activeStep === steps.length - 1 ? (
              <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
              >
                {isSubmitting ? 'Oluşturuluyor...' : 'Oluştur'}
              </Button>
            ) : (
              <Button onClick={handleNext} variant="contained">
                İleri
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}; 
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
  InputAdornment,
  Card,
  CardContent,
} from '@mui/material';
import { LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';
import { authService } from '../services/auth';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Geçersiz şifre sıfırlama linki');
      return;
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError('Geçersiz token');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    // Frontend validation - backend kurallarına uygun
    if (newPassword.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır');
      return;
    }

    if (!/(?=.*[a-z])/.test(newPassword)) {
      setError('Şifre en az bir küçük harf içermelidir');
      return;
    }

    if (!/(?=.*[A-Z])/.test(newPassword)) {
      setError('Şifre en az bir büyük harf içermelidir');
      return;
    }

    if (!/(?=.*\d)/.test(newPassword)) {
      setError('Şifre en az bir rakam içermelidir');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.resetPassword(token, newPassword);
      setSuccess(true);
      setError('');
    } catch (err: any) {
      // Backend'den gelen validation error'ları parse et
      if (err.response?.data?.validationErrors) {
        const validationErrors = err.response.data.validationErrors;
        const firstError = Object.values(validationErrors)[0];
        setError(firstError as string);
      } else {
        setError(err.message || 'Şifre sıfırlanamadı');
      }
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  if (!token) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Container maxWidth="sm">
          <Card elevation={8} sx={{ borderRadius: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Alert severity="error" sx={{ mb: 3 }}>
                <AlertTitle>Hata!</AlertTitle>
                Geçersiz şifre sıfırlama linki
              </Alert>
              <Button
                variant="contained"
                onClick={handleLoginRedirect}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f97316 0%, #1e3a8a 100%)',
                }}
              >
                Giriş Sayfasına Dön
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8} sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Yeni Şifre Belirle
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hesabınız için yeni bir şifre belirleyin
              </Typography>
            </Box>

            {success ? (
              <Box sx={{ textAlign: 'center' }}>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <AlertTitle>Başarılı!</AlertTitle>
                  Şifreniz başarıyla güncellendi
                </Alert>
                <Button
                  variant="contained"
                  onClick={handleLoginRedirect}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f97316 0%, #1e3a8a 100%)',
                  }}
                >
                  Giriş Yap
                </Button>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <AlertTitle>Hata!</AlertTitle>
                    {error}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  label="Yeni Şifre"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="En az 8 karakter, 1 küçük harf, 1 büyük harf, 1 rakam"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ minWidth: 'auto', p: 1 }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8fafc',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Şifre Tekrar"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Şifrenizi tekrar girin"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          sx={{ minWidth: 'auto', p: 1 }}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </Button>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8fafc',
                    },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isLoading || !newPassword || !confirmPassword}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f97316 0%, #1e3a8a 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ea580c 0%, #1e40af 100%)',
                    },
                    '&:disabled': {
                      background: '#cbd5e1',
                      color: '#64748b',
                    },
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                      <span>Şifre Güncelleniyor...</span>
                    </Box>
                  ) : (
                    'Şifreyi Güncelle'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ResetPassword;

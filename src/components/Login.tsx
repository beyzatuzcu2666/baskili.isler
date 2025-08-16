import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { EmailOutlined, LockOutlined, Close as CloseIcon } from '@mui/icons-material';
import { authService } from '../services/auth';

// Unicorn Studio için window global tipini genişlet (yeni embed kodu)
declare global {
  interface Window {
    UnicornStudio?: {
      init?: () => void;
      destroy?: () => void;
      isInitialized?: boolean;
    };
  }
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unicornLoaded, setUnicornLoaded] = useState(false);
  const unicornRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Şifremi unuttum state'leri
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');

  useEffect(() => {
    if (authService.isAuthenticated()) {
      const userRole = authService.getUserRole();
      if (userRole === 'FACTORY_USER') {
        navigate('/orders');
      } else {
        navigate('/brands');
      }
    }
  }, [navigate]);

  // Unicorn Studio script'ini yükle ve başlat (yeni embed kodu)
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const timeoutDuration = 10000; // 10 saniye timeout
    
    const loadUnicornStudio = () => {
      // Eğer zaten yüklenmişse tekrar yükleme
      if (window.UnicornStudio?.isInitialized) {
        setUnicornLoaded(true);
        return;
      }

      // Yeni embed koduna göre kontrol
      if (!window.UnicornStudio) {
        window.UnicornStudio = { isInitialized: false };
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.26/dist/unicornStudio.umd.js';
        
        // Timeout ekle
        const timeoutId = setTimeout(() => {
          console.warn('Unicorn Studio yükleme timeout, fallback background kullanılacak');
          setUnicornLoaded(false);
        }, timeoutDuration);
        
        script.onload = () => {
          clearTimeout(timeoutId);
          
          if (window.UnicornStudio && !window.UnicornStudio.isInitialized) {
            try {
              if (window.UnicornStudio.init) {
                window.UnicornStudio.init();
                window.UnicornStudio.isInitialized = true;
                setUnicornLoaded(true);
                console.log('Unicorn Studio başarıyla yüklendi');
              } else {
                throw new Error('UnicornStudio.init metodu bulunamadı');
              }
            } catch (err) {
              console.warn('Unicorn Studio başlatılamadı:', err);
              setUnicornLoaded(false);
              
              // Retry logic
              if (retryCount < maxRetries) {
                retryCount++;
                console.log(`Unicorn Studio retry ${retryCount}/${maxRetries}`);
                setTimeout(loadUnicornStudio, 2000); // 2 saniye sonra tekrar dene
              }
            }
          }
        };
        
        script.onerror = () => {
          clearTimeout(timeoutId);
          console.warn('Unicorn Studio yüklenemedi, fallback background kullanılacak');
          setUnicornLoaded(false);
          
          // Retry logic
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(`Unicorn Studio retry ${retryCount}/${maxRetries}`);
            setTimeout(loadUnicornStudio, 2000); // 2 saniye sonra tekrar dene
          }
        };
        
        // Script'i head'e ekle (daha güvenilir)
        const head = document.head || document.getElementsByTagName('head')[0];
        head.appendChild(script);
        
      } else if (window.UnicornStudio && window.UnicornStudio.isInitialized) {
        setUnicornLoaded(true);
      }
    };

    // DOM hazır olduktan sonra yükle
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadUnicornStudio);
    } else {
      loadUnicornStudio();
    }

    // Cleanup
    return () => {
      if (window.UnicornStudio && window.UnicornStudio.destroy) {
        try {
          window.UnicornStudio.destroy();
        } catch (err) {
          console.warn('Unicorn Studio cleanup hatası:', err);
        }
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.login(email, password);
      if (response && response.token) {
        authService.setToken(response.token);
        
        // Login sonrası dealer'ı yükle
        authService.loadDealerAfterLogin();
        
        // Role göre yönlendirme
        const userRole = authService.getUserRole();
        if (userRole === 'FACTORY_USER') {
          navigate('/orders');
        } else {
          navigate('/brands');
        }
      } else {
        throw new Error('Geçersiz yanıt alındı');
      }
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Şifremi unuttum işlemi
  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError('Lütfen email adresinizi girin');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    
    try {
      await authService.forgotPassword(forgotPasswordEmail);
      setForgotPasswordSuccess(true);
      setForgotPasswordError('');
    } catch (err: any) {
      setForgotPasswordError(err.message || 'Bir hata oluştu');
      setForgotPasswordSuccess(false);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  // Modal'ı kapat
  const handleCloseForgotPassword = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordEmail('');
    setForgotPasswordError('');
    setForgotPasswordSuccess(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      {/* Unicorn Studio WebGL Background - Tüm sayfa (embed: 1440x900) */}
      <Box
        ref={unicornRef}
        data-us-project="xaZR7UEgy1cSW7d3X1yc"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          // Embed boyutları: 1440px x 900px (responsive için %100 kullanıyoruz)
        }}
      />

      {/* Loading indicator - Unicorn Studio yüklenirken */}
      {!unicornLoaded && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 5,
            textAlign: 'center',
            color: 'white',
          }}
        >
          <CircularProgress 
            size={60} 
            sx={{ 
              color: 'white',
              mb: 2,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }} 
          />
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Animasyon yükleniyor...
          </Typography>
        </Box>
      )}

      {/* Fallback background eğer Unicorn Studio yüklenemezse */}
      {!unicornLoaded && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            zIndex: 0,
            animation: 'gradientShift 8s ease-in-out infinite',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'grid\' width=\'20\' height=\'20\' patternUnits=\'userSpaceOnUse\'><path d=\'M 20 0 L 0 0 0 20\' fill=\'none\' stroke=\'rgba(255,255,255,0.1)\' stroke-width=\'1\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23grid)\'/></svg>") repeat',
              opacity: 0.3,
              animation: 'gridMove 20s linear infinite',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
              transform: 'translate(-50%, -50%)',
              animation: 'pulse 4s ease-in-out infinite',
            },
            '@keyframes gradientShift': {
              '0%, 100%': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              },
              '50%': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
              },
            },
            '@keyframes gridMove': {
              '0%': {
                transform: 'translate(0, 0)',
              },
              '100%': {
                transform: 'translate(20px, 20px)',
              },
            },
            '@keyframes pulse': {
              '0%, 100%': {
                opacity: 0.3,
                transform: 'translate(-50%, -50%) scale(1)',
              },
              '50%': {
                opacity: 0.6,
                transform: 'translate(-50%, -50%) scale(1.2)',
              },
            },
          }}
        />
      )}

      {/* Sol taraf - Boş alan (sadece WebGL background) */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Tamamen boş - sadece WebGL background */}
      </Box>

      {/* Sağ taraf - Compact Login Card */}
      <Box
        sx={{
          flex: { xs: 1, md: 0.5 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 10,
          background: 'transparent',
        }}
      >
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Card
            elevation={0}
            sx={{
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}
          >
            {/* Minimal header accent */}
            <Box
              sx={{
                height: 4,
                background: 'linear-gradient(135deg, #f97316 0%, #1e3a8a 100%)',
              }}
            />
            
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Clean Header */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: '#1a202c',
                    mb: 1,
                    fontSize: { xs: '1.5rem', sm: '1.8rem' }
                  }}
                >
                  Hoş Geldiniz! 👋🏻
            </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#64748b',
                    fontWeight: 400,
                  }}
                >
                  Hesabınıza giriş yapın ve yönetim paneline erişin
            </Typography>
          </Box>

              {/* Compact Login Form */}
              <form onSubmit={handleSubmit} style={{ margin: 0, padding: 0 }}>
            {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    <AlertTitle sx={{ fontWeight: 600 }}>Giriş Hatası</AlertTitle>
                {error}
              </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
                  label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
              InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined sx={{ color: '#64748b', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8fafc',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f97316',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1e3a8a',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748b',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: '#1e3a8a',
                      },
                    },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Şifre"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                  placeholder="Şifre"
              InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: '#64748b', fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: '#f8fafc',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#e2e8f0',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#f97316',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#1e3a8a',
                        borderWidth: '2px',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#64748b',
                      fontWeight: 500,
                      '&.Mui-focused': {
                        color: '#1e3a8a',
                      },
                    },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
                  sx={{
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f97316 0%, #1e3a8a 100%)',
                    boxShadow: '0 8px 25px rgba(249, 115, 22, 0.3)',
                    border: 'none',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ea580c 0%, #1e40af 100%)',
                      boxShadow: '0 12px 35px rgba(249, 115, 22, 0.4)',
                    },
                    '&:disabled': {
                      background: '#cbd5e1',
                      color: '#64748b',
                      boxShadow: 'none',
                    },
                  }}
            >
                  {isLoading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={20} sx={{ color: 'white' }} />
                      <span>Giriş yapılıyor...</span>
                    </Box>
                  ) : (
                    'Sistem Girişi'
                  )}
            </Button>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 3,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748b',
                      fontSize: '0.875rem',
                    }}
                  >
                    Beni hatırla
                  </Typography>
                  <button
                    type="button"
                    style={{
                      color: '#f97316',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                    onClick={() => setForgotPasswordOpen(true)}
                    onMouseOver={e => {
                      e.currentTarget.style.textDecoration = 'underline';
                      e.currentTarget.style.color = '#1e3a8a';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.textDecoration = 'none';
                      e.currentTarget.style.color = '#f97316';
                    }}
                  >
                    Şifremi unuttum?
                  </button>
          </Box>
              </form>
            </CardContent>
          </Card>
      </Container>
      </Box>

      {/* Şifremi Unuttum Modal */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={handleCloseForgotPassword}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 1
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Şifremi Unuttum
          </Typography>
          <IconButton onClick={handleCloseForgotPassword} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {forgotPasswordSuccess ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                <AlertTitle>Email Gönderildi!</AlertTitle>
                Şifre sıfırlama linki <strong>{forgotPasswordEmail}</strong> adresine gönderildi.
                Lütfen email'inizi kontrol edin.
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Email gelmezse spam klasörünü kontrol edin.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ py: 1 }}>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                Email adresinizi girin, size şifre sıfırlama linki göndereceğiz.
              </Typography>
              
              {forgotPasswordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {forgotPasswordError}
                </Alert>
              )}
              
              <TextField
                fullWidth
                label="Email Adresi"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                placeholder="ornek@email.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ color: '#64748b' }} />
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
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {!forgotPasswordSuccess && (
            <>
              <Button 
                onClick={handleCloseForgotPassword}
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                İptal
              </Button>
              <Button
                onClick={handleForgotPassword}
                variant="contained"
                disabled={forgotPasswordLoading || !forgotPasswordEmail.trim()}
                sx={{
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f97316 0%, #1e3a8a 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #ea580c 0%, #1e40af 100%)',
                  },
                }}
              >
                {forgotPasswordLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} sx={{ color: 'white' }} />
                    <span>Gönderiliyor...</span>
                  </Box>
                ) : (
                  'Şifre Sıfırlama Linki Gönder'
                )}
              </Button>
            </>
          )}
          
          {forgotPasswordSuccess && (
            <Button
              onClick={handleCloseForgotPassword}
              variant="contained"
              fullWidth
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f97316 0%, #1e3a8a 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #ea580c 0%, #1e40af 100%)',
                },
              }}
            >
              Tamam
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;

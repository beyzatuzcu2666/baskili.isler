import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import { EmailOutlined, LockOutlined } from '@mui/icons-material';
import { authService } from '../services/auth';

interface LoginResponse {
  token: string;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const response = await authService.login(email, password);
      authService.setToken(response.token);
      navigate('/dashboard');
    } catch (err: any) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Network error: Failed to fetch data. Please check your internet connection.');
      }
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
          }}
      >
        <Container maxWidth="sm">
          <Box
              sx={{
                animation: {
                  '@keyframes fadeIn': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(-20px)',
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                  animation: 'fadeIn 0.5s ease-out',
                },
              }}
          >
            <Paper
                elevation={3}
                sx={{
                  p: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
            >
              <Typography component="h1" variant="h4" gutterBottom>
                Baskılı İşler
              </Typography>
              <Typography component="h2" variant="h5" gutterBottom>
                Giriş Yap
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Lütfen hesabınızla giriş yapın
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                {error && (
                    <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                      <AlertTitle>Hata</AlertTitle>
                      {error}
                    </Alert>
                )}

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Adresi"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      startAdornment: <EmailOutlined sx={{ mr: 1 }} />,
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
                    InputProps={{
                      startAdornment: <LockOutlined sx={{ mr: 1 }} />,
                    }}
                />

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
                >
                  {isLoading ? 'Yükleniyor...' : 'Giriş Yap'}
                </Button>
              </Box>
            </Paper>
          </Box>
        </Container>
      </Box>
  );
};

export default Login;

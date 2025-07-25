import { http } from './http';

// Store token in localStorage
const TOKEN_KEY = 'auth_token';
const COOKIE_NAME = 'auth_token';

// JWT Token'dan kullanıcı bilgilerini decode eden fonksiyon
const decodeToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await http.post('/auth/login', { email, password });
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Giriş başarısız. Lütfen tekrar deneyin.');
    }
  },

  getToken: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      const cookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith(COOKIE_NAME));
      if (cookie) {
        const tokenFromCookie = cookie.split('=')[1];
        localStorage.setItem(TOKEN_KEY, tokenFromCookie);
        return tokenFromCookie;
      }
    }
    return token;
  },

  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  logout: () => {
    authService.clearToken();
  },

  isAuthenticated: () => {
    const token = authService.getToken();
    return !!token;
  },

  // JWT token'dan kullanıcı bilgilerini al
  getUserInfo: () => {
    const token = authService.getToken();
    if (!token) return null;
    return decodeToken(token);
  },

  // Kullanıcının rolünü al
  getUserRole: () => {
    const userInfo = authService.getUserInfo();
    return userInfo?.role || null;
  },

  // Kullanıcının ID'sini al
  getUserId: () => {
    const userInfo = authService.getUserInfo();
    return userInfo?.sub || null;
  },

  // Token'ın süresi dolmuş mu kontrol et
  isTokenExpired: () => {
    const userInfo = authService.getUserInfo();
    if (!userInfo?.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= userInfo.exp;
  },

  // Belirli bir role sahip mi kontrol et
  hasRole: (role: string) => {
    const userRole = authService.getUserRole();
    return userRole === role;
  },

  // Admin mi kontrol et
  isAdmin: () => {
    return authService.hasRole('ADMIN');
  },

  // User mi kontrol et
  isUser: () => {
    return authService.hasRole('USER');
  }
};

import { http } from './http';

// Store token in localStorage
const TOKEN_KEY = 'auth_token';
const COOKIE_NAME = 'auth_token';

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
      // Cookie'den token'i al
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
  }
  
};

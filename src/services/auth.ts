import { http } from './http';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await fetch('https://baskili-isler-backend.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors', // CORS modunu açıkça belirtiyoruz
        credentials: 'include',
        body: JSON.stringify({
          email,
          password
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error: Failed to fetch data. Please check your internet connection.');
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  }
};

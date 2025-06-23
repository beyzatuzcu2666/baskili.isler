import { authService } from './auth';

const BASE_URL = 'http://localhost:3000';

export const http = {
  async get<T = any>(endpoint: string): Promise<T> {
    try {
      // Sadece gerekli olan Authorization header'ını kullan
      const headers = new Headers();
      
      // Token varsa Authorization header'ını ekle
      const token = authService.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      addTokenToHeaders(headers);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers
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

  async post<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      // Sadece gerekli olan Authorization header'ını kullan
      const headers = new Headers();
      
      // Token varsa Authorization header'ını ekle
      const token = authService.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
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
      throw new Error('Network error: Failed to post data. Please check your internet connection.');
    }
  },

  async put<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      // Sadece gerekli olan Authorization header'ını kullan
      const headers = new Headers();
      
      // Token varsa Authorization header'ını ekle
      const token = authService.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(data)
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
      throw new Error('Network error: Failed to update data. Please check your internet connection.');
    }
  },

  async delete(endpoint: string): Promise<void> {
    try {
      // Sadece gerekli olan Authorization header'ını kullan
      const headers = new Headers();
      
      // Token varsa Authorization header'ını ekle
      const token = authService.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      addTokenToHeaders(headers);

      // Header'ları konsola yazdır
      console.log('Request Headers:', headers);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers,
        credentials: 'include',
        mode: 'cors'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error: Failed to delete data. Please check your internet connection.');
    }
  }
};

function addTokenToHeaders(headers: Headers) {
  const token = authService.getToken();
  if (token) {
    // Token'ı cookie'ye taşıyoruz
    document.cookie = `auth_token=${token}; path=/; secure`;
    
    // Authorization header'ını kaldırıyoruz
    // headers.append('Authorization', `Bearer ${token}`);
    
    // Cookie'yi kontrol edelim
    const existingCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('auth_token'));
    if (existingCookie) {
      console.log('Auth token cookie:', existingCookie);
    }
  }
  return headers;
};

export default http;

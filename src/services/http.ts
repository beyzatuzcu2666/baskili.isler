import { authService } from './auth';
import { toast } from 'react-toastify';

const BASE_URL = 'https://baskili-isler-backend.onrender.com';

// 401 hatası kontrolü ve logout işlemi
const handleUnauthorized = () => {
  authService.logout();
  toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
  window.location.href = '/login';
};

export const http = {
  async get<T = any>(endpoint: string): Promise<T> {
    try {
      const headers = new Headers();
      headers.set('Accept', 'application/json');
      
      const token = authService.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          throw new Error('Unauthorized');
        }
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
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      
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
        if (response.status === 401) {
          handleUnauthorized();
          throw new Error('Unauthorized');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error: Failed to send POST request. Please check your internet connection.');
    }
  },

  async patch<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      const headers = new Headers();
      let body;
      if (data instanceof FormData) {
        // Content-Type header'ı eklenmez, fetch otomatik ayarlar
        body = data;
        headers.set('Accept', 'application/json');
      } else {
        headers.set('Content-Type', 'application/json');
        headers.set('Accept', 'application/json');
        body = JSON.stringify(data);
      }
      const token = authService.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers,
        body
      });
      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          throw new Error('Unauthorized');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error: Failed to send PATCH request. Please check your internet connection.');
    }
  },

  async put<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      const headers = new Headers();
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      
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
        if (response.status === 401) {
          handleUnauthorized();
          throw new Error('Unauthorized');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error: Failed to send PUT request. Please check your internet connection.');
    }
  },

  async delete(endpoint: string): Promise<void> {
    try {
      const headers = new Headers();
      headers.set('Accept', 'application/json');
      
      const token = authService.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleUnauthorized();
          throw new Error('Unauthorized');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error: Failed to delete resource. Please check your internet connection.');
    }
  }
};

export default http;

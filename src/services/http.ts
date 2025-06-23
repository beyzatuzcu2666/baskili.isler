import { authService } from './auth';

const BASE_URL = 'https://baskili-isler-backend.onrender.com';

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
      headers.set('Content-Type', 'application/json');
      headers.set('Accept', 'application/json');
      
      const token = authService.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH',
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

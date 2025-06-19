const BASE_URL = 'https://baskili-isler-backend.onrender.com';

export const http = {
  async get<T = any>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include'
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
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        mode: 'cors',
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
      throw new Error('Network error: Failed to fetch data. Please check your internet connection.');
    }
  }
};

// Token eklemek için bir yardımcı fonksiyon
export const addTokenToHeaders = (headers: Headers) => {
  const token = localStorage.getItem('token');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
};

export default http;

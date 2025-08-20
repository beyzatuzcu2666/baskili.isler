import { authService } from './auth';
import { toast } from 'react-toastify';

const BASE_URL = 'https://baskili-isler-backend.onrender.com';

// Global logout callback
let logoutCallback: (() => void) | null = null;

// Logout callback'i ayarlama fonksiyonu
export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

// Backend'den gelen hata mesajlarını parse eden fonksiyon
const parseErrorMessage = (errorData: any): string => {
  // Eğer errorData bir string ise direkt döndür
  if (typeof errorData === 'string') {
    return errorData;
  }
  
  // Eğer errorData bir obje ise farklı formatları kontrol et
  if (typeof errorData === 'object' && errorData !== null) {
    // message alanı varsa onu kullan
    if (errorData.message) {
      return errorData.message;
    }
    
    // error alanı varsa onu kullan
    if (errorData.error) {
      return errorData.error;
    }
    
    // detail alanı varsa onu kullan (Django REST framework formatı)
    if (errorData.detail) {
      return errorData.detail;
    }
    
    // validationErrors varsa ilk hatayı al
    if (errorData.validationErrors && Array.isArray(errorData.validationErrors) && errorData.validationErrors.length > 0) {
      return errorData.validationErrors[0];
    }
    
    // errors alanı varsa (array formatı)
    if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      return errorData.errors[0];
    }
    
    // Eğer obje içinde başka string değerler varsa onları birleştir
    const stringValues = Object.values(errorData)
      .filter(value => typeof value === 'string')
      .join(', ');
    
    if (stringValues) {
      return stringValues;
    }
  }
  
  // Hiçbir format bulunamazsa varsayılan mesaj döndür
  return '';
};

// 401 hatası kontrolü ve logout işlemi
const handleUnauthorized = () => {
  authService.logout();
  toast.error('Oturum süreniz doldu. Lütfen tekrar giriş yapın.');
  
  // Eğer logout callback varsa onu kullan, yoksa fallback
  if (logoutCallback) {
    logoutCallback();
  } else {
    // Fallback olarak window.location.href kullan
    window.location.href = '/login';
  }
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
        const errorMessage = parseErrorMessage(errorData);
        throw new Error(errorMessage || 'Veri yüklenirken bir hata oluştu');
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
    }
  },

  async post<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      const headers = new Headers();
      let body;
      
      if (data instanceof FormData) {
        // FormData için Content-Type header'ı eklenmez, fetch otomatik ayarlar
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
        method: 'POST',
        headers,
        body
      });
      
      if (!response.ok) {
        // Login endpoint'i için 401 hatası durumunda sayfa yenileme
        if (response.status === 401 && endpoint === '/auth/login') {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = parseErrorMessage(errorData);
          throw new Error(errorMessage || 'Email veya şifre hatalı');
        }
        
        if (response.status === 401) {
          handleUnauthorized();
          throw new Error('Unauthorized');
        }
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = parseErrorMessage(errorData);
        throw new Error(errorMessage || 'İşlem yapılırken bir hata oluştu');
      }
      
      // HTTP 204 (No Content) response'ları için özel handling
      if (response.status === 204) {
        return { status: 204, success: true } as T;
      }
      
      // Response body varsa JSON olarak parse et
      const text = await response.text();
      if (text) {
        return JSON.parse(text);
      }
      
      return { status: response.status, success: true } as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
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
        const errorMessage = parseErrorMessage(errorData);
        throw new Error(errorMessage || 'Güncelleme yapılırken bir hata oluştu');
      }
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
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
        const errorMessage = parseErrorMessage(errorData);
        throw new Error(errorMessage || 'Veri güncellenirken bir hata oluştu');
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
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
        const errorMessage = parseErrorMessage(errorData);
        throw new Error(errorMessage || 'Silme işlemi yapılırken bir hata oluştu');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
    }
  }
};

export default http;

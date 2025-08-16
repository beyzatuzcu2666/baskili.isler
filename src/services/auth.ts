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

  // Şifre sıfırlama isteği gönder
  forgotPassword: async (email: string) => {
    try {
      const response = await http.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Şifre sıfırlama isteği gönderilemedi. Lütfen tekrar deneyin.');
    }
  },

  // Şifre sıfırlama token'ı ile yeni şifre belirle
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await http.post('/auth/reset-password', { token, newPassword });
      return response;
    } catch (error: any) {
      // Backend'den gelen validation error'ları koru
      if (error.response?.data?.validationErrors) {
        throw error; // Validation error'ı olduğu gibi bırak
      }
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Şifre sıfırlanamadı. Lütfen tekrar deneyin.');
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

  // Kullanıcı bilgilerini al (ProfileModal için)
  getCurrentUser: async () => {
    try {
      const response = await http.get('/users/me');
      return response.data || response;
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      // Fallback olarak JWT token'dan bilgi al
      const token = authService.getToken();
      if (token) {
        const userInfo = decodeToken(token);
        return {
          name: userInfo?.name || 'Kullanıcı',
          email: userInfo?.email || '',
          phone: userInfo?.phone || '',
          role: userInfo?.role || '',
        };
      }
      return null;
    }
  },

  // Kullanıcı profil bilgilerini güncelle
  updateUserProfile: async (profileData: { name: string; email: string; phoneNumber: string; role: string }) => {
    try {
      const response = await http.patch('/users/me', profileData);
      return response.data || response;
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      throw new Error(error.message || 'Profil güncellenemedi');
    }
  },

  // Kullanıcı şifresini değiştir
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await http.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      // HTTP 204 (No Content) response'ları için özel handling
      if (response.status === 204) {
        return { success: true, message: 'Şifre başarıyla değiştirildi' };
      }
      
      return response.data || response;
    } catch (error: any) {
      console.error('Error changing password:', error);
      throw new Error(error.message || 'Şifre değiştirilemedi');
    }
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

  // Kullanıcının Dealer ID'sini al
  getUserDealerId: () => {
    const userInfo = authService.getUserInfo();
    return userInfo?.dealerId || null;
  },

  // Kullanıcının Factory ID'sini al
  getUserFactoryId: () => {
    const userInfo = authService.getUserInfo();
    return userInfo?.factoryId || null;
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

  // Belirli rollerden birine sahip mi kontrol et
  hasAnyRole: (roles: string[]) => {
    const userRole = authService.getUserRole();
    return roles.includes(userRole);
  },

  // DEALER_USER rolü için kısıtlamalar
  isDealerUser: () => {
    return authService.hasRole('DEALER_USER');
  },

  // DEALER_ADMIN rolü için kısıtlamalar
  isDealerAdmin: () => {
    return authService.hasRole('DEALER_ADMIN');
  },

  // SUPER_ADMIN rolü için kısıtlamalar
  isSuperAdmin: () => {
    return authService.hasRole('SUPER_ADMIN');
  },

  // FACTORY_USER rolü için kısıtlamalar
  isFactoryUser: () => {
    return authService.hasRole('FACTORY_USER');
  },

  // Siparişleri görme yetkisi
  canViewOrders: () => {
    const userRole = authService.getUserRole();
    return ['SUPER_ADMIN', 'DEALER_ADMIN', 'FACTORY_USER'].includes(userRole);
  },

  // Teklifi siparişe dönüştürme yetkisi
  canConvertOfferToOrder: () => {
    const userRole = authService.getUserRole();
    return ['SUPER_ADMIN', 'DEALER_ADMIN', 'DEALER_USER'].includes(userRole);
  },

  // Fabrikaları görme yetkisi
  canViewFactories: () => {
    const userRole = authService.getUserRole();
    return ['SUPER_ADMIN', 'FACTORY_USER'].includes(userRole);
  },

  // Fabrikaya atama yetkisi
  canAssignFactory: () => {
    const userRole = authService.getUserRole();
    return userRole === 'SUPER_ADMIN';
  },

  // Kullanıcı ekleme yetkisi
  canManageUsers: () => {
    const userRole = authService.getUserRole();
    return ['SUPER_ADMIN'].includes(userRole);
  },

  // Bildirimleri görme yetkisi
  canViewNotifications: () => {
    const userRole = authService.getUserRole();
    return ['SUPER_ADMIN', 'DEALER_ADMIN', 'FACTORY_USER'].includes(userRole);
  },

  // Login sonrası dealer yükleme
  loadDealerAfterLogin: () => {
    const userRole = authService.getUserRole();
    const userDealerId = authService.getUserDealerId();
    
    // SUPER_ADMIN değilse, kendi dealer'ını seç
    if (userRole !== 'SUPER_ADMIN' && userDealerId) {
      localStorage.setItem('selectedDealerId', userDealerId.toString());
      return;
    }
    
    // SUPER_ADMIN ise ve localStorage'da kayıtlı dealer yoksa, varsayılan dealer'ı seç
    if (userRole === 'SUPER_ADMIN') {
      const savedDealerId = localStorage.getItem('selectedDealerId');
      if (!savedDealerId) {
        localStorage.setItem('selectedDealerId', '1'); // Varsayılan ana bayi
      }
    }
  }
};

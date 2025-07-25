import { http } from './http';
import { User, UserCreateDto, UserUpdateDto, UserResponseDto } from '../types/user';

export const usersService = {
  /**
   * Tüm kullanıcıları getir
   */
  async getAll(): Promise<User[]> {
    return await http.get('/users');
  },

  /**
   * ID ile kullanıcı getir
   */
  async getById(id: number): Promise<User> {
    return await http.get(`/users/${id}`);
  },

  /**
   * Mevcut kullanıcı bilgilerini getir
   */
  async getCurrentUser(): Promise<User> {
    return await http.get('/auth/me');
  },

  /**
   * Yeni kullanıcı oluştur
   */
  async create(user: UserCreateDto): Promise<UserResponseDto> {
    return await http.post('/users', user);
  },

  /**
   * Kullanıcı güncelle
   */
  async update(id: number, user: UserUpdateDto): Promise<User> {
    return await http.patch(`/users/${id}`, user);
  },

  /**
   * Kullanıcı sil
   */
  async delete(id: number): Promise<void> {
    await http.delete(`/users/${id}`);
  },

  /**
   * Kullanıcıyı aktifleştir
   */
  async activate(id: number): Promise<User> {
    return await http.patch(`/users/${id}/activate`, {});
  },

  /**
   * Kullanıcıyı pasifleştir
   */
  async deactivate(id: number): Promise<User> {
    return await http.patch(`/users/${id}/deactivate`, {});
  },

  /**
   * Şifre sıfırlama
   */
  async resetPassword(id: number): Promise<{ temporaryPassword: string }> {
    return await http.post(`/users/${id}/reset-password`, {});
  }
}; 
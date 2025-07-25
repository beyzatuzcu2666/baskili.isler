import { http } from './http';
import { Dealer, DealerCreateDto, DealerUpdateDto, DealerWizardData } from '../types/dealer';
import { UserResponseDto } from '../types/user';

export const dealersService = {
  /**
   * Tüm bayileri getir
   */
  async getAll(): Promise<Dealer[]> {
    return await http.get('/dealers');
  },

  /**
   * Aktif bayileri getir
   */
  async getActive(): Promise<Dealer[]> {
    return await http.get('/dealers/active');
  },

  /**
   * ID ile bayi getir
   */
  async getById(id: number): Promise<Dealer> {
    return await http.get(`/dealers/${id}`);
  },

  /**
   * Yeni bayi oluştur
   */
  async create(dealer: DealerCreateDto): Promise<Dealer> {
    return await http.post('/dealers', dealer);
  },

  /**
   * Bayi güncelle
   */
  async update(id: number, dealer: DealerUpdateDto): Promise<Dealer> {
    return await http.patch(`/dealers/${id}`, dealer);
  },

  /**
   * Bayi sil
   */
  async delete(id: number): Promise<void> {
    await http.delete(`/dealers/${id}`);
  },

  /**
   * Bayi sihirbazı - bayi + admin kullanıcı oluştur
   */
  async createWithAdmin(wizardData: DealerWizardData): Promise<UserResponseDto> {
    return await http.post('/dealers/with-admin', wizardData);
  },

  /**
   * Bayiyi aktifleştir
   */
  async activate(id: number): Promise<Dealer> {
    return await http.patch(`/dealers/${id}/activate`, {});
  },

  /**
   * Bayiyi pasifleştir
   */
  async deactivate(id: number): Promise<Dealer> {
    return await http.patch(`/dealers/${id}/deactivate`, {});
  }
}; 
import { Dealer } from '../types/dealer';
import { http } from './http';

export const dealersService = {
  async getDealers(): Promise<Dealer[]> {
    return await http.get('/dealers');
  },
  async getDealerById(id: number): Promise<Dealer> {
    return await http.get(`/dealers/${id}`);
  },
  async createDealer(data: { name: string; address: string; phoneNumber: string; taxNumber: string; admin: { name: string; email: string; phoneNumber: string } }): Promise<Dealer> {
    // Backend'in beklediği formata çevir
    const backendData = {
      name: data.name,
      address: data.address,
      phoneNumber: data.phoneNumber,
      taxNumber: data.taxNumber,
      adminName: data.admin.name,
      adminEmail: data.admin.email,
      adminPhoneNumber: data.admin.phoneNumber
    };
    return await http.post('/dealers', backendData);
  },
  async updateDealer(id: number, data: Partial<{ name: string; address: string; phoneNumber: string; taxNumber: string }>): Promise<Dealer> {
    return await http.patch(`/dealers/${id}`, data);
  },
  async deleteDealer(id: number): Promise<void> {
    await http.delete(`/dealers/${id}`);
  },

  /**
   * Dealer istatistiklerini getir
   */
  async getDealerStats(dealerId: number): Promise<{
    totalProducts: number;
    totalBrands: number;
    totalQuotes: number;
    pendingFactoryAssignments: number;
  }> {
    try {
      const response = await http.get(`/statistics/dealers/${dealerId}/overview`);
      return response || {
        totalProducts: 0,
        totalBrands: 0,
        totalQuotes: 0,
        pendingFactoryAssignments: 0
      };
    } catch (error) {
      console.error('Error fetching dealer stats:', error);
      return {
        totalProducts: 0,
        totalBrands: 0,
        totalQuotes: 0,
        pendingFactoryAssignments: 0
      };
    }
  }
}; 
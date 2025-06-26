import { Order } from '../types/order';
import { authService } from './auth';
import { http } from './http';

const BASE_URL = '/orders';

export const ordersService = {
  getAll: async (): Promise<Order[]> => {
    return await http.get(BASE_URL);
  },

  delete: async (id: string): Promise<void> => {
    await http.delete(`${BASE_URL}/${id}`);
  },

  acceptOffer: async (offerId: string, itemDeadlines: Record<string, string>): Promise<void> => {
    try {
      const payload = {
        itemDeadlines: itemDeadlines
      };
      
      await http.patch(`${BASE_URL}/${offerId}/accept`, payload);
    } catch (error: any) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  }
};

import { Order } from '../types/order';
import { authService } from './auth';
import { http } from './http';

const BASE_URL = 'https://baskili-isler-backend.onrender.com/orders';

export const ordersService = {
  getAll: async (): Promise<Order[]> => {
    return await http.get(BASE_URL);
  },

  delete: async (id: string): Promise<void> => {
    await http.delete(`${BASE_URL}/${id}`);
  },

  acceptOffer: async (offerId: string): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/${offerId}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Response status:', response.status);
        console.error('Response headers:', response.headers);
        console.error('Response body:', errorData);
        throw new Error(
          errorData.message || 
          `HTTP ${response.status}: ${response.statusText} - Sipariş kabul edilemedi`
        );
      }
    } catch (error: any) {
      console.error('Error message:', error.message);
      throw error;
    }
  }
};

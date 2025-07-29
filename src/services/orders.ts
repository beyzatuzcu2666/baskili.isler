import { Order } from '../types/order';
import { http } from './http';

const BASE_URL = '/orders';

export const ordersService = {
  getAll: async (): Promise<Order[]> => {
    return await http.get(BASE_URL);
  },

  create: async (orderData: any): Promise<Order> => {
    return await http.post(BASE_URL, orderData);
  },

  delete: async (id: string): Promise<void> => {
    await http.delete(`${BASE_URL}/${id}`);
  },

  acceptOffer: async (offerId: string, itemDeadlines: Record<string, string>): Promise<void> => {
    try {
      const payload = {
        itemDeadlines: itemDeadlines
      };
      
      // Curl örneğine göre: PATCH /orders/{orderId}/accept
      await http.patch(`${BASE_URL}/${offerId}/accept`, payload);
    } catch (error: any) {
      console.error('Error accepting offer:', error);
      throw error;
    }
  },

  assignFactory: async (orderId: string, factoryId: number, deadline: string): Promise<void> => {
    try {
      const payload = {
        factoryId: factoryId,
        deadline: deadline
      };
      
      // Curl örneğine göre: PATCH /orders/{orderId}/assign-factory
      await http.patch(`${BASE_URL}/${orderId}/assign-factory`, payload);
    } catch (error: any) {
      console.error('Error assigning factory:', error);
      throw error;
    }
  },

  complete: async (orderId: string): Promise<void> => {
    try {
      // PATCH /orders/{orderId}/complete
      await http.patch(`${BASE_URL}/${orderId}/complete`, {});
    } catch (error: any) {
      console.error('Error completing order:', error);
      throw error;
    }
  },

  cancel: async (orderId: string): Promise<void> => {
    try {
      // PATCH /orders/{orderId}/cancel
      await http.patch(`${BASE_URL}/${orderId}/cancel`, {});
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  // FACTORY_USER için sipariş durumu güncelleme
  updateStatus: async (orderId: number, newStatus: string): Promise<void> => {
    try {
      // PATCH /orders/{orderId}/status
      await http.patch(`${BASE_URL}/${orderId}/status`, { status: newStatus });
    } catch (error: any) {
      console.error('Error updating order status:', error);
      console.error('Request details:', {
        orderId,
        newStatus,
        url: `${BASE_URL}/${orderId}/status`,
        payload: { status: newStatus }
      });
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }
};

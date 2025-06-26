import { Order } from '../types/order';
import { authService } from './auth';

const BASE_URL = 'https://baskili-isler-backend.onrender.com/orders';

export const ordersService = {
  getAll: async (): Promise<Order[]> => {
    const token = authService.getToken();
    if (!token) throw new Error('Yetkilendirme hatası');

    const response = await fetch(BASE_URL, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Siparişler yüklenemedi');
    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const token = authService.getToken();
    if (!token) throw new Error('Yetkilendirme hatası');

    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Sipariş silinemedi');
  }
};

import { http } from './http';
import { Offer } from '../types/offer';

export const offersService = {
  async getAll(): Promise<Offer[]> {
    const response = await http.get('/offers');
    return response.data;
  },
  async create(offer: Omit<Offer, 'id' | 'createdAt'>): Promise<Offer> {
    const response = await http.post('/offers', offer);
    return response.data;
  },
  async update(id: number, offer: Partial<Offer>): Promise<Offer> {
    const response = await http.put(`/offers/${id}`, offer);
    return response.data;
  },
  async delete(id: number): Promise<void> {
    await http.delete(`/offers/${id}`);
  }
};

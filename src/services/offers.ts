import {http} from './http';
import {Offer} from '../types/offer';

export const offersService = {
  async getAll(): Promise<Offer[]> {
    return await http.get('/quotes');
  },
  async create(offer: Omit<Offer, 'id' | 'createdAt'>): Promise<Offer> {
    return await http.post('/quotes', offer);
  },
  async update(id: number, offer: Partial<Offer>): Promise<Offer> {
    return await http.put(`/quotes/${id}`, offer);
  },
  async delete(id: number): Promise<void> {
    await http.delete(`/quotes/${id}`);
  }
};

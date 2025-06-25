import axios from 'axios';

export interface OfferProduct {
  productId: number;
  quantity: number;
  price: number;
}

export interface Offer {
  id: number;
  brandId: number;
  products: OfferProduct[];
  createdAt: string;
}

export const offersService = {
  getAll: async (): Promise<Offer[]> => {
    const response = await axios.get<Offer[]>('/api/offers');
    return response.data;
  },
  create: async (offer: Omit<Offer, 'id' | 'createdAt'>): Promise<Offer> => {
    const response = await axios.post<Offer>('/api/offers', offer);
    return response.data;
  },
  update: async (id: number, offer: Partial<Offer>): Promise<Offer> => {
    const response = await axios.put<Offer>(`/api/offers/${id}`, offer);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await axios.delete(`/api/offers/${id}`);
  }
};

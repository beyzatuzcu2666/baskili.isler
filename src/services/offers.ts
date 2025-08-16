import {http} from './http';
import {Offer} from '../types/offer';

export const offersService = {
  async getAll(): Promise<Offer[]> {
    return await http.get('/quotes');
  },
  async getDealerOffers(dealerId?: number): Promise<Offer[]> {
    if (dealerId) {
      return await http.get(`/dealer-data/quotes?dealerId=${dealerId}`);
    }
    return await http.get('/dealer-data/quotes');
  },
  async getByDealer(dealerId: number): Promise<Offer[]> {
    return await http.get(`/quotes?dealerId=${dealerId}`);
  },
  async create(offer: Omit<Offer, 'id' | 'createdAt'>): Promise<Offer> {
    return await http.post('/quotes', offer);
  },
  async update(id: number, offer: Partial<Offer>): Promise<Offer> {
    return await http.put(`/quotes/${id}`, offer);
  },
  async delete(id: number): Promise<void> {
    await http.delete(`/quotes/${id}`);
  },

  // İstatistik endpoint'leri
  async getExpiringOffers(dealerId?: number): Promise<{
    expiringCount: number;
    expiringOffers: Offer[];
    totalValue: number;
  }> {
    try {
      let url = '/statistics/offers/expiring';
      if (dealerId) {
        url += `?dealerId=${dealerId}`;
      }
      console.log('Calling expiring offers endpoint:', url);
      const response = await http.get(url);
      console.log('Expiring offers response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching expiring offers:', error);
      return { expiringCount: 0, expiringOffers: [], totalValue: 0 };
    }
  },

  async getWeeklyStats(dealerId?: number): Promise<{
    acceptedCount: number;
    rejectedCount: number;
    sentCount: number;
    acceptedValue: number;
    totalValue: number;
    acceptanceRate: number;
  }> {
    try {
      let url = '/statistics/offers/weekly';
      if (dealerId) {
        url += `?dealerId=${dealerId}`;
      }
      console.log('Calling weekly stats endpoint:', url);
      const response = await http.get(url);
      console.log('Weekly stats response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching weekly stats:', error);
      return { acceptedCount: 0, rejectedCount: 0, sentCount: 0, acceptedValue: 0, totalValue: 0, acceptanceRate: 0 };
    }
  },

  async getOffersOverview(dealerId?: number): Promise<{
    totalOffers: number;
    pendingOffers: number;
    acceptedOffers: number;
    rejectedOffers: number;
    totalValue: number;
    acceptedValue: number;
    acceptanceRate: number;
    averageOfferValue: number;
  }> {
    try {
      let url = '/statistics/offers/overview';
      if (dealerId) {
        url += `?dealerId=${dealerId}`;
      }
      console.log('Calling offers overview endpoint:', url);
      const response = await http.get(url);
      console.log('Offers overview response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching offers overview:', error);
      return { totalOffers: 0, pendingOffers: 0, acceptedOffers: 0, rejectedOffers: 0, totalValue: 0, acceptedValue: 0, acceptanceRate: 0, averageOfferValue: 0 };
    }
  }
};

import http from './http';

export interface Brand {
  id: number;
  name: string;
}

export const brandsService = {
  async getBrands(): Promise<Brand[]> {
    try {
      const response = await http.get('/brands');
      return response.data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  }
};

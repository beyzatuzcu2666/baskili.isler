import http from './http';

export interface Brand {
  id: number;
  name: string;
  contactEmail: string;
  contactPhone: string;
}

export const brandsService = {
  async getBrands(): Promise<Brand[]> {
    try {
      const response = await http.get('/brands');
      // Ensure we return an empty array if data is undefined
      return response.data || [];
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  },

  async createBrand(brandData: Omit<Brand, 'id'>): Promise<Brand> {
    try {
      const response = await http.post('/brands', brandData);
      return response.data;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  }
};

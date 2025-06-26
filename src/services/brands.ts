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
      return response || [];
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
      throw error;
    }
  },

  async updateBrand(brandId: number, brandData: Omit<Brand, 'id'>): Promise<Brand> {
    try {
      const response = await http.put(`/brands/${brandId}`, brandData);
      return response.data;
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  },

  async deleteBrand(brandId: number): Promise<void> {
    try {
      await http.delete(`/brands/${brandId}`);
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  }
};

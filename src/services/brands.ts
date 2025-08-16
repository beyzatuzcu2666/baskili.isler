import http from './http';

export interface Brand {
  id: number;
  name: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl?: string;
  createdAt?: string;
  taxNumber?: string | null;
  assignedUserId?: number;
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

  async getDealerBrands(dealerId?: number): Promise<Brand[]> {
    try {
      let url = '/dealer-data/brands';
      if (dealerId) {
        url = `/dealer-data/brands?dealerId=${dealerId}`;
      }
      const response = await http.get(url);
      return response || [];
    } catch (error) {
      console.error('Error fetching dealer brands:', error);
      throw error;
    }
  },

  async getByDealer(dealerId: number): Promise<Brand[]> {
    try {
      const response = await http.get(`/brands?dealerId=${dealerId}`);
      return response || [];
    } catch (error) {
      console.error('Error fetching brands by dealer:', error);
      throw error;
    }
  },

  async createBrand(brandData: Omit<Brand, 'id'>): Promise<Brand> {
    try {
      const response = await http.post('/brands', brandData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateBrand(brandId: number, brandData: Omit<Brand, 'id'>): Promise<Brand> {
    try {
      const response = await http.patch(`/brands/${brandId}`, brandData);
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
  },

  async uploadBrandLogo(brandId: number, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await http.patch(`/brands/${brandId}/logo`, formData);
    } catch (error) {
      console.error('Error uploading brand logo:', error);
      throw error;
    }
  },

  /**
   * En çok teklif alan markayı getir
   */
  async getMostQuotedBrand(dealerId?: number): Promise<{
    brandId: number;
    brandName: string;
    quoteCount: number;
    totalRevenue: number;
  } | null> {
    try {
      let url = '/statistics/brands/most-quoted';
      if (dealerId) {
        url += `?dealerId=${dealerId}`;
      }
      return await http.get(url);
    } catch (error) {
      console.error('Error fetching most quoted brand:', error);
      return null;
    }
  }
};

import { http } from './http';
import { Factory, CreateFactoryRequest, UpdateFactoryRequest } from '../types/factory';

export const factoriesService = {
  async getAll(onlyActive?: boolean): Promise<Factory[]> {
    try {
      const queryParam = onlyActive !== undefined ? `?onlyActive=${onlyActive}` : '?onlyActive=false';
      const response = await http.get(`/factories${queryParam}`);
      
      // API response might be wrapped in a data property or be direct array
      if (response && Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    } catch (error: any) {
      console.error('Error fetching factories:', error);
      throw new Error(error.message || 'Fabrikalar yüklenirken bir hata oluştu');
    }
  },

  async create(factoryData: CreateFactoryRequest): Promise<Factory> {
    try {
      const response = await http.post('/factories', factoryData);
      return response.data || response;
    } catch (error: any) {
      console.error('Error creating factory:', error);
      throw new Error(error.message || 'Fabrika oluşturulurken bir hata oluştu');
    }
  },

  async update(factoryId: number, factoryData: UpdateFactoryRequest): Promise<Factory> {
    try {
      const response = await http.put(`/factories/${factoryId}`, factoryData);
      return response.data || response;
    } catch (error: any) {
      console.error('Error updating factory:', error);
      throw new Error(error.message || 'Fabrika güncellenirken bir hata oluştu');
    }
  },

  async delete(factoryId: number): Promise<void> {
    try {
      await http.delete(`/factories/${factoryId}`);
    } catch (error: any) {
      console.error('Error deleting factory:', error);
      throw new Error(error.message || 'Fabrika silinirken bir hata oluştu');
    }
  },

  async getById(factoryId: number): Promise<Factory> {
    try {
      const response = await http.get(`/factories/${factoryId}`);
      return response.data || response;
    } catch (error: any) {
      console.error('Error fetching factory:', error);
      throw new Error(error.message || 'Fabrika bilgileri yüklenirken bir hata oluştu');
    }
  },

  // Sadece aktif fabrikaları getir
  async getActiveFactories(): Promise<Factory[]> {
    return this.getAll(true);
  },

  // Tüm fabrikaları getir (aktif + pasif)
  async getAllFactories(): Promise<Factory[]> {
    return this.getAll(false);
  }
}; 
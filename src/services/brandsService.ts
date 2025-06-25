import axios from 'axios';

export interface Brand {
  id: number;
  name: string;
}

export const brandsService = {
  getAll: async (): Promise<Brand[]> => {
    const response = await axios.get<Brand[]>('/api/brands');
    return response.data;
  }
};

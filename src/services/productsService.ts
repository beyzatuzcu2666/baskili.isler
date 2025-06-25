import axios from 'axios';

export interface Product {
  id: number;
  name: string;
  brandId: number;
}

export const productsService = {
  getAll: async (): Promise<Product[]> => {
    const response = await axios.get<Product[]>('/api/products');
    return response.data;
  }
};

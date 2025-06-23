import { http } from './http';
import { Product } from '../types/product';

export const productsService = {
  async getAll(): Promise<Product[]> {
    const response = await http.get('/products');
    return response.data;
  },
  async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const response = await http.post('/products', product);
    return response.data;
  },
  async update(id: number, product: Partial<Product>): Promise<Product> {
    const response = await http.put(`/products/${id}`, product);
    return response.data;
  },
  async delete(id: number): Promise<void> {
    await http.delete(`/products/${id}`);
  }
};

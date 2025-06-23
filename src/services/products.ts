import {http} from './http';
import {Product} from '../types/product';

export const productsService = {
  async getAll(): Promise<Product[]> {
    return await http.get('/products');
  },
  async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    return await http.post('/products', product);
  },
  async update(id: number, product: Partial<Product>): Promise<Product> {
    return await http.patch(`/products/${id}`, product);
  },
  async delete(id: number): Promise<void> {
    await http.delete(`/products/${id}`);
  }
};

import { http } from './http';
import { Product, ProductCreateDto, ProductUpdateDto, ProductResponseDto } from '../types/product';

export const productsService = {
  /**
   * Tüm ürünleri getir
   */
  async getAll(): Promise<Product[]> {
    return await http.get('/products');
  },

  /**
   * Sadece aktif ürünleri getir
   */
  async getActive(): Promise<Product[]> {
    return await http.get('/products/active');
  },

  /**
   * ID ile ürün getir
   */
  async getById(id: number): Promise<ProductResponseDto> {
    return await http.get(`/products/${id}`);
  },

  /**
   * Yeni ürün oluştur
   */
  async create(product: ProductCreateDto): Promise<ProductResponseDto> {
    return await http.post('/products', product);
  },

  /**
   * Ürün güncelle
   */
  async update(id: number, product: ProductUpdateDto): Promise<ProductResponseDto> {
    return await http.patch(`/products/${id}`, product);
  },

  /**
   * Ürün sil
   */
  async delete(id: number): Promise<void> {
    await http.delete(`/products/${id}`);
  },

  /**
   * Ürünü aktifleştir
   */
  async activate(id: number): Promise<ProductResponseDto> {
    return await http.patch(`/products/${id}/activate`, {});
  },

  /**
   * Ürünü pasifleştir
   */
  async deactivate(id: number): Promise<ProductResponseDto> {
    return await http.patch(`/products/${id}/deactivate`, {});
  }
};

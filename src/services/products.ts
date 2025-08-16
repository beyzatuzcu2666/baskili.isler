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
   * Kullanıcının bayisinin ürünlerini getir
   */
  async getDealerProducts(dealerId?: number): Promise<Product[]> {
    if (dealerId) {
      return await http.get(`/dealer-data/products?dealerId=${dealerId}`);
    }
    return await http.get('/dealer-data/products');
  },

  /**
   * Bayi bazında ürünleri getir
   */
  async getByDealer(dealerId: number): Promise<Product[]> {
    return await http.get(`/products?dealerId=${dealerId}`);
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
  },

  /**
   * En çok sipariş alan ürünü getir
   */
  async getMostOrderedProduct(dealerId?: number): Promise<{
    productId: number;
    productName: string;
    orderCount: number;
    totalRevenue: number;
  } | null> {
    try {
      let url = '/statistics/products/most-ordered';
      if (dealerId) {
        url += `?dealerId=${dealerId}`;
      }
      return await http.get(url);
    } catch (error) {
      console.error('Error fetching most ordered product:', error);
      return null;
    }
  }
};

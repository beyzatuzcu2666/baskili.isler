import { http } from './http';

export const imageService = {
  /**
   * Tek bir görsel yükler
   * @param file - Yüklenecek dosya
   * @returns Promise<{ imageUrl: string }>
   */
  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await http.post('/images/upload', formData);
      return response;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  /**
   * Birden fazla görseli sırayla yükler
   * @param files - Yüklenecek dosyalar array'i
   * @returns Promise<string[]> - Yüklenen görsellerin URL'leri
   */
  async uploadMultipleImages(files: File[]): Promise<string[]> {
    const uploadedUrls: string[] = [];
    
    for (const file of files) {
      try {
        const result = await this.uploadImage(file);
        uploadedUrls.push(result.imageUrl);
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error);
        throw new Error(`${file.name} yüklenemedi`);
      }
    }
    
    return uploadedUrls;
  }
};

export interface Offer {
  id: number;
  brandId: number;
  brandName?: string;
  createdAt: string;
  status: 'DRAFT' | 'OFFER_SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  totalPrice: number;
  validUntil: string;
  dealerId?: number; // Dealer ID (opsiyonel)
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }[];
}

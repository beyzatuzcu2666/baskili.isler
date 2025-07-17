export interface Offer {
  id: number;
  brandId: number;
  brandName?: string;
  createdAt: string;
  status: 'OFFER_SENT' | 'OFFER_ACCEPTED' | 'OFFER_REJECTED';
  totalPrice: number;
  validUntil: string;
  items: {
    productId: number;
    quantity: number;
    unitPrice: number;
  }[];
}

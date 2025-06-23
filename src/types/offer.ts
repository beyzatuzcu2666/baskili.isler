export interface Offer {
  id: number;
  brandName: string;
  createdAt: string;
  status: 'OFFER_SENT' | 'OFFER_ACCEPTED' | 'OFFER_REJECTED';
  totalPrice: number;
  validUntil: string;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
}

export interface Order {
  id: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'IN_PRODUCTION' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  deadline?: string | null;
  deliveredAt?: string | null;
  totalPrice: number;
  brand: {
    id: number;
    name: string;
  };
  factory?: {
    id: number;
    name: string;
  } | null;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    plannedDelivery: string;
    status: string;
  }[];
}

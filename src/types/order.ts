export enum OrderStatus {
  PENDING = 'PENDING',           // Sipariş alındı
  IN_PRODUCTION = 'IN_PRODUCTION', // Sipariş hazırlanıyor  
  IN_WAREHOUSE = 'IN_WAREHOUSE',   // Sipariş depoda
  IN_TRANSIT = 'IN_TRANSIT',       // Sipariş yola çıktı
  DELIVERED = 'DELIVERED',         // Sipariş teslim edildi
  CANCELLED = 'CANCELLED'          // Sipariş iptal edildi
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Sipariş Alındı',
  [OrderStatus.IN_PRODUCTION]: 'Hazırlanıyor',
  [OrderStatus.IN_WAREHOUSE]: 'Depoda',
  [OrderStatus.IN_TRANSIT]: 'Yolda',
  [OrderStatus.DELIVERED]: 'Teslim Edildi',
  [OrderStatus.CANCELLED]: 'İptal Edildi'
};

export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '#f97316',
  [OrderStatus.IN_PRODUCTION]: '#3b82f6',
  [OrderStatus.IN_WAREHOUSE]: '#8b5cf6',
  [OrderStatus.IN_TRANSIT]: '#f59e0b',
  [OrderStatus.DELIVERED]: '#10b981',
  [OrderStatus.CANCELLED]: '#ef4444'
};

export interface Order {
  id: number;
  status: OrderStatus;
  createdAt: string;
  deadline?: string | null;
  deliveredAt?: string | null;
  totalPrice: number;
  brand: {
    id: number;
    name: string;
    logoUrl?: string;
    phone?: string;
    contactPhone?: string;
    assignedUser?: {
      id: number;
      name: string;
      email: string;
      phone: string;
    };
  };
  factory?: {
    id: number;
    name: string;
    phone?: string;
    address?: string;
  } | null;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    lineTotal: number;
    taxAmount?: number;
    lineTotalWithTax?: number;
    plannedDelivery: string;
    status: string;
  }[];
  customerLogoUrl?: string;
  description?: string;
  customerTaxNumber?: string | null;
  imageUrls?: string[];
}

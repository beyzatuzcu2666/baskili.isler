export enum OrderStatus {
  PENDING = 'PENDING',           // Sipariş alındı
  IN_PRODUCTION = 'IN_PRODUCTION', // Sipariş hazırlanıyor  
  IN_WAREHOUSE = 'IN_WAREHOUSE',   // Sipariş depoda
  IN_TRANSIT = 'IN_TRANSIT',       // Sipariş yola çıktı
  DELIVERED = 'DELIVERED'          // Sipariş teslim edildi
}

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Sipariş Alındı',
  [OrderStatus.IN_PRODUCTION]: 'Hazırlanıyor',
  [OrderStatus.IN_WAREHOUSE]: 'Depoda',
  [OrderStatus.IN_TRANSIT]: 'Yolda',
  [OrderStatus.DELIVERED]: 'Teslim Edildi'
};

export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '#f97316',
  [OrderStatus.IN_PRODUCTION]: '#3b82f6',
  [OrderStatus.IN_WAREHOUSE]: '#8b5cf6',
  [OrderStatus.IN_TRANSIT]: '#f59e0b',
  [OrderStatus.DELIVERED]: '#10b981'
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

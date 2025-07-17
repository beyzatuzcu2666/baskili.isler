// Backend'deki enum'lara uygun notification tipleri
export enum NotificationType {
  // Sipariş notifications
  NEW_ORDER = "NEW_ORDER",
  DEADLINE_APPROACHING = "DEADLINE_APPROACHING", 
  DEADLINE_EXCEEDED = "DEADLINE_EXCEEDED",
  FACTORY_ASSIGNMENT_NEEDED = "FACTORY_ASSIGNMENT_NEEDED",
  ORDER_DELIVERED = "ORDER_DELIVERED",
  
  // Teklif notifications
  NEW_QUOTE = "NEW_QUOTE",
  QUOTE_ACCEPTED = "QUOTE_ACCEPTED",
  QUOTE_EXPIRING = "QUOTE_EXPIRING",
  QUOTE_EXPIRED = "QUOTE_EXPIRED",
  
  // Brand notifications
  NEW_BRAND = "NEW_BRAND",
  
  // Üretim notifications
  PRODUCTION_READY = "PRODUCTION_READY"
}

export enum NotificationPriority {
  CRITICAL = "CRITICAL",
  IMPORTANT = "IMPORTANT", 
  NORMAL = "NORMAL"
}

export interface Notification {
  id: number;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  deepLinkUrl: string;
  entityType: string;
  entityId: number;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

// Frontend'de kullanım için helper fonksiyonlar
export const getNotificationTypeDisplayName = (type: NotificationType): string => {
  const displayNames: Record<NotificationType, string> = {
    [NotificationType.NEW_ORDER]: "Yeni Sipariş",
    [NotificationType.DEADLINE_APPROACHING]: "Deadline Yaklaşıyor",
    [NotificationType.DEADLINE_EXCEEDED]: "Deadline Geçti",
    [NotificationType.FACTORY_ASSIGNMENT_NEEDED]: "Fabrika Atama Gerekli",
    [NotificationType.ORDER_DELIVERED]: "Sipariş Teslim Edildi",
    [NotificationType.NEW_QUOTE]: "Yeni Teklif",
    [NotificationType.QUOTE_ACCEPTED]: "Teklif Kabul Edildi",
    [NotificationType.QUOTE_EXPIRING]: "Teklif Süresi Doluyor",
    [NotificationType.QUOTE_EXPIRED]: "Teklif Süresi Doldu",
    [NotificationType.NEW_BRAND]: "Yeni Marka",
    [NotificationType.PRODUCTION_READY]: "Üretim Hazır"
  };
  return displayNames[type];
};

export const getNotificationPriorityDisplayName = (priority: NotificationPriority): string => {
  const displayNames: Record<NotificationPriority, string> = {
    [NotificationPriority.CRITICAL]: "Kritik",
    [NotificationPriority.IMPORTANT]: "Önemli", 
    [NotificationPriority.NORMAL]: "Normal"
  };
  return displayNames[priority];
};

export const getNotificationPriorityColor = (priority: NotificationPriority): string => {
  const colors: Record<NotificationPriority, string> = {
    [NotificationPriority.CRITICAL]: "#ef4444", // red
    [NotificationPriority.IMPORTANT]: "#f97316", // orange
    [NotificationPriority.NORMAL]: "#3b82f6" // blue
  };
  return colors[priority];
}; 
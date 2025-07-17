import { http } from './http';
import { Notification, NotificationStats, NotificationType, NotificationPriority } from '../types/notification';

export interface NotificationFilters {
  type?: NotificationType;
  priority?: NotificationPriority;
  isRead?: boolean;
  page?: number;
  limit?: number;
}

class NotificationService {
  private readonly baseUrl = '/notifications';

  /**
   * Tüm bildirimleri getir
   */
  async getAll(filters: NotificationFilters = {}): Promise<Notification[]> {
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    const response = await http.get<Notification[]>(url);
    return response;
  }

  /**
   * Okunmamış bildirimleri getir
   */
  async getUnread(): Promise<Notification[]> {
    const response = await http.get<Notification[]>(`${this.baseUrl}/unread`);
    return response;
  }

  /**
   * Okunmamış bildirim sayısını getir
   */
  async getUnreadCount(): Promise<number> {
    const response = await http.get<number>(`${this.baseUrl}/count`);
    return response;
  }

  /**
   * Belirli bir bildirimi okundu olarak işaretle
   */
  async markAsRead(id: number): Promise<void> {
    await http.post(`${this.baseUrl}/${id}/read`, {});
  }

  /**
   * Tüm bildirimleri okundu olarak işaretle
   */
  async markAllAsRead(): Promise<void> {
    await http.post(`${this.baseUrl}/read-all`, {});
  }

  /**
   * Bildirim istatistiklerini getir
   */
  async getStats(): Promise<NotificationStats> {
    const notifications = await this.getAll();
    
    const stats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      byType: {} as Record<NotificationType, number>,
      byPriority: {} as Record<NotificationPriority, number>
    };

    // Type'a göre sayıları hesapla
    Object.values(NotificationType).forEach(type => {
      stats.byType[type] = notifications.filter(n => n.type === type).length;
    });

    // Priority'ye göre sayıları hesapla
    Object.values(NotificationPriority).forEach(priority => {
      stats.byPriority[priority] = notifications.filter(n => n.priority === priority).length;
    });

    return stats;
  }

  /**
   * Bildirim tipine göre icon'u getir
   */
  getNotificationIcon(type: NotificationType): string {
    const iconMap: Record<NotificationType, string> = {
      [NotificationType.NEW_ORDER]: '📦',
      [NotificationType.DEADLINE_APPROACHING]: '⏰',
      [NotificationType.DEADLINE_EXCEEDED]: '🚨',
      [NotificationType.FACTORY_ASSIGNMENT_NEEDED]: '🏭',
      [NotificationType.ORDER_DELIVERED]: '✅',
      [NotificationType.NEW_QUOTE]: '💰',
      [NotificationType.QUOTE_ACCEPTED]: '✅',
      [NotificationType.QUOTE_EXPIRING]: '⏳',
      [NotificationType.QUOTE_EXPIRED]: '❌',
      [NotificationType.NEW_BRAND]: '🏷️',
      [NotificationType.PRODUCTION_READY]: '🔧'
    };
    return iconMap[type] || '📢';
  }

  /**
   * Zaman formatını Türkçe'ye çevir
   */
  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Şimdi';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} dk önce`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} sa önce`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} gün önce`;
    } else {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} ay önce`;
    }
  }
}

export const notificationsService = new NotificationService(); 
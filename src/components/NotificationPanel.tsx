import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  Tooltip,
  Badge,
  ButtonGroup
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  DeleteOutline as DeleteIcon,
  MarkEmailRead as MarkAllReadIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { notificationsService } from '../services/notifications';
import { 
  Notification, 
  NotificationType, 
  NotificationPriority,
  getNotificationTypeDisplayName,
  getNotificationPriorityDisplayName,
  getNotificationPriorityColor
} from '../types/notification';

interface NotificationPanelProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ anchorEl, open, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let data: Notification[];
      if (filter === 'unread') {
        data = await notificationsService.getUnread();
      } else if (filter === 'critical') {
        data = await notificationsService.getAll({ priority: NotificationPriority.CRITICAL });
      } else {
        data = await notificationsService.getAll({ limit: 20 });
      }
      
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bildirimler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
    } catch (err) {
      setError('Bildirim okundu olarak işaretlenirken hata oluştu');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (err) {
      setError('Tüm bildirimler okundu olarak işaretlenirken hata oluştu');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    
    // Deep link navigation
    if (notification.deepLinkUrl) {
      navigate(notification.deepLinkUrl);
      onClose();
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    return notificationsService.getNotificationIcon(type);
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'critical') return n.priority === NotificationPriority.CRITICAL;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!open) return null;

  return (
    <Paper
      sx={{
        position: 'fixed',
        top: 70,
        right: 20,
        width: 420,
        maxHeight: 600,
        zIndex: 1300,
        borderRadius: 2,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
        border: '1px solid #e2e8f0',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid #e2e8f0', bgcolor: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsActiveIcon sx={{ color: '#3b82f6' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Bildirimler
            </Typography>
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="error" />
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Yenile">
              <IconButton size="small" onClick={loadNotifications}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Tümünü Okundu İşaretle">
              <IconButton size="small" onClick={handleMarkAllAsRead}>
                <MarkAllReadIcon />
              </IconButton>
            </Tooltip>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Filter Buttons */}
        <ButtonGroup size="small" sx={{ mt: 2 }}>
          <Button
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilter('all')}
          >
            Tümü ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'contained' : 'outlined'}
            onClick={() => setFilter('unread')}
          >
            Okunmamış ({unreadCount})
          </Button>
          <Button
            variant={filter === 'critical' ? 'contained' : 'outlined'}
            onClick={() => setFilter('critical')}
            color="error"
          >
            Kritik
          </Button>
        </ButtonGroup>
      </Box>

      {/* Content */}
      <Box sx={{ maxHeight: 450, overflow: 'auto' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && filteredNotifications.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              {filter === 'unread' ? 'Okunmamış bildirim yok' : 'Henüz bildirim yok'}
            </Typography>
          </Box>
        )}

        {!loading && !error && filteredNotifications.length > 0 && (
          <List sx={{ p: 0 }}>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                                 <ListItem
                   onClick={() => handleNotificationClick(notification)}
                   sx={{
                     py: 2,
                     px: 2,
                     backgroundColor: notification.isRead ? 'transparent' : '#f0f9ff',
                     '&:hover': { backgroundColor: '#f8fafc' },
                     cursor: 'pointer'
                   }}
                 >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: getNotificationPriorityColor(notification.priority),
                        fontSize: '1.2rem'
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: notification.isRead ? 400 : 600,
                            color: '#1e293b',
                            flex: 1
                          }}
                        >
                          {notification.title}
                        </Typography>
                        <Chip
                          label={getNotificationPriorityDisplayName(notification.priority)}
                          size="small"
                          sx={{
                            backgroundColor: getNotificationPriorityColor(notification.priority),
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20
                          }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#64748b',
                            fontSize: '0.85rem',
                            mb: 0.5
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography
                            variant="caption"
                            sx={{ color: '#94a3b8' }}
                          >
                            {notificationsService.formatTimeAgo(notification.createdAt)}
                          </Typography>
                          <Chip
                            label={getNotificationTypeDisplayName(notification.type)}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 18 }}
                          />
                        </Box>
                      </Box>
                    }
                  />
                  
                  {!notification.isRead && (
                    <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6'
                        }}
                      />
                    </Box>
                  )}
                </ListItem>
                
                {index < filteredNotifications.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <Box sx={{ p: 2, borderTop: '1px solid #e2e8f0', bgcolor: 'white' }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              navigate('/notifications');
              onClose();
            }}
            sx={{
              color: '#3b82f6',
              borderColor: '#3b82f6',
              '&:hover': { backgroundColor: '#f0f9ff' }
            }}
          >
            Tüm Bildirimleri Görüntüle
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default NotificationPanel; 
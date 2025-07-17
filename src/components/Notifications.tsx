import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Button,
  ButtonGroup,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  CircularProgress,
  Alert,
  Tooltip,
  Badge,
  Divider,
  Paper,
  Grid,
  Stack,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  DeleteOutline as DeleteIcon,
  MarkEmailRead as MarkAllReadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  NotificationsOff as NotificationsOffIcon,
  Schedule as ScheduleIcon,
  PriorityHigh as PriorityHighIcon
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

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [priorityFilter, setPriorityFilter] = useState<NotificationPriority | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
  const navigate = useNavigate();

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = { page, limit: 10 };
      
      if (filter === 'unread') filters.isRead = false;
      if (filter === 'read') filters.isRead = true;
      if (priorityFilter !== 'all') filters.priority = priorityFilter;
      if (typeFilter !== 'all') filters.type = typeFilter;
      
      const data = await notificationsService.getAll(filters);
      setNotifications(data);
      
      // Calculate stats
      const allNotifications = await notificationsService.getAll();
      setStats({
        total: allNotifications.length,
        unread: allNotifications.filter(n => !n.isRead).length,
        read: allNotifications.filter(n => n.isRead).length
      });
      
      // Calculate total pages (assuming 10 items per page)
      setTotalPages(Math.ceil(allNotifications.length / 10));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bildirimler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [filter, priorityFilter, typeFilter, page]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationsService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setStats(prev => ({ ...prev, unread: prev.unread - 1, read: prev.read + 1 }));
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
      setStats(prev => ({ ...prev, unread: 0, read: prev.total }));
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
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    return notificationsService.getNotificationIcon(type);
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatsCardColor = (type: 'total' | 'unread' | 'read') => {
    switch (type) {
      case 'total': return '#3b82f6';
      case 'unread': return '#ef4444';
      case 'read': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatsCardIcon = (type: 'total' | 'unread' | 'read') => {
    switch (type) {
      case 'total': return <NotificationsIcon />;
      case 'unread': return <NotificationsActiveIcon />;
      case 'read': return <NotificationsOffIcon />;
      default: return <NotificationsIcon />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, pl: { xs: 2, sm: 3, md: 3 }, pr: { xs: 2, sm: 3, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
          Bildirimler
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Tüm sistem bildirimlerinizi buradan takip edebilirsiniz
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        {[
          { key: 'total', label: 'Toplam', value: stats.total, type: 'total' as const },
          { key: 'unread', label: 'Okunmamış', value: stats.unread, type: 'unread' as const },
          { key: 'read', label: 'Okunmuş', value: stats.read, type: 'read' as const }
        ].map((stat) => (
          <Card key={stat.key} sx={{ 
            flex: '1 1 300px',
            background: `linear-gradient(135deg, ${getStatsCardColor(stat.type)}15 0%, ${getStatsCardColor(stat.type)}08 100%)`,
            border: `1px solid ${getStatsCardColor(stat.type)}20`,
            borderRadius: 2
          }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: getStatsCardColor(stat.type) }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: '50%', 
                  backgroundColor: `${getStatsCardColor(stat.type)}20`,
                  color: getStatsCardColor(stat.type)
                }}>
                  {getStatsCardIcon(stat.type)}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Filters and Actions */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
          {/* Filter Buttons */}
          <ButtonGroup size="small" sx={{ alignSelf: 'flex-start' }}>
            <Button
              variant={filter === 'all' ? 'contained' : 'outlined'}
              onClick={() => setFilter('all')}
            >
              Tümü
            </Button>
            <Button
              variant={filter === 'unread' ? 'contained' : 'outlined'}
              onClick={() => setFilter('unread')}
            >
              Okunmamış
            </Button>
            <Button
              variant={filter === 'read' ? 'contained' : 'outlined'}
              onClick={() => setFilter('read')}
            >
              Okunmuş
            </Button>
          </ButtonGroup>

          {/* Filters Row */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Priority Filter */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Öncelik</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as NotificationPriority | 'all')}
                label="Öncelik"
              >
                <MenuItem value="all">Tümü</MenuItem>
                <MenuItem value={NotificationPriority.CRITICAL}>Kritik</MenuItem>
                <MenuItem value={NotificationPriority.IMPORTANT}>Önemli</MenuItem>
                <MenuItem value={NotificationPriority.NORMAL}>Normal</MenuItem>
              </Select>
            </FormControl>

            {/* Type Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Tip</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as NotificationType | 'all')}
                label="Tip"
              >
                <MenuItem value="all">Tümü</MenuItem>
                {Object.values(NotificationType).map(type => (
                  <MenuItem key={type} value={type}>
                    {getNotificationTypeDisplayName(type)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Search */}
            <TextField
              size="small"
              placeholder="Ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 200 }}
            />

            {/* Actions */}
            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
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
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Content */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && filteredNotifications.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <NotificationsOffIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
            Bildirim bulunamadı
          </Typography>
          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
            Seçilen filtrelere uygun bildirim bulunmuyor
          </Typography>
        </Paper>
      )}

      {!loading && !error && filteredNotifications.length > 0 && (
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <List sx={{ p: 0 }}>
            {filteredNotifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    py: 2,
                    px: 3,
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
                          variant="body1"
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
                            mb: 1
                          }}
                        >
                          {notification.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                            <Typography
                              variant="caption"
                              sx={{ color: '#94a3b8' }}
                            >
                              {notificationsService.formatTimeAgo(notification.createdAt)}
                            </Typography>
                          </Box>
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
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                    {!notification.isRead && (
                      <Tooltip title="Okundu olarak işaretle">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          <CheckCircleIcon sx={{ color: '#10b981' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    
                    {!notification.isRead && (
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6'
                        }}
                      />
                    )}
                  </Box>
                </ListItem>
                
                {index < filteredNotifications.length - 1 && (
                  <Divider variant="inset" component="li" />
                )}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Box>
  );
};

export default Notifications; 
import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';

import {
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  LocalOffer as LocalOfferIcon,
  ShoppingCart as ShoppingCartIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { dealersService } from '../services/dealers';
import { productsService } from '../services/products';
import { offersService } from '../services/offers';
import { ordersService } from '../services/orders';
import { OrderStatusLabels } from '../types/order';

interface DashboardStats {
  totalDealers: number;
  totalProducts: number;
  totalOffers: number;
  totalOrders: number;
}

interface RecentActivity {
  id: string;
  type: 'dealer' | 'product' | 'offer' | 'order';
  title: string;
  subtitle: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalDealers: 0,
    totalProducts: 0,
    totalOffers: 0,
    totalOrders: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Paralel olarak tüm verileri yükle
        const [dealers, products, offers, orders] = await Promise.all([
          dealersService.getDealers(),
          productsService.getAll(),
          offersService.getAll(),
          ordersService.getAll()
        ]);

        setStats({
          totalDealers: dealers.length,
          totalProducts: products.length,
          totalOffers: offers.length,
          totalOrders: orders.length
        });

        // Son aktiviteleri oluştur
        const activities: RecentActivity[] = [
          ...dealers.slice(0, 3).map(dealer => ({
            id: `dealer-${dealer.id}`,
            type: 'dealer' as const,
            title: dealer.name,
            subtitle: `Yeni bayi eklendi`,
            timestamp: dealer.createdAt || new Date().toISOString()
          })),
          ...offers.slice(0, 3).map(offer => ({
            id: `offer-${offer.id}`,
            type: 'offer' as const,
            title: `Teklif #${offer.id}`,
            subtitle: `${offer.items?.length || 0} ürün`,
            timestamp: offer.createdAt || new Date().toISOString()
          })),
          ...orders.slice(0, 3).map(order => ({
            id: `order-${order.id}`,
            type: 'order' as const,
            title: `Sipariş #${order.id}`,
            subtitle: OrderStatusLabels[order.status] || order.status,
            timestamp: order.createdAt || new Date().toISOString()
          }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 6);

        setRecentActivities(activities);
      } catch (err) {
        setError('Dashboard verileri yüklenemedi');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'dealer': return <BusinessIcon />;
      case 'product': return <InventoryIcon />;
      case 'offer': return <LocalOfferIcon />;
      case 'order': return <ShoppingCartIcon />;
      default: return <VisibilityIcon />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'dealer': return '#10b981';
      case 'product': return '#64748b';
      case 'offer': return '#f97316';
      case 'order': return '#1e3a8a';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sistem genelinde özet bilgiler ve son aktiviteler
        </Typography>
      </Box>

      {/* İstatistik Kartları */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="white" fontWeight={700}>
                  {stats.totalDealers}
                </Typography>
                <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                  Toplam Bayi
                </Typography>
              </Box>
              <BusinessIcon sx={{ color: 'white', fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="white" fontWeight={700}>
                  {stats.totalProducts}
                </Typography>
                <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                  Toplam Ürün
                </Typography>
              </Box>
              <InventoryIcon sx={{ color: 'white', fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="white" fontWeight={700}>
                  {stats.totalOffers}
                </Typography>
                <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                  Toplam Teklif
                </Typography>
              </Box>
              <LocalOfferIcon sx={{ color: 'white', fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" color="white" fontWeight={700}>
                  {stats.totalOrders}
                </Typography>
                <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                  Toplam Sipariş
                </Typography>
              </Box>
              <ShoppingCartIcon sx={{ color: 'white', fontSize: 40, opacity: 0.8 }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Alt Bölüm */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
        {/* Son Aktiviteler */}
        <Paper sx={{ p: 3, height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Son Aktiviteler
            </Typography>
            <Chip 
              icon={<TrendingUpIcon />} 
              label={`${recentActivities.length} aktivite`} 
              size="small" 
              color="primary" 
            />
          </Box>
          <List>
            {recentActivities.map((activity, index) => (
              <ListItem 
                key={activity.id}
                sx={{ 
                  borderBottom: index < recentActivities.length - 1 ? '1px solid #e5e7eb' : 'none',
                  py: 1.5
                }}
              >
                <ListItemIcon sx={{ color: getActivityColor(activity.type) }}>
                  {getActivityIcon(activity.type)}
                </ListItemIcon>
                <ListItemText
                  primary={activity.title}
                  secondary={activity.subtitle}
                  primaryTypographyProps={{ fontWeight: 600 }}
                  secondaryTypographyProps={{ color: 'text.secondary' }}
                />
                <Typography variant="caption" color="text.secondary">
                  {new Date(activity.timestamp).toLocaleDateString('tr-TR')}
                </Typography>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Hızlı Aksiyonlar */}
        <Paper sx={{ p: 3, height: '100%' }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Hızlı Aksiyonlar
          </Typography>
          <Stack spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/dealers?modal=add')}
              sx={{ 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }
              }}
            >
              Yeni Bayi Ekle
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/offers?modal=add')}
              sx={{ 
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #ea580c 0%, #dc2626 100%)' }
              }}
            >
              Yeni Teklif Oluştur
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/products?modal=add')}
              sx={{ 
                background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                '&:hover': { background: 'linear-gradient(135deg, #475569 0%, #374151 100%)' }
              }}
            >
              Yeni Ürün Ekle
            </Button>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => navigate('/orders')}
              sx={{ borderColor: '#1e3a8a', color: '#1e3a8a' }}
            >
              Tüm Siparişleri Gör
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard; 
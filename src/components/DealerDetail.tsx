import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { dealersService } from '../services/dealers';
import { Dealer } from '../types/dealer';

interface DealerStats {
  totalProducts: number;
  totalBrands: number;
  totalQuotes: number;
  pendingFactoryAssignments: number;
}

const DealerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState<Dealer | null>(null);
  const [stats, setStats] = useState<DealerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDealerData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Dealer bilgilerini yükle
        const dealerData = await dealersService.getDealerById(parseInt(id));
        setDealer(dealerData);
        
        // Dealer istatistiklerini yükle
        const statsData = await dealersService.getDealerStats(parseInt(id));
        setStats(statsData);
        
      } catch (err) {
        console.error('Error loading dealer data:', err);
        setError('Bayi bilgileri yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    loadDealerData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={40} sx={{ color: '#10b981' }} />
      </Box>
    );
  }

  if (error || !dealer) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Bayi bulunamadı'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dealers')}
          variant="outlined"
        >
          Bayilere Dön
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      pl: { xs: 2, sm: 3, md: 3 },
      pr: { xs: 2, sm: 3, md: 3 },
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      minHeight: '100vh',
      backgroundColor: 'transparent'
    }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dealers')}
          sx={{ mb: 2, color: '#6b7280' }}
        >
          Bayilere Dön
        </Button>
        
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
          {dealer.name}
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Bayi Detayları ve İstatistikler
        </Typography>
      </Box>

      {/* Dealer Info Card */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid #e5e7eb' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: '#10b98120', 
                color: '#10b981',
                fontSize: '2rem',
                fontWeight: 600
              }}
            >
              <BusinessIcon sx={{ fontSize: 40 }} />
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
                {dealer.name}
              </Typography>
              
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                  <Typography variant="body2" sx={{ color: '#374151' }}>
                    {dealer.address || 'Adres bilgisi yok'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                  <Typography variant="body2" sx={{ color: '#374151' }}>
                    {dealer.phoneNumber || 'Telefon bilgisi yok'}
                  </Typography>
                </Box>
                
                {dealer.taxNumber && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BusinessIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                    <Typography variant="body2" sx={{ color: '#374151' }}>
                      Vergi No: {dealer.taxNumber}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Admin Info */}
          {dealer.admin && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
                Bayi Yöneticisi
              </Typography>
              
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#374151' }}>
                    {dealer.admin.name || 'İsim bilgisi yok'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                  <Typography variant="body2" sx={{ color: '#374151' }}>
                    {dealer.admin.email || 'E-posta bilgisi yok'}
                  </Typography>
                </Box>
                
                {dealer.admin.phoneNumber && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                    <Typography variant="body2" sx={{ color: '#374151' }}>
                      {dealer.admin.phoneNumber}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        {/* Toplam Ürün */}
        <Card sx={{ flex: '1 1 250px', background: 'linear-gradient(135deg, #3b82f615 0%, #3b82f608 100%)', border: '1px solid #3b82f620' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                  {stats?.totalProducts || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Toplam Ürün
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#3b82f620', color: '#3b82f6' }}>
                <InventoryIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        {/* Toplam Marka */}
        <Card sx={{ flex: '1 1 250px', background: 'linear-gradient(135deg, #10b98115 0%, #10b98108 100%)', border: '1px solid #10b98120' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                  {stats?.totalBrands || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Toplam Marka
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#10b98120', color: '#10b981' }}>
                <CategoryIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        {/* Toplam Teklif */}
        <Card sx={{ flex: '1 1 250px', background: 'linear-gradient(135deg, #f59e0b15 0%, #f59e0b08 100%)', border: '1px solid #f59e0b20' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                  {stats?.totalQuotes || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Toplam Teklif
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#f59e0b20', color: '#f59e0b' }}>
                <MoneyIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        {/* Fabrika Atama Bekleyen */}
        <Card sx={{ flex: '1 1 250px', background: 'linear-gradient(135deg, #ef444415 0%, #ef444408 100%)', border: '1px solid #ef444420' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444' }}>
                  {stats?.pendingFactoryAssignments || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Fabrika Atama Bekleyen
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#ef444420', color: '#ef4444' }}>
                <AssignmentIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Status Indicators */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {stats && stats.pendingFactoryAssignments > 0 && (
          <Chip
            label={`${stats.pendingFactoryAssignments} sipariş fabrika ataması bekliyor`}
            color="warning"
            icon={<AssignmentIcon />}
            sx={{ fontWeight: 600 }}
          />
        )}
        
        {stats && stats.totalQuotes > 0 && (
          <Chip
            label={`${stats.totalQuotes} teklif oluşturulmuş`}
            color="success"
            icon={<MoneyIcon />}
            sx={{ fontWeight: 600 }}
          />
        )}
      </Box>
    </Box>
  );
};

export default DealerDetail; 
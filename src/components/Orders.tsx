import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Fab,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  ShoppingBag as ShoppingBagIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  Factory as FactoryIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CloudUpload as CloudUploadIcon,
  PlayArrow as PlayArrowIcon,
  Inventory as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { ordersService } from '../services/orders';
import { factoriesService } from '../services/factories';
import { imageService } from '../services/images';
import { Order, OrderStatus, OrderStatusLabels, OrderStatusColors } from '../types/order';
import { Factory } from '../types/factory';
import { ConfirmationDialog } from './ConfirmationDialog';
import { toast } from 'react-toastify';
import { brandsService } from '../services/brands';
import { authService } from '../services/auth';
import { useDealer } from '../contexts/DealerContext';

const Orders = () => {
  const { selectedDealer } = useDealer();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  

  
  // Factory assignment modal states
  const [assignFactoryModalOpen, setAssignFactoryModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedFactoryId, setSelectedFactoryId] = useState<number | ''>('');
  const [deadline, setDeadline] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [assigningFactory, setAssigningFactory] = useState(false);
  const [brandLogoUploading, setBrandLogoUploading] = useState(false);
  const [brandLogoPreview, setBrandLogoPreview] = useState<string | null>(null);

  // Logo önizlemesi güncelle
  useEffect(() => {
    if (selectedOrder?.brand?.logoUrl) {
      setBrandLogoPreview(selectedOrder.brand.logoUrl);
    } else {
      setBrandLogoPreview(null);
    }
  }, [selectedOrder]);

  const handleBrandLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedOrder?.brand?.id) return;
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      toast.error('Sadece PNG veya JPG dosyası yükleyebilirsiniz.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo en fazla 2MB olmalı.');
      return;
    }
    setBrandLogoUploading(true);
    try {
      await brandsService.uploadBrandLogo(selectedOrder.brand.id, file);
      // Logo yüklendikten sonra orders listesini güncelle
      await loadOrders();
      // Yeni logo önizlemesini göster
      const updatedOrder = orders.find(o => o.id === selectedOrder.id);
      setBrandLogoPreview(updatedOrder?.brand?.logoUrl || null);
      toast.success('Logo başarıyla yüklendi!');
    } catch (error) {
      toast.error('Logo yüklenirken hata oluştu.');
    } finally {
      setBrandLogoUploading(false);
    }
  };
  
  // View order modal states
  const [viewOrderModalOpen, setViewOrderModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  
  // Complete/Cancel order states
  const [completingOrder, setCompletingOrder] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  // Image upload states
  const [selectedImages, setSelectedImages] = useState<Array<{ id: string; file: File; objectUrl: string }>>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<Array<{ id: string; url: string }>>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // URL.createObjectURL memory leak'ini önle
  useEffect(() => {
    return () => {
      // Component unmount olduğunda tüm object URL'leri temizle
      selectedImages.forEach(img => {
        URL.revokeObjectURL(img.objectUrl);
      });
    };
  }, [selectedImages]);

  // Modal kapandığında object URL'leri temizle
  useEffect(() => {
    if (!assignFactoryModalOpen) {
      // Modal kapandığında tüm object URL'leri temizle
      selectedImages.forEach(img => {
        URL.revokeObjectURL(img.objectUrl);
      });
    }
  }, [assignFactoryModalOpen, selectedImages]);

  useEffect(() => {
    loadOrders();
    loadFactories();
  }, [selectedDealer]);

  const loadFactories = async () => {
    try {
      const data = await factoriesService.getAllFactories();
      setFactories(data);
    } catch (error) {
      console.error('Error loading factories:', error);
    }
  };

  // FACTORY_USER için geçici olarak tüm siparişler (backend endpoint hazır olunca değişecek)
  const userRole = authService.getUserRole();
  const filteredOrders = orders;

  const loadOrders = async () => {
    try {
      const userRole = authService.getUserRole();
      
      let data: Order[];
      if (userRole === 'DEALER_ADMIN') {
        // DEALER_ADMIN için sadece kendi bayisinin siparişlerini getir
        data = await ordersService.getDealerOrders();
      } else if (userRole === 'FACTORY_USER') {
        // FACTORY_USER için sadece kendi fabrikasına atanmış siparişleri getir
        // JWT'den factoryId otomatik olarak backend'de alınır
        data = await ordersService.getFactoryOrders();
      } else if (userRole === 'SUPER_ADMIN' && selectedDealer) {
        // SUPER_ADMIN için seçili dealer'ın siparişlerini getir
        data = await ordersService.getDealerOrders(selectedDealer.id);
      } else {
        // SUPER_ADMIN için tüm siparişleri getir (dealer seçilmemişse)
        data = await ordersService.getAll();
      }
      
      setOrders(data);
      setError(null);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };



  const handleView = (order: Order) => {
    setViewOrder(order);
    setViewOrderModalOpen(true);
  };

  const handleAssignFactory = (order: Order) => {
    setSelectedOrder(order);
    setSelectedFactoryId('');
    setDeadline('');
    setDescription('');
    
    // Object URL'leri temizle
    selectedImages.forEach(img => {
      URL.revokeObjectURL(img.objectUrl);
    });
    
    setSelectedImages([]);
    setUploadedImageUrls([]);
    setAssignFactoryModalOpen(true);
  };

  const confirmAssignFactory = async () => {
    if (!selectedOrder || !selectedFactoryId || !deadline) return;
    
    setAssigningFactory(true);
    try {
      await ordersService.assignFactory(
        selectedOrder.id.toString(), 
        selectedFactoryId as number, 
        deadline,
        description.trim() || undefined,
        uploadedImageUrls.length > 0 ? uploadedImageUrls.map(img => img.url) : undefined
      );
      
      // Reload orders to get updated data
      await loadOrders();
      
      // Close modal and reset state
      setAssignFactoryModalOpen(false);
      setSelectedOrder(null);
      setSelectedFactoryId('');
      setDeadline('');
      setDescription('');
      
      // Object URL'leri temizle
      selectedImages.forEach(img => {
        URL.revokeObjectURL(img.objectUrl);
      });
      
      setSelectedImages([]);
      setUploadedImageUrls([]);
      setError(null);
      
      // Show success toast
      toast.success('Fabrika başarıyla atandı! Lütfen fabrikayı aramayı unutmayın.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
    } catch (error) {
      console.error('Error assigning factory:', error);
      setError('Fabrika atanırken bir hata oluştu');
    } finally {
      setAssigningFactory(false);
    }
  };

  const handleCompleteOrder = async (orderId: number) => {
    setCompletingOrder(true);
    try {
      await ordersService.complete(orderId.toString());
      await loadOrders();
      setError(null);
      
      toast.success('Sipariş başarıyla tamamlandı!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
    } catch (error) {
      console.error('Error completing order:', error);
      setError('Sipariş tamamlanırken bir hata oluştu');
    } finally {
      setCompletingOrder(false);
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    setCancellingOrder(true);
    try {
      await ordersService.updateStatus(orderId, OrderStatus.CANCELLED);
      await loadOrders();
      setError(null);
      
      toast.success('Sipariş başarıyla iptal edildi!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
    } catch (error) {
      console.error('Error cancelling order:', error);
      setError('Sipariş iptal edilirken bir hata oluştu');
    } finally {
      setCancellingOrder(false);
    }
  };

  // FACTORY_USER için sipariş durumu güncelleme
  const handleUpdateOrderStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await ordersService.updateStatus(orderId, newStatus);
      toast.success('Sipariş durumu başarıyla güncellendi');
      loadOrders();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      
      // Daha detaylı hata mesajı
      let errorMessage = 'Sipariş durumu güncellenirken hata oluştu';
      if (error.response?.status === 500) {
        errorMessage = 'Backend sunucu hatası. Lütfen daha sonra tekrar deneyin.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bu işlem için yetkiniz bulunmuyor.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Sipariş bulunamadı.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    return OrderStatusColors[status] || '#6b7280';
  };

  const getStatusText = (status: OrderStatus) => {
    return OrderStatusLabels[status] || status;
  };

  // Statistics Cards Data
  const statsData = [
    {
      title: 'Toplam Sipariş',
      value: orders.length,
      icon: <ShoppingBagIcon />,
      color: '#10b981',
      trend: '+12%'
    },
    {
      title: 'Bekleyen Siparişler',
      value: orders.filter(o => o.status === 'PENDING').length,
      icon: <ScheduleIcon />,
      color: '#f97316',
      trend: '+8%'
    },
    {
      title: 'Hazırlanıyor',
      value: orders.filter(o => o.status === OrderStatus.IN_PRODUCTION).length,
      icon: <TrendingUpIcon />,
      color: '#3b82f6',
      trend: '+10%'
    },
    {
      title: 'Depoda',
      value: orders.filter(o => o.status === OrderStatus.IN_WAREHOUSE).length,
      icon: <TrendingUpIcon />,
      color: '#8b5cf6',
      trend: '+7%'
    },
    {
      title: 'Yolda',
      value: orders.filter(o => o.status === OrderStatus.IN_TRANSIT).length,
      icon: <TrendingUpIcon />,
      color: '#f59e0b',
      trend: '+12%'
    },
    {
      title: 'Teslim Edildi',
      value: orders.filter(o => o.status === OrderStatus.DELIVERED).length,
      icon: <TrendingUpIcon />,
      color: '#10b981',
      trend: '+15%'
    },
    {
      title: 'İptal Edildi',
      value: orders.filter(o => o.status === OrderStatus.CANCELLED).length,
      icon: <CancelIcon />,
      color: '#ef4444',
      trend: '-5%'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={40} sx={{ color: '#10b981' }} />
        </Box>
      </Box>
    );
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: Array<{ id: string; file: File; objectUrl: string }> = [];
    
    // Dosya boyutu kontrolü
    files.forEach(file => {
      if (file.size <= 5 * 1024 * 1024) { // 5MB limit
        const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const objectUrl = URL.createObjectURL(file);
        validFiles.push({ id: uniqueId, file: file, objectUrl: objectUrl });
      } else {
        toast.error(`${file.name} - Görsel boyutu 5MB'den büyük olamaz.`);
      }
    });
    
    if (validFiles.length === 0) return;
    
    // Yeni görselleri state'e ekle
    setSelectedImages(prev => [...prev, ...validFiles]);
    
    // Otomatik upload başlat
    setUploadingImages(true);
    try {
      const urls = await imageService.uploadMultipleImages(validFiles.map(f => f.file));
      
      // URL'leri ID'ler ile eşleştir
      const newUploadedUrls = validFiles.map((fileData, index) => ({
        id: fileData.id,
        url: urls[index]
      }));
      
      setUploadedImageUrls(prev => [...prev, ...newUploadedUrls]);
      toast.success(`${validFiles.length} görsel başarıyla yüklendi!`);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Görseller yüklenirken hata oluştu');
      
      // Hata durumunda yüklenemeyen görselleri state'den kaldır ve object URL'leri temizle
      validFiles.forEach(fileData => {
        URL.revokeObjectURL(fileData.objectUrl);
      });
      setSelectedImages(prev => prev.filter(img => !validFiles.some(vf => vf.id === img.id)));
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (idToRemove: string) => {
    // Kaldırılacak image'ı bul
    const imageToRemove = selectedImages.find(img => img.id === idToRemove);
    
    // Object URL'yi temizle
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.objectUrl);
    }
    
    // Dosyayı kaldır
    setSelectedImages(prev => {
      const newImages = prev.filter(img => img.id !== idToRemove);
      return newImages;
    });
    
    // URL'leri de kaldır
    setUploadedImageUrls(prev => {
      const newUrls = prev.filter(img => img.id !== idToRemove);
      return newUrls;
    });
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      pl: { xs: 2, sm: 3, md: 3 }, // Sidebar'a göre ayarlanmış sol padding
      pr: { xs: 2, sm: 3, md: 3 },
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      minHeight: '100vh',
      backgroundColor: 'transparent'
    }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
          Sipariş Yönetimi
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Siparişlerinizi yönetin, düzenleyin ve takip edin
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          lg: 'repeat(3, 1fr)' 
        },
        gap: 3, 
        mb: 4 
      }}>
        {statsData.map((stat, index) => (
          <Box key={index}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Chip 
                      label={stat.trend} 
                      size="small" 
                      sx={{ 
                        backgroundColor: `${stat.color}20`,
                        color: stat.color,
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }} 
                    />
                  </Box>
                  <Avatar 
                    sx={{ 
                      backgroundColor: `${stat.color}20`,
                      color: stat.color,
                      width: 56,
                      height: 56
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Action Bar */}
      <Card sx={{ mb: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}>
            <TextField
              placeholder="Sipariş ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#6b7280' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: '#f9fafb',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e5e7eb',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10b981',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10b981',
                    borderWidth: '2px',
                  },
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Table */}
      <Card sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
        <Table>
          <TableHead>
              <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Sipariş & Müşteri
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Durum
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Oluşturulma Tarihi
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Toplam Fiyat
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  İşlemler
                </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              {filteredOrders.length === 0 ? (
              <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <ShoppingBagIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                        {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz sipariş eklenmemiş'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        {searchTerm ? 'Farklı arama terimleri deneyin' : 'Henüz sipariş bulunmuyor'}
                      </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
                filteredOrders.map((order, index) => (
                  <TableRow 
                    key={order.id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f9fafb' },
                      borderBottom: index === filteredOrders.length - 1 ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          src={order.brand?.logoUrl}
                          sx={{ 
                            backgroundColor: '#10b98120',
                            color: '#10b981',
                            width: 40,
                            height: 40,
                            fontWeight: 600
                          }}
                        >
                          {order.brand?.name?.charAt(0).toUpperCase() || '#'}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                            {order.brand?.name || 'Bilinmeyen Müşteri'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Sipariş #{order.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip 
                        label={getStatusText(order.status)} 
                        size="small" 
                        sx={{ 
                          backgroundColor: `${getStatusColor(order.status)}20`,
                          color: getStatusColor(order.status),
                          fontWeight: 600,
                          borderRadius: 2
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {new Date(order.createdAt).toLocaleTimeString('tr-TR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600 }}>
                        ₺{order.totalPrice?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Görüntüle">
                          <IconButton 
                            size="small"
                            onClick={() => handleView(order)}
                            sx={{ 
                              color: '#6b7280',
                              '&:hover': { backgroundColor: '#f3f4f6', color: '#374151' }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {/* Siparişi Tamamla - sadece FACTORY_USER ve fabrika ataması yapılmış durumlarda */}
                        {userRole === 'FACTORY_USER' && (
                          order.status === OrderStatus.IN_PRODUCTION ||
                          order.status === OrderStatus.IN_WAREHOUSE ||
                          order.status === OrderStatus.IN_TRANSIT
                        ) && (
                          <Tooltip title="Siparişi Tamamla">
                            <IconButton 
                              size="small"
                              onClick={() => handleCompleteOrder(order.id)}
                              disabled={completingOrder}
                              sx={{ 
                                color: '#10b981',
                                '&:hover': { backgroundColor: '#f0fdf4', color: '#059669' }
                              }}
                            >
                              {completingOrder ? (
                                <CircularProgress size={16} sx={{ color: '#10b981' }} />
                              ) : (
                                <CheckCircleIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {/* Fabrika Ata - sadece SUPER_ADMIN ve PENDING durumunda */}
                        {authService.canAssignFactory() && order.status === OrderStatus.PENDING && (
                          <Tooltip title="Fabrika Ata">
                            <IconButton 
                              size="small"
                              onClick={() => handleAssignFactory(order)}
                              sx={{ 
                                color: '#8b5cf6',
                                '&:hover': { backgroundColor: '#f3f4f6', color: '#7c3aed' }
                              }}
                            >
                              <FactoryIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        
                        {/* İptal Et - sadece PENDING durumunda */}
                        {order.status === OrderStatus.PENDING && (
                          <Tooltip title="İptal Et">
                            <IconButton 
                              size="small"
                              onClick={() => handleCancelOrder(order.id)}
                              disabled={cancellingOrder}
                              sx={{ 
                                color: '#ef4444',
                                '&:hover': { backgroundColor: '#fef2f2', color: '#dc2626' }
                              }}
                            >
                              {cancellingOrder ? (
                                <CircularProgress size={16} sx={{ color: '#ef4444' }} />
                              ) : (
                                <CancelIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      </Card>





      {/* Factory Assignment Modal */}
      <Dialog 
        open={assignFactoryModalOpen} 
        onClose={() => {
          // Object URL'leri temizle
          selectedImages.forEach(img => {
            URL.revokeObjectURL(img.objectUrl);
          });
          
          setAssignFactoryModalOpen(false);
          setDescription('');
          setSelectedImages([]); // Clear selected images on close
          setUploadedImageUrls([]); // Clear uploaded URLs on close
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          fontSize: '1.5rem',
          color: '#1f2937',
          borderBottom: '1px solid #e5e7eb',
          pb: 2 
        }}>
          Fabrika Ata
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedOrder && (
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={brandLogoPreview || undefined}
                sx={{ width: 56, height: 56, backgroundColor: '#10b98120', color: '#10b981', fontWeight: 600, fontSize: '1.5rem' }}
              >
                {!brandLogoPreview && selectedOrder.brand?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 0.5 }}>
                  {selectedOrder.brand?.name || 'Bilinmeyen Müşteri'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Müşteri ID: #{selectedOrder.brand?.id}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<CloudUploadIcon />}
                sx={{ ml: 2, fontWeight: 500, borderRadius: 2, textTransform: 'none' }}
                disabled={brandLogoUploading}
              >
                {brandLogoUploading ? 'Yükleniyor...' : (brandLogoPreview ? 'Logoyu Değiştir' : 'Logo Yükle')}
                <input type="file" accept="image/png, image/jpeg" hidden onChange={handleBrandLogoChange} />
              </Button>
            </Box>
          )}
          {selectedOrder && !brandLogoPreview && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
              Bu müşterinin logosu yok. Fabrika ataması yapabilmek için önce logo yüklemelisiniz.
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Fabrika Seçin</InputLabel>
              <Select
                value={selectedFactoryId}
                onChange={(e) => setSelectedFactoryId(e.target.value as number)}
                label="Fabrika Seçin"
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e5e7eb',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8b5cf6',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8b5cf6',
                    borderWidth: '2px',
                  },
                }}
              >
                {factories.filter(f => f.active).map((factory) => (
                  <MenuItem key={factory.id} value={factory.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          backgroundColor: '#8b5cf620',
                          color: '#8b5cf6',
                          width: 32,
                          height: 32,
                          fontSize: '0.875rem'
                        }}
                      >
                        {factory.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {factory.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                          {factory.address}
          </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Teslim edilmesi gereken tarih"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#e5e7eb',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8b5cf6',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8b5cf6',
                    borderWidth: '2px',
                  },
                },
              }}
            />

            {/* Modern Description Field */}
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Fabrikaya Özel Talimatlar"
                placeholder="Üretime dair özel notlar, renk tercihleri, kalite standartları veya dikkat edilmesi gereken hususları buraya yazabilirsiniz..."
                value={description}
                onChange={(e) => {
                  if (e.target.value.length <= 1000) {
                    setDescription(e.target.value);
                  }
                }}
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: '#fafbfc',
                    transition: 'all 0.2s ease-in-out',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e1e5e9',
                      borderWidth: '1.5px',
                    },
                    '&:hover': {
                      backgroundColor: '#f8f9fa',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#8b5cf6',
                        borderWidth: '2px',
                      },
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(139, 92, 246, 0.15)',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#8b5cf6',
                        borderWidth: '2px',
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: '#6b7280',
                    fontWeight: 500,
                    '&.Mui-focused': {
                      color: '#8b5cf6',
                    },
                  },
                  '& .MuiInputBase-input': {
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    '&::placeholder': {
                      color: '#9ca3af',
                      opacity: 1,
                    },
                  },
                }}
              />
              
              {/* Character Counter */}
              <Box sx={{ 
                position: 'absolute', 
                bottom: 8, 
                right: 12, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 1,
                px: 1,
                py: 0.5
              }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: description.length > 500 ? '#ef4444' : '#6b7280',
                    fontWeight: 500,
                    fontSize: '0.75rem'
                  }}
                >
                  {description.length}/1000
                </Typography>
              </Box>
            </Box>

            {/* Image Upload Field */}
            <Box>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 1, fontWeight: 500 }}>
                Üretim Görselleri (Opsiyonel)
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ca3af', mb: 2, display: 'block' }}>
                Ürün çizimleri, referans görselleri, renk örnekleri gibi fabrikaya yardımcı olacak görselleri ekleyebilirsiniz
              </Typography>
              
              <Box
                sx={{
                  border: `2px dashed ${selectedImages.length > 0 ? '#10b981' : '#d1d5db'}`,
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: selectedImages.length > 0 ? '#f0fdf4' : '#f9fafb',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: '#8b5cf6',
                    backgroundColor: selectedImages.length > 0 ? '#f0fdf4' : '#f8fafc',
                  }
                }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                  id="image-upload"
                />
                <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                    <CloudUploadIcon sx={{ fontSize: 32, color: selectedImages.length > 0 ? '#10b981' : '#6b7280' }} />
                    <Typography variant="body2" sx={{ color: selectedImages.length > 0 ? '#10b981' : '#6b7280', fontWeight: 500 }}>
                      {selectedImages.length > 0 ? `${selectedImages.length} görsel seçildi` : 'Görsel Seç veya Sürükle'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                      PNG, JPG (max 5MB her görsel)
                    </Typography>
                  </Box>
                </label>
              </Box>

              {/* Selected Images Preview */}
              {selectedImages.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1, fontWeight: 500 }}>
                    Seçilen Görseller:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedImages.map((imageData) => {
                      const isUploaded = uploadedImageUrls.some(uploaded => uploaded.id === imageData.id);
                      const uploadedData = uploadedImageUrls.find(uploaded => uploaded.id === imageData.id);
                      
                      return (
                        <Box
                          key={imageData.id}
                          sx={{
                            position: 'relative',
                            width: 80,
                            height: 80,
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '2px solid #e5e7eb'
                          }}
                        >
                          <img
                            src={imageData.objectUrl}
                            alt={`Görsel ${imageData.file.name}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeImage(imageData.id)}
                            sx={{
                              position: 'absolute',
                              top: 2,
                              right: 2,
                              backgroundColor: 'rgba(0, 0, 0, 0.7)',
                              color: 'white',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                              }
                            }}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                          
                          {/* Upload Status Indicator */}
                          {isUploaded ? (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 2,
                                left: 2,
                                backgroundColor: '#10b981',
                                borderRadius: '50%',
                                width: 20,
                                height: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <CheckCircleIcon sx={{ color: 'white', fontSize: 14 }} />
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 2,
                                left: 2,
                                backgroundColor: '#f59e0b',
                                borderRadius: '50%',
                                width: 20,
                                height: 20,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <CircularProgress size={14} sx={{ color: 'white' }} />
                            </Box>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                  
                  {/* Upload Status Summary */}
                  {uploadedImageUrls.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ color: '#10b981', fontWeight: 500 }}>
                        {uploadedImageUrls.length} görsel yüklendi
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Uploading Status */}
                  {uploadingImages && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" sx={{ color: '#f59e0b', fontWeight: 500 }}>
                        Görseller yükleniyor...
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
          <Button 
            onClick={() => {
              // Object URL'leri temizle
              selectedImages.forEach(img => {
                URL.revokeObjectURL(img.objectUrl);
              });
              
              setAssignFactoryModalOpen(false);
              setDescription('');
              setSelectedImages([]); // Clear selected images on cancel
              setUploadedImageUrls([]); // Clear uploaded URLs on cancel
            }}
            sx={{ 
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#f3f4f6',
              }
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={confirmAssignFactory}
            disabled={!selectedFactoryId || !deadline || assigningFactory || !brandLogoPreview}
            variant="contained"
            sx={{
              backgroundColor: '#8b5cf6',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              '&:hover': {
                backgroundColor: '#7c3aed',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(139, 92, 246, 0.4)',
              },
              '&:disabled': {
                backgroundColor: '#d1d5db',
                color: '#9ca3af',
              }
            }}
          >
            {assigningFactory ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} sx={{ color: 'inherit' }} />
                Atanıyor...
              </Box>
            ) : (
              'Fabrika Ata'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Order Modal */}
      <Dialog 
        open={viewOrderModalOpen} 
        onClose={() => setViewOrderModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          fontSize: '1.5rem',
          color: '#1f2937',
          borderBottom: '1px solid #e5e7eb',
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Avatar 
            sx={{ 
              backgroundColor: userRole === 'FACTORY_USER' ? '#8b5cf620' : '#10b98120',
              color: userRole === 'FACTORY_USER' ? '#8b5cf6' : '#10b981',
              width: 40,
              height: 40,
              fontWeight: 600
            }}
          >
            {userRole === 'FACTORY_USER' ? <FactoryIcon /> : <ShoppingBagIcon />}
          </Avatar>
          {userRole === 'FACTORY_USER' ? 'Üretim Takibi' : 'Sipariş Detayları'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {viewOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* FACTORY_USER için özel progress bar */}
              {userRole === 'FACTORY_USER' && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
                    Üretim Süreci
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {Object.values(OrderStatus).map((status, index) => (
                      <React.Fragment key={status}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          flex: 1
                        }}>
                          <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: viewOrder.status === status 
                              ? getStatusColor(status) 
                              : Object.values(OrderStatus).indexOf(viewOrder.status) > index 
                                ? getStatusColor(status) 
                                : '#e5e7eb',
                            color: viewOrder.status === status 
                              ? 'white' 
                              : Object.values(OrderStatus).indexOf(viewOrder.status) > index 
                                ? 'white' 
                                : '#9ca3af',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            border: viewOrder.status === status ? `3px solid ${getStatusColor(status)}` : 'none'
                          }}>
                            {index + 1}
                          </Box>
                          <Typography variant="caption" sx={{ 
                            mt: 0.5, 
                            textAlign: 'center',
                            color: viewOrder.status === status 
                              ? getStatusColor(status) 
                              : Object.values(OrderStatus).indexOf(viewOrder.status) > index 
                                ? getStatusColor(status) 
                                : '#9ca3af',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}>
                            {OrderStatusLabels[status]}
                          </Typography>
                        </Box>
                        {index < Object.values(OrderStatus).length - 1 && (
                          <Box sx={{
                            flex: 1,
                            height: 2,
                            backgroundColor: Object.values(OrderStatus).indexOf(viewOrder.status) > index 
                              ? getStatusColor(Object.values(OrderStatus)[index + 1]) 
                              : '#e5e7eb',
                            borderRadius: 1
                          }} />
                        )}
                      </React.Fragment>
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ 
                    color: '#6b7280', 
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}>
                    Mevcut Durum: <strong style={{ color: getStatusColor(viewOrder.status) }}>
                      {OrderStatusLabels[viewOrder.status]}
                    </strong>
                  </Typography>
                </Box>
              )}
              
              {/* Order Header */}
              <Box sx={{ p: 3, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Sol Taraf - Logo ve Müşteri Bilgileri */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {/* Brand Logo - Circle Frame */}
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      border: '3px solid #e5e7eb',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'white'
                    }}>
                      {viewOrder.brand?.logoUrl ? (
                        <img 
                          src={viewOrder.brand.logoUrl} 
                          alt={`${viewOrder.brand.name} logo`}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover'
                          }} 
                        />
                      ) : (
                        <Typography 
                          sx={{ 
                            color: '#10b981',
                            fontWeight: 700,
                            fontSize: '2rem'
                          }}
                        >
                          {viewOrder.brand?.name?.charAt(0).toUpperCase() || '#'}
                        </Typography>
                      )}
                    </Box>
                    
                    {/* Müşteri Bilgileri */}
                    <Box>
                      {/* Müşteri Adı - Ana Başlık */}
                      <Typography variant="h5" sx={{ fontWeight: 600, color: '#1f2937', mb: 2 }}>
                        {viewOrder.brand?.name || 'Bilinmeyen Müşteri'}
                      </Typography>
                      
                      {/* Telefon */}
                      {viewOrder.brand?.contactPhone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="body1" sx={{ color: '#6b7280', minWidth: 80 }}>📞 Telefon:</Typography>
                          <Typography variant="body1" sx={{ color: '#374151', fontWeight: 500 }}>
                            {viewOrder.brand.contactPhone}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  {/* Sağ Taraf - Status ve Teslim Tarihi */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                    {/* Status */}
                    <Chip 
                      label={getStatusText(viewOrder.status)} 
                      size="medium" 
                      sx={{ 
                        backgroundColor: `${getStatusColor(viewOrder.status)}20`,
                        color: getStatusColor(viewOrder.status),
                        fontWeight: 600,
                        borderRadius: 2
                      }} 
                    />
                    
                    {/* Teslim Tarihi */}
                    {viewOrder.deadline && (
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                          Teslim Tarihi:
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#374151', fontWeight: 500 }}>
                          {new Date(viewOrder.deadline).toLocaleDateString('tr-TR')}
                        </Typography>
                      </Box>
                    )}
                    
                    {/* Toplam Fiyat */}
                    {userRole !== 'FACTORY_USER' && (
                      <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600 }}>
                        ₺{viewOrder.totalPrice?.toFixed(2) || '0.00'}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Order Details */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                {/* Atanan Kullanıcı Bilgileri - Ayrı Section */}
                {viewOrder.brand?.assignedUser && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#10b981', mb: 2 }}>
                      Atanan Kullanıcı
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>Ad:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#10b981' }}>
                          {viewOrder.brand.assignedUser.name}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>E-posta:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                          {viewOrder.brand.assignedUser.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>Telefon:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                          {viewOrder.brand.assignedUser.phone}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Fabrika Bilgileri - Ayrı Section */}
                {viewOrder.factory && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#8b5cf6', mb: 2 }}>
                      Fabrika Bilgileri
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>Ad:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#8b5cf6' }}>
                          {viewOrder.factory.name}
                        </Typography>
                      </Box>
                      {viewOrder.factory.phone && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>Telefon:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                            {viewOrder.factory.phone}
                          </Typography>
                        </Box>
                      )}
                      {viewOrder.factory.address && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>Adres:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                            {viewOrder.factory.address}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Box>

              {/* Order Items */}
              {viewOrder.items && viewOrder.items.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
                    Sipariş Kalemleri ({viewOrder.items.length} adet)
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {viewOrder.items.map((item, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2, 
                          p: 2, 
                          backgroundColor: '#f9fafb', 
                          borderRadius: 2,
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            backgroundColor: '#3b82f620',
                            color: '#3b82f6',
                            width: 40,
                            height: 40,
                            fontWeight: 600
                          }}
                        >
                          {item.productName?.charAt(0).toUpperCase() || 'P'}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                            {item.productName || `Ürün #${item.productId}`}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              Miktar: {item.quantity} adet
                            </Typography>
                            {userRole !== 'FACTORY_USER' && (
                              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Birim Fiyat: ₺{item.unitPrice?.toFixed(2) || '0.00'}
                              </Typography>
                            )}
                          </Box>
                          {item.plannedDelivery && (
                            <Typography variant="body2" sx={{ color: '#8b5cf6', mt: 0.5 }}>
                              Planlanan Teslimat: {new Date(item.plannedDelivery).toLocaleDateString('tr-TR')}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          {userRole !== 'FACTORY_USER' && (
                            <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600 }}>
                              ₺{item.lineTotalWithTax?.toFixed(2) || item.lineTotal?.toFixed(2) || (item.quantity * (item.unitPrice || 0)).toFixed(2)}
                            </Typography>
                          )}
                          {item.taxRate && (
                            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mt: 0.5 }}>
                              KDV: %{item.taxRate}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {/* Description */}
              {viewOrder.description && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
                    Üretim Talimatları
                  </Typography>
                  <Box sx={{ 
                    p: 3, 
                    backgroundColor: '#f8fafc', 
                    borderRadius: 2,
                    border: '1px solid #e5e7eb'
                  }}>
                    <Typography variant="body1" sx={{ color: '#374151', lineHeight: 1.6 }}>
                      {viewOrder.description}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Image URLs */}
              {viewOrder.imageUrls && viewOrder.imageUrls.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
                    Üretim Görselleri ({viewOrder.imageUrls.length} adet)
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 2 
                  }}>
                    {viewOrder.imageUrls.map((imageUrl, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: 'relative',
                          width: 120,
                          height: 120,
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '2px solid #e5e7eb',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                          }
                        }}
                        onClick={() => window.open(imageUrl, '_blank')}
                      >
                        <img
                          src={imageUrl}
                          alt={`Üretim Görseli ${index + 1}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.3)',
                            opacity: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'opacity 0.2s ease-in-out',
                            '&:hover': {
                              opacity: 1,
                            }
                          }}
                        >
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'white', 
                              fontWeight: 600,
                              backgroundColor: 'rgba(0, 0, 0, 0.7)',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1
                            }}
                          >
                            Büyüt
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb', gap: 2 }}>
          <Button 
            onClick={() => setViewOrderModalOpen(false)}
            sx={{ 
              color: '#6b7280',
              fontWeight: 600,
              textTransform: 'none',
              px: 3,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#f3f4f6',
              }
            }}
          >
            Kapat
          </Button>
          {viewOrder && (
            <>
              {/* FACTORY_USER için özel durum güncelleme butonları */}
              {userRole === 'FACTORY_USER' ? (
                <>
                  {/* PENDING -> IN_PRODUCTION */}
                  {viewOrder.status === OrderStatus.PENDING && (
                    <Button 
                      onClick={() => {
                        setViewOrderModalOpen(false);
                        handleUpdateOrderStatus(viewOrder.id, OrderStatus.IN_PRODUCTION);
                      }}
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      sx={{
                        backgroundColor: '#3b82f6',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                        '&:hover': {
                          backgroundColor: '#2563eb',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 6px 16px rgba(59, 130, 246, 0.4)',
                        }
                      }}
                    >
                      Üretime Başla
                    </Button>
                  )}
                  
                  {/* IN_PRODUCTION -> IN_WAREHOUSE */}
                  {viewOrder.status === OrderStatus.IN_PRODUCTION && (
                    <Button 
                      onClick={() => {
                        setViewOrderModalOpen(false);
                        handleUpdateOrderStatus(viewOrder.id, OrderStatus.IN_WAREHOUSE);
                      }}
                      variant="contained"
                      startIcon={<InventoryIcon />}
                      sx={{
                        backgroundColor: '#8b5cf6',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                        '&:hover': {
                          backgroundColor: '#7c3aed',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 6px 16px rgba(139, 92, 246, 0.4)',
                        }
                      }}
                    >
                      Depoya Taşı
                    </Button>
                  )}
                  
                  {/* IN_WAREHOUSE -> IN_TRANSIT */}
                  {viewOrder.status === OrderStatus.IN_WAREHOUSE && (
                    <Button 
                      onClick={() => {
                        setViewOrderModalOpen(false);
                        handleUpdateOrderStatus(viewOrder.id, OrderStatus.IN_TRANSIT);
                      }}
                      variant="contained"
                      startIcon={<LocalShippingIcon />}
                      sx={{
                        backgroundColor: '#f59e0b',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                        '&:hover': {
                          backgroundColor: '#d97706',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 6px 16px rgba(245, 158, 11, 0.4)',
                        }
                      }}
                    >
                      Yola Çıkar
                    </Button>
                  )}
                  
                  {/* IN_TRANSIT -> DELIVERED */}
                  {viewOrder.status === OrderStatus.IN_TRANSIT && (
                    <Button 
                      onClick={() => {
                        setViewOrderModalOpen(false);
                        handleUpdateOrderStatus(viewOrder.id, OrderStatus.DELIVERED);
                      }}
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      sx={{
                        backgroundColor: '#10b981',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        '&:hover': {
                          backgroundColor: '#059669',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                        }
                      }}
                    >
                      Teslim Edildi
                    </Button>
                  )}
                  
                  {/* DELIVERED durumunda bilgi mesajı */}
                  {viewOrder.status === OrderStatus.DELIVERED && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      color: '#10b981',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}>
                      <CheckCircleIcon />
                      Sipariş Teslim Edildi
                    </Box>
                  )}
                </>
              ) : (
                <>
                  {/* Diğer roller için normal butonlar */}
                  {/* İptal Et butonu - sadece pending, in_progress, in_production durumlarında göster */}
                  {['pending', 'in_progress', 'in_production'].includes(viewOrder.status?.toLowerCase()) && (
                    <Button 
                      onClick={() => {
                        setViewOrderModalOpen(false);
                        handleCancelOrder(viewOrder.id);
                      }}
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      disabled={cancellingOrder}
                      sx={{
                        color: '#ef4444',
                        borderColor: '#ef4444',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        '&:hover': {
                          backgroundColor: '#fef2f2',
                          borderColor: '#dc2626',
                          color: '#dc2626',
                        },
                        '&:disabled': {
                          borderColor: '#d1d5db',
                          color: '#9ca3af',
                        }
                      }}
                    >
                      {cancellingOrder ? 'İptal Ediliyor...' : 'İptal Et'}
                    </Button>
                  )}
                  
                  {/* Tamamlandı butonu - sadece FACTORY_USER ve fabrika ataması yapılmış durumlarda göster */}
                  {userRole === 'FACTORY_USER' && (
                    viewOrder.status === OrderStatus.IN_PRODUCTION ||
                    viewOrder.status === OrderStatus.IN_WAREHOUSE ||
                    viewOrder.status === OrderStatus.IN_TRANSIT
                  ) && (
                    <Button 
                      onClick={() => {
                        setViewOrderModalOpen(false);
                        handleCompleteOrder(viewOrder.id);
                      }}
                      variant="contained"
                      startIcon={<CheckCircleIcon />}
                      disabled={completingOrder}
                      sx={{
                        backgroundColor: '#10b981',
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 3,
                        py: 1,
                        borderRadius: 2,
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                        '&:hover': {
                          backgroundColor: '#059669',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                        },
                        '&:disabled': {
                          backgroundColor: '#d1d5db',
                          color: '#9ca3af',
                        }
                      }}
                    >
                      {completingOrder ? 'Tamamlanıyor...' : 'Sipariş Tamamlandı'}
                    </Button>
                  )}
                </>
              )}
              
              {authService.canAssignFactory() && viewOrder.status === OrderStatus.PENDING && (
                <Button 
                  onClick={() => {
                    setViewOrderModalOpen(false);
                    handleAssignFactory(viewOrder);
                  }}
                  variant="outlined"
                  startIcon={<FactoryIcon />}
                  sx={{
                    color: '#8b5cf6',
                    borderColor: '#8b5cf6',
                    fontWeight: 600,
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: '#8b5cf620',
                      borderColor: '#7c3aed',
                      color: '#7c3aed',
                    }
                  }}
                >
                  Fabrika Ata
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;


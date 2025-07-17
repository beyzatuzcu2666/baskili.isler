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
  Cancel as CancelIcon
} from '@mui/icons-material';
import { ordersService } from '../services/orders';
import { factoriesService } from '../services/factories';
import { Order } from '../types/order';
import { Factory } from '../types/factory';
import { ConfirmationDialog } from './ConfirmationDialog';
import { toast } from 'react-toastify';

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  
  // Factory assignment modal states
  const [assignFactoryModalOpen, setAssignFactoryModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedFactoryId, setSelectedFactoryId] = useState<number | ''>('');
  const [deadline, setDeadline] = useState<string>('');
  const [assigningFactory, setAssigningFactory] = useState(false);
  
  // View order modal states
  const [viewOrderModalOpen, setViewOrderModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  
  // Complete/Cancel order states
  const [completingOrder, setCompletingOrder] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  useEffect(() => {
    loadOrders();
    loadFactories();
  }, []);

  const loadFactories = async () => {
    try {
      const data = await factoriesService.getAllFactories();
      setFactories(data);
    } catch (error) {
      console.error('Error loading factories:', error);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toString().includes(searchTerm) ||
    order.brand?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadOrders = async () => {
    try {
      const data = await ordersService.getAll();
      setOrders(data);
      setError(null);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Siparişler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteOrderId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteOrder = async () => {
    if (deleteOrderId) {
      try {
        await ordersService.delete(deleteOrderId);
        setOrders(orders.filter(o => o.id.toString() !== deleteOrderId));
        setDeleteOrderId(null);
        setConfirmDelete(false);
      } catch (error) {
        console.error('Error deleting order:', error);
        setError('Sipariş silinirken bir hata oluştu');
      }
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
    setAssignFactoryModalOpen(true);
  };

  const confirmAssignFactory = async () => {
    if (!selectedOrder || !selectedFactoryId || !deadline) return;
    
    setAssigningFactory(true);
    try {
      await ordersService.assignFactory(
        selectedOrder.id.toString(), 
        selectedFactoryId as number, 
        deadline
      );
      
      // Reload orders to get updated data
      await loadOrders();
      
      // Close modal and reset state
      setAssignFactoryModalOpen(false);
      setSelectedOrder(null);
      setSelectedFactoryId('');
      setDeadline('');
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
      await ordersService.cancel(orderId.toString());
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#f97316';
      case 'in_progress':
        return '#8b5cf6';
      case 'in_production':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Bekliyor';
      case 'in_progress':
        return 'İşlemde';
      case 'in_production':
        return 'Üretimde';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
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
      title: 'İşlemde',
      value: orders.filter(o => o.status === 'IN_PROGRESS').length,
      icon: <TrendingUpIcon />,
      color: '#8b5cf6',
      trend: '+7%'
    },
    {
      title: 'Üretimde',
      value: orders.filter(o => o.status === 'IN_PRODUCTION').length,
      icon: <TrendingUpIcon />,
      color: '#3b82f6',
      trend: '+10%'
    },
    {
      title: 'Tamamlanan',
      value: orders.filter(o => o.status === 'COMPLETED').length,
      icon: <TrendingUpIcon />,
      color: '#1e3a8a',
      trend: '+15%'
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
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
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: '#10b981',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  backgroundColor: '#059669',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                },
              }}
            >
              Yeni Sipariş
            </Button>
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
                  Sipariş & Marka
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
                        {searchTerm ? 'Farklı arama terimleri deneyin' : 'İlk siparişinizi eklemek için "Yeni Sipariş" butonuna tıklayın'}
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
                            {order.brand?.name || 'Bilinmeyen Marka'}
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
                        {order.status?.toLowerCase() === 'in_production' && (
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
                        <Tooltip title="Sil">
                          <IconButton 
                            size="small"
                            onClick={() => handleDelete(order.id.toString())}
                            sx={{ 
                              color: '#ef4444',
                              '&:hover': { backgroundColor: '#fef2f2', color: '#dc2626' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      </Card>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#10b981',
          '&:hover': { backgroundColor: '#059669' },
          display: { xs: 'flex', md: 'none' }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteOrder}
        title="Sipariş Silme Onayı"
        message="Bu siparişi silmek istediğinize emin misiniz?"
      />

      {/* Factory Assignment Modal */}
      <Dialog 
        open={assignFactoryModalOpen} 
        onClose={() => setAssignFactoryModalOpen(false)}
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
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 1 }}>
                Sipariş #{selectedOrder.id}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                {selectedOrder.brand?.name || 'Bilinmeyen Marka'}
              </Typography>
            </Box>
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
              label="Deadline Tarihi"
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
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e5e7eb' }}>
          <Button 
            onClick={() => setAssignFactoryModalOpen(false)}
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
            disabled={!selectedFactoryId || !deadline || assigningFactory}
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
              backgroundColor: '#10b98120',
              color: '#10b981',
              width: 40,
              height: 40,
              fontWeight: 600
            }}
          >
            <ShoppingBagIcon />
          </Avatar>
          Sipariş Detayları
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {viewOrder && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Order Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                <Avatar 
                  sx={{ 
                    backgroundColor: '#10b98120',
                    color: '#10b981',
                    width: 56,
                    height: 56,
                    fontWeight: 600,
                    fontSize: '1.5rem'
                  }}
                >
                  {viewOrder.brand?.name?.charAt(0).toUpperCase() || '#'}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 0.5 }}>
                    Sipariş #{viewOrder.id}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#6b7280', mb: 1 }}>
                    {viewOrder.brand?.name || 'Bilinmeyen Marka'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip 
                      label={getStatusText(viewOrder.status)} 
                      size="small" 
                      sx={{ 
                        backgroundColor: `${getStatusColor(viewOrder.status)}20`,
                        color: getStatusColor(viewOrder.status),
                        fontWeight: 600,
                        borderRadius: 2
                      }} 
                    />
                    <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600 }}>
                      ₺{viewOrder.totalPrice?.toFixed(2) || '0.00'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Order Details */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
                    Sipariş Bilgileri
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>ID:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>#{viewOrder.id}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>Durum:</Typography>
                      <Chip 
                        label={getStatusText(viewOrder.status)} 
                        size="small" 
                        sx={{ 
                          backgroundColor: `${getStatusColor(viewOrder.status)}20`,
                          color: getStatusColor(viewOrder.status),
                          fontWeight: 600,
                          borderRadius: 1,
                          height: 20,
                          fontSize: '0.75rem'
                        }} 
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>Oluşturma Tarihi:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                        {new Date(viewOrder.createdAt).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>Toplam Fiyat:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>
                        ₺{viewOrder.totalPrice?.toFixed(2) || '0.00'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#374151', mb: 2 }}>
                    Marka Bilgileri
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>Marka Adı:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                        {viewOrder.brand?.name || 'Bilinmeyen Marka'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>Marka ID:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#374151' }}>
                        #{viewOrder.brand?.id || 'N/A'}
                      </Typography>
                    </Box>
                    {viewOrder.factory && (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>Atanan Fabrika:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#8b5cf6' }}>
                            {viewOrder.factory.name}
                          </Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </Box>
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
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              Birim Fiyat: ₺{item.unitPrice?.toFixed(2) || '0.00'}
                            </Typography>
                          </Box>
                          {item.plannedDelivery && (
                            <Typography variant="body2" sx={{ color: '#8b5cf6', mt: 0.5 }}>
                              Planlanan Teslimat: {new Date(item.plannedDelivery).toLocaleDateString('tr-TR')}
                            </Typography>
                          )}
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600 }}>
                            ₺{item.lineTotal?.toFixed(2) || (item.quantity * (item.unitPrice || 0)).toFixed(2)}
                          </Typography>
                          {item.status && (
                            <Chip 
                              label={item.status} 
                              size="small" 
                              sx={{ 
                                backgroundColor: '#e5e7eb',
                                color: '#6b7280',
                                fontWeight: 500,
                                borderRadius: 1,
                                mt: 0.5,
                                fontSize: '0.75rem',
                                height: 20
                              }} 
                            />
                          )}
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
              
              {/* Tamamlandı butonu - sadece in_production durumunda göster */}
              {viewOrder.status?.toLowerCase() === 'in_production' && (
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
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;

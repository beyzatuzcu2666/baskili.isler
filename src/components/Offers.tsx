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
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  LocalOffer as LocalOfferIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  ShoppingCart as ShoppingCartIcon,
  Close as CloseIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { Offer } from '../types/offer';
import { Brand } from '../types/brand';
import { Product } from '../types/product';
import { offersService } from '../services/offers';
import { ordersService } from '../services/orders';
import { brandsService } from '../services/brands';
import { productsService } from '../services/products';
import { ConfirmationDialog } from './ConfirmationDialog';

const Offers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteOfferId, setDeleteOfferId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [convertingToOrder, setConvertingToOrder] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewOffer, setViewOffer] = useState<Offer | null>(null);
  const [editOffer, setEditOffer] = useState<{
    brandId: number;
    status: string;
    totalPrice: number;
    validUntil: string;
    items: { productId: number; quantity: number; unitPrice: number; }[];
  } | null>(null);
  const [newOffer, setNewOffer] = useState({
    brandId: 0,
    status: 'OFFER_SENT' as const,
    totalPrice: 0,
    validUntil: '',
    items: [] as { productId: number; quantity: number; unitPrice: number; }[]
  });

  useEffect(() => {
    loadOffers();
    loadBrands();
    loadProducts();
  }, []);

  const loadBrands = async () => {
    try {
      const data = await brandsService.getBrands();
      setBrands(data);
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productsService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const filteredOffers = offers.filter(offer =>
    offer.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadOffers = async () => {
    try {
      const data = await offersService.getAll();
      setOffers(data);
      setError(null);
    } catch (error) {
      console.error('Error loading offers:', error);
      setError('Teklifler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (offer: Offer) => {
    setViewOffer(offer);
    setIsViewModalOpen(true);
  };

  const handleEdit = (offer: Offer) => {
    setSelectedOffer(offer);
    setEditOffer({
      brandId: offer.brandId,
      status: offer.status,
      totalPrice: offer.totalPrice,
      validUntil: offer.validUntil,
      items: [...offer.items]
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedOffer || !editOffer) return;
    
    setIsUpdating(true);
    try {
      const updatedData = {
        brandId: editOffer.brandId,
        totalPrice: calculateEditTotalPrice(),
        validUntil: editOffer.validUntil,
        items: editOffer.items
      };
      
      await offersService.update(selectedOffer.id, updatedData);
      await loadOffers(); // Reload offers
      setIsEditModalOpen(false);
      setSelectedOffer(null);
      setEditOffer(null);
      setError(null);
    } catch (error) {
      console.error('Error updating offer:', error);
      setError('Teklif güncellenirken bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreate = async (newOfferData: Omit<Offer, 'id' | 'createdAt'>) => {
    setIsCreating(true);
    try {
      await offersService.create(newOfferData);
      await loadOffers(); // Reload offers
      setIsCreateModalOpen(false);
      setError(null);
    } catch (error) {
      console.error('Error creating offer:', error);
      setError('Yeni teklif oluşturulürken bir hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };

  const addItem = () => {
    setNewOffer({
      ...newOffer,
      items: [...newOffer.items, { productId: 0, quantity: 1, unitPrice: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = newOffer.items.filter((_, i) => i !== index);
    setNewOffer({
      ...newOffer,
      items: updatedItems
    });
  };

  const updateItem = (index: number, field: 'productId' | 'quantity' | 'unitPrice', value: number) => {
    const updatedItems = [...newOffer.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setNewOffer({
      ...newOffer,
      items: updatedItems
    });
  };

  const addEditItem = () => {
    if (!editOffer) return;
    setEditOffer({
      ...editOffer,
      items: [...editOffer.items, { productId: 0, quantity: 1, unitPrice: 0 }]
    });
  };

  const removeEditItem = (index: number) => {
    if (!editOffer) return;
    const updatedItems = editOffer.items.filter((_, i) => i !== index);
    setEditOffer({
      ...editOffer,
      items: updatedItems
    });
  };

  const updateEditItem = (index: number, field: 'productId' | 'quantity' | 'unitPrice', value: number) => {
    if (!editOffer) return;
    const updatedItems = [...editOffer.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setEditOffer({
      ...editOffer,
      items: updatedItems
    });
  };

  const calculateTotalPrice = () => {
    return newOffer.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const calculateEditTotalPrice = () => {
    if (!editOffer) return 0;
    return editOffer.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  };

  const handleDelete = async (id: string) => {
    setDeleteOfferId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteOffer = async () => {
    if (deleteOfferId) {
      setIsDeleting(true);
      try {
        await offersService.delete(parseInt(deleteOfferId));
        setOffers(offers.filter(o => o.id.toString() !== deleteOfferId));
        setDeleteOfferId(null);
        setConfirmDelete(false);
        setError(null);
      } catch (error) {
      console.error('Error deleting offer:', error);
        setError('Teklif silinirken bir hata oluştu');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleConvertToOrder = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsOrderModalOpen(true);
  };

    const confirmConvertToOrder = async () => {
    if (!selectedOffer) return;
    
    setConvertingToOrder(true);
    try {
      // Convert offer to order using the correct endpoint
      // Swagger'da belirtilen /orders/accept endpoint'ini kullan
      const itemDeadlines: Record<string, string> = {};
      selectedOffer.items.forEach((item, index) => {
        // Her item için 30 gün sonraki tarih
        itemDeadlines[item.productId.toString()] = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      });
      
      await ordersService.acceptOffer(selectedOffer.id.toString(), itemDeadlines);
      
      await loadOffers(); // Reload offers
      setIsOrderModalOpen(false);
      setSelectedOffer(null);
      
      // Show success message
      setError(null);
      // You could show a success toast here instead
      
    } catch (error) {
      console.error('Error converting to order:', error);
      setError('Teklif siparişe dönüştürülürken bir hata oluştu');
    } finally {
      setConvertingToOrder(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'offer_sent':
        return '#f97316';
      case 'offer_accepted':
      case 'accepted':
        return '#10b981';
      case 'offer_rejected':
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'offer_sent':
        return 'Gönderildi';
      case 'offer_accepted':
      case 'accepted':
        return 'Kabul Edildi';
      case 'offer_rejected':
      case 'rejected':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  // Statistics Cards Data
  const statsData = [
    {
      title: 'Toplam Teklif',
      value: offers.length,
      icon: <LocalOfferIcon />,
      color: '#10b981',
      trend: '+18%'
    },
    {
      title: 'Bekleyen Teklifler',
      value: offers.filter(o => o.status === 'OFFER_SENT').length,
      icon: <ScheduleIcon />,
      color: '#f97316',
      trend: '+5%'
    },
    {
      title: 'Kabul Edilen',
      value: offers.filter(o => o.status === 'OFFER_ACCEPTED').length,
      icon: <TrendingUpIcon />,
      color: '#1e3a8a',
      trend: '+22%'
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
          Teklif Yönetimi
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Tekliflerinizi yönetin, düzenleyin ve takip edin
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
              placeholder="Teklif ara..."
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
              onClick={() => setIsCreateModalOpen(true)}
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
              Yeni Teklif
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
                  Teklif
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Durum
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Tarih Bilgileri
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Toplam
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  İşlemler
                </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              {filteredOffers.length === 0 ? (
              <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <LocalOfferIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                        {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz teklif eklenmemiş'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        {searchTerm ? 'Farklı arama terimleri deneyin' : 'İlk teklifinizi eklemek için "Yeni Teklif" butonuna tıklayın'}
                      </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
                filteredOffers.map((offer, index) => (
                  <TableRow 
                    key={offer.id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f9fafb' },
                      borderBottom: index === filteredOffers.length - 1 ? 'none' : '1px solid #e5e7eb'
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
                          {offer.brandName?.charAt(0).toUpperCase() || 'T'}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                            {offer.brandName || 'Bilinmeyen Marka'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            ID: {offer.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip 
                        label={getStatusText(offer.status)} 
                        size="small" 
                        sx={{ 
                          backgroundColor: `${getStatusColor(offer.status)}20`,
                          color: getStatusColor(offer.status),
                          fontWeight: 600,
                          borderRadius: 2
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                            Oluşturulma: {new Date(offer.createdAt).toLocaleDateString('tr-TR')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Geçerli: {new Date(offer.validUntil).toLocaleDateString('tr-TR')}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600 }}>
                        ₺{offer.totalPrice?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Görüntüle">
                          <IconButton 
                            size="small"
                            onClick={() => handleView(offer)}
                            sx={{ 
                              color: '#6b7280',
                              '&:hover': { backgroundColor: '#f3f4f6', color: '#374151' }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {offer.status === 'OFFER_SENT' && (
                          <Tooltip title="Siparişe Çevir">
                            <IconButton 
                              size="small"
                              onClick={() => handleConvertToOrder(offer)}
                              sx={{ 
                                color: '#1e3a8a',
                                '&:hover': { backgroundColor: '#eff6ff', color: '#1d4ed8' }
                              }}
                            >
                              <ShoppingCartIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Düzenle">
                          <IconButton 
                            size="small"
                            onClick={() => handleEdit(offer)}
                            sx={{ 
                              color: '#f97316',
                              '&:hover': { backgroundColor: '#fef3e2', color: '#ea580c' }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sil">
                          <IconButton 
                            size="small"
                            onClick={() => handleDelete(offer.id.toString())}
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
        onClick={() => setIsCreateModalOpen(true)}
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

      {/* Edit Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle
        sx={{
            pb: 2,
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: '#10b98120',
                color: '#10b981',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <EditIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Teklif Düzenle
            </Typography>
          </Box>
          <IconButton onClick={() => setIsEditModalOpen(false)} sx={{ color: '#6b7280' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {editOffer && (
            <Box sx={{ display: 'grid', gap: 3 }}>
              <FormControl fullWidth disabled>
                <InputLabel id="edit-brand-select-label">Marka</InputLabel>
              <Select
                  labelId="edit-brand-select-label"
                  value={editOffer.brandId}
                  label="Marka"
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#f9fafb',
                  }}
                >
                {brands.map((brand) => (
                    <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
              </FormControl>
              
              {/* Items Section */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600 }}>
                    Ürünler
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={addEditItem}
                  sx={{
                      borderColor: '#10b981',
                      color: '#10b981',
                    '&:hover': {
                        borderColor: '#059669',
                        backgroundColor: '#10b98110'
                    }
                  }}
                >
                    Ürün Ekle
                  </Button>
              </Box>
                
                {editOffer.items.map((item, index) => (
                  <Box key={index} sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr auto', 
                    gap: 2, 
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    border: '1px solid #e5e7eb',
                    borderRadius: 2,
                    backgroundColor: '#f9fafb'
                  }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Ürün</InputLabel>
                    <Select
                      value={item.productId}
                      label="Ürün"
                        onChange={(e) => updateEditItem(index, 'productId', Number(e.target.value))}
                    >
                      {products.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                            {product.name} ({product.code})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                    
                  <TextField
                      size="small"
                    label="Adet"
                    type="number"
                    value={item.quantity}
                      onChange={(e) => updateEditItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      inputProps={{ min: 1 }}
                  />
                    
                  <TextField
                      size="small"
                      label="Birim Fiyat"
                    type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateEditItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                    
                    <IconButton
                      size="small"
                      onClick={() => removeEditItem(index)}
                      sx={{ color: '#ef4444' }}
                    >
                      <RemoveIcon />
                    </IconButton>
                </Box>
              ))}
                
                {editOffer.items.length === 0 && (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4, 
                    color: '#6b7280',
                    border: '2px dashed #e5e7eb',
                    borderRadius: 2
                  }}>
                    <Typography variant="body2">
                      Henüz ürün eklenmedi. "Ürün Ekle" butonuna tıklayın.
                    </Typography>
            </Box>
                )}
          </Box>

              {/* Total Price Display */}
              <Box sx={{ 
                p: 2, 
                backgroundColor: '#f0fdf4', 
                borderRadius: 2,
                border: '1px solid #10b981'
              }}>
                <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600 }}>
                  Toplam Fiyat: ₺{calculateEditTotalPrice().toFixed(2)}
                </Typography>
              </Box>
              
              <TextField
                fullWidth
                label="Geçerlilik Tarihi"
                type="date"
                value={editOffer.validUntil ? editOffer.validUntil.split('T')[0] : ''}
                onChange={(e) => setEditOffer({
                  ...editOffer,
                  validUntil: e.target.value ? e.target.value + 'T23:59:59.000Z' : ''
                })}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#10b981',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#10b981',
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => {
              setIsEditModalOpen(false);
              setEditOffer(null);
              setSelectedOffer(null);
            }}
            disabled={isUpdating}
            sx={{ 
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpdate}
            disabled={isUpdating || !editOffer || editOffer.items.length === 0 || !editOffer.validUntil || calculateEditTotalPrice() <= 0}
            sx={{
              backgroundColor: '#10b981',
              '&:hover': { backgroundColor: '#059669' },
              borderRadius: 2,
              px: 3
            }}
          >
            {isUpdating ? (
              <>
                <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
                Güncelleniyor...
              </>
            ) : (
              'Güncelle'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Convert to Order Modal */}
      <Dialog
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: '#1e3a8a20',
                color: '#1e3a8a',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingCartIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Siparişe Dönüştür
          </Typography>
          </Box>
          <IconButton onClick={() => setIsOrderModalOpen(false)} sx={{ color: '#6b7280' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ color: '#374151', mb: 2 }}>
            Bu teklifi siparişe dönüştürmek istediğinize emin misiniz?
          </Typography>
          {selectedOffer && (
            <Box sx={{ 
              backgroundColor: '#f9fafb', 
              borderRadius: 2, 
              p: 2,
              border: '1px solid #e5e7eb'
            }}>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                Teklif Detayları:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
                {selectedOffer.brandName} - ₺{selectedOffer.totalPrice.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                {selectedOffer.items.length} ürün
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setIsOrderModalOpen(false)}
            sx={{ 
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
            disabled={convertingToOrder}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={confirmConvertToOrder}
            disabled={convertingToOrder}
            sx={{
              backgroundColor: '#1e3a8a',
              '&:hover': { backgroundColor: '#1d4ed8' },
              borderRadius: 2,
              px: 3
            }}
          >
            {convertingToOrder ? 'Dönüştürülüyor...' : 'Siparişe Dönüştür'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Offer Modal */}
      <Dialog
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: '#6b728020',
                color: '#6b7280',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <VisibilityIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Teklif Detayları
          </Typography>
          </Box>
          <IconButton onClick={() => setIsViewModalOpen(false)} sx={{ color: '#6b7280' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {viewOffer && (
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* Basic Info */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: 2,
                p: 2,
                backgroundColor: '#f9fafb',
                borderRadius: 2,
                border: '1px solid #e5e7eb'
              }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                    Marka
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600 }}>
                    {viewOffer.brandName || 'Bilinmeyen Marka'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                    Durum
                  </Typography>
                  <Chip 
                    label={getStatusText(viewOffer.status)} 
                    size="small" 
                    sx={{ 
                      backgroundColor: `${getStatusColor(viewOffer.status)}20`,
                      color: getStatusColor(viewOffer.status),
                      fontWeight: 600,
                      borderRadius: 2
                    }} 
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                    Oluşturulma Tarihi
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1f2937' }}>
                    {new Date(viewOffer.createdAt).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                    Geçerlilik Tarihi
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1f2937' }}>
                    {new Date(viewOffer.validUntil).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
              </Box>

              {/* Items List */}
              <Box>
                <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600, mb: 2 }}>
                  Ürünler ({viewOffer.items.length})
                </Typography>
                {viewOffer.items.length > 0 ? (
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    {viewOffer.items.map((item, index) => {
                      const product = products.find(p => p.id === item.productId);
                      const lineTotal = item.quantity * item.unitPrice;
                      return (
                        <Box 
                          key={index}
                          sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr' }, 
                            gap: 2, 
                            alignItems: 'center',
                            p: 2,
                            border: '1px solid #e5e7eb',
                            borderRadius: 2,
                            backgroundColor: '#ffffff'
                          }}
                        >
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                              {product?.name || `Ürün ID: ${item.productId}`}
                            </Typography>
                            {product?.code && (
                              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Kod: {product.code}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              Adet
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {item.quantity}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              Birim Fiyat
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              ₺{item.unitPrice.toFixed(2)}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              Toplam
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#059669' }}>
                              ₺{lineTotal.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4, 
                    color: '#6b7280',
                    border: '2px dashed #e5e7eb',
                    borderRadius: 2
                  }}>
                    <Typography variant="body2">
                      Bu teklifte ürün bulunmuyor.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Total Price */}
              <Box sx={{ 
                p: 3, 
                backgroundColor: '#f0fdf4', 
                borderRadius: 2,
                border: '1px solid #10b981',
                textAlign: 'center'
              }}>
                <Typography variant="body2" sx={{ color: '#059669', mb: 1 }}>
                  Toplam Teklif Tutarı
                </Typography>
                <Typography variant="h4" sx={{ color: '#059669', fontWeight: 700 }}>
                  ₺{viewOffer.totalPrice.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setIsViewModalOpen(false)}
            sx={{ 
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            Kapat
          </Button>
          {viewOffer?.status === 'OFFER_SENT' && (
            <Button
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={() => {
                setIsViewModalOpen(false);
                if (viewOffer) {
                  handleConvertToOrder(viewOffer);
                }
              }}
              sx={{
                backgroundColor: '#1e3a8a',
                '&:hover': { backgroundColor: '#1d4ed8' },
                borderRadius: 2,
                px: 3
              }}
            >
              Siparişe Dönüştür
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Create New Offer Modal */}
      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: '#10b98120',
                color: '#10b981',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LocalOfferIcon />
        </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Yeni Teklif Oluştur
            </Typography>
          </Box>
          <IconButton onClick={() => setIsCreateModalOpen(false)} sx={{ color: '#6b7280' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="brand-select-label">Marka</InputLabel>
              <Select
                labelId="brand-select-label"
                id="brand-select"
                value={newOffer.brandId}
                label="Marka"
                onChange={(e) => setNewOffer({
                  ...newOffer,
                  brandId: Number(e.target.value)
                })}
                sx={{
                  borderRadius: 2,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10b981',
                  },
                }}
              >
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
                         {/* Items Section */}
             <Box>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                 <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600 }}>
                   Ürünler
                 </Typography>
                 <Button
                   variant="outlined"
                   size="small"
                   startIcon={<AddIcon />}
                   onClick={addItem}
                   sx={{
                     borderColor: '#10b981',
                     color: '#10b981',
                     '&:hover': {
                       borderColor: '#059669',
                       backgroundColor: '#10b98110'
                     }
                   }}
                 >
                   Ürün Ekle
                 </Button>
               </Box>
               
               {newOffer.items.map((item, index) => (
                 <Box key={index} sx={{ 
                   display: 'grid', 
                   gridTemplateColumns: '2fr 1fr 1fr auto', 
                   gap: 2, 
                   alignItems: 'center',
                   mb: 2,
                   p: 2,
                   border: '1px solid #e5e7eb',
                   borderRadius: 2,
                   backgroundColor: '#f9fafb'
                 }}>
                   <FormControl fullWidth size="small">
                     <InputLabel>Ürün</InputLabel>
                     <Select
                       value={item.productId}
                       label="Ürün"
                       onChange={(e) => updateItem(index, 'productId', Number(e.target.value))}
                     >
                       {products.map((product) => (
                         <MenuItem key={product.id} value={product.id}>
                           {product.name} ({product.code})
                         </MenuItem>
                       ))}
                     </Select>
                   </FormControl>
                   
                   <TextField
                     size="small"
                     label="Adet"
                     type="number"
                     value={item.quantity}
                     onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                     inputProps={{ min: 1 }}
                   />
                   
                   <TextField
                     size="small"
                     label="Birim Fiyat"
                     type="number"
                     value={item.unitPrice}
                     onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                     inputProps={{ min: 0, step: 0.01 }}
                   />
                   
                   <IconButton
                     size="small"
                     onClick={() => removeItem(index)}
                     sx={{ color: '#ef4444' }}
                   >
                     <RemoveIcon />
                   </IconButton>
                 </Box>
               ))}
               
               {newOffer.items.length === 0 && (
                 <Box sx={{ 
                   textAlign: 'center', 
                   py: 4, 
                   color: '#6b7280',
                   border: '2px dashed #e5e7eb',
                   borderRadius: 2
                 }}>
                   <Typography variant="body2">
                     Henüz ürün eklenmedi. "Ürün Ekle" butonuna tıklayın.
                   </Typography>
                 </Box>
               )}
             </Box>

             {/* Total Price Display */}
             <Box sx={{ 
               p: 2, 
               backgroundColor: '#f0fdf4', 
               borderRadius: 2,
               border: '1px solid #10b981'
             }}>
               <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600 }}>
                 Toplam Fiyat: ₺{calculateTotalPrice().toFixed(2)}
               </Typography>
             </Box>
            
                         <TextField
               fullWidth
               label="Geçerlilik Tarihi"
               type="date"
               value={newOffer.validUntil ? newOffer.validUntil.split('T')[0] : ''}
               onChange={(e) => setNewOffer({
                 ...newOffer,
                 validUntil: e.target.value ? e.target.value + 'T23:59:59.000Z' : ''
               })}
               InputLabelProps={{
                 shrink: true,
               }}
               sx={{
                 '& .MuiOutlinedInput-root': {
                   borderRadius: 2,
                   '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                     borderColor: '#10b981',
                   },
                 },
                 '& .MuiInputLabel-root.Mui-focused': {
                   color: '#10b981',
                 },
               }}
             />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
             onClick={() => {
               setIsCreateModalOpen(false);
               setNewOffer({
                 brandId: 0,
                 status: 'OFFER_SENT' as const,
                 totalPrice: 0,
                 validUntil: '',
                 items: [] as { productId: number; quantity: number; unitPrice: number; }[]
               });
             }}
             disabled={isCreating}
            sx={{ 
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            İptal
          </Button>
                     <Button
            variant="contained"
             onClick={() => {
               const selectedBrand = brands.find(b => b.id === newOffer.brandId);
               const totalPrice = calculateTotalPrice();
               if (selectedBrand && newOffer.items.length > 0 && newOffer.validUntil && totalPrice > 0) {
                 handleCreate({
                   brandId: newOffer.brandId,
                   status: newOffer.status,
                   totalPrice: totalPrice,
                   validUntil: newOffer.validUntil,
                   items: newOffer.items,
                   brandName: selectedBrand.name
                 });
                 setNewOffer({
                   brandId: 0,
                   status: 'OFFER_SENT' as const,
                   totalPrice: 0,
                   validUntil: '',
                   items: [] as { productId: number; quantity: number; unitPrice: number; }[]
                 });
               }
             }}
             disabled={isCreating || !newOffer.brandId || newOffer.items.length === 0 || !newOffer.validUntil || calculateTotalPrice() <= 0}
             sx={{
               backgroundColor: '#10b981',
               '&:hover': { backgroundColor: '#059669' },
               borderRadius: 2,
               px: 3
             }}
           >
             {isCreating ? (
               <>
                 <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
                 Oluşturuluyor...
               </>
             ) : (
               'Teklif Oluştur'
             )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteOffer}
        title="Teklif Silme Onayı"
        message="Bu teklifi silmek istediğinize emin misiniz?"
        loading={isDeleting}
        confirmText={isDeleting ? 'Siliniyor...' : 'Sil'}
      />
    </Box>
  );
};

export default Offers;

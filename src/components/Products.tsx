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
  DialogActions
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  LocalOffer as LocalOfferIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { Product } from '../types/product';
import { productsService } from '../services/products';
import { ConfirmationDialog } from './ConfirmationDialog';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductCode, setNewProductCode] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.unit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const loadProducts = async () => {
    try {
      const data = await productsService.getAll();
      if (!Array.isArray(data)) {
        throw new Error('Invalid products data format');
      }
      setProducts(data);
      setError(null);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Ürünler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProductName.trim() || !newProductCode.trim() || !newProductPrice.trim() || !newProductUnit.trim()) return;

    setIsCreating(true);
    try {
      const product = await productsService.create({
        name: newProductName,
        code: newProductCode,
        unitPrice: parseFloat(newProductPrice),
        unit: newProductUnit
      });
      setProducts([...products, product]);
      resetForm();
      setOpenDialog(false);
      setError(null);
    } catch (error) {
      console.error('Error creating product:', error);
      setError('Ürün oluşturulurken bir hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async (product: Product) => {
    setSelectedProduct(product);
    setNewProductName(product.name);
    setNewProductCode(product.code);
    setNewProductPrice(product.unitPrice.toString());
    setNewProductUnit(product.unit);
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;

    setIsUpdating(true);
    try {
      const updatedProduct = await productsService.update(selectedProduct.id, {
        name: newProductName,
        code: newProductCode,
        unitPrice: parseFloat(newProductPrice),
        unit: newProductUnit
      });
      setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
      resetForm();
      setOpenDialog(false);
      setError(null);
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Ürün güncellenirken bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteProductId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteProduct = async () => {
    if (deleteProductId) {
      setIsDeleting(true);
      try {
        await productsService.delete(deleteProductId);
        setProducts(products.filter(p => p.id !== deleteProductId));
        setDeleteProductId(null);
        setConfirmDelete(false);
        setError(null);
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Ürün silinirken bir hata oluştu');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const resetForm = () => {
    setSelectedProduct(null);
    setNewProductName('');
    setNewProductCode('');
    setNewProductPrice('');
    setNewProductUnit('');
  };

  const handleView = (product: Product) => {
    setViewProduct(product);
    setViewModalOpen(true);
  };

  // Statistics Cards Data
  const statsData = [
    {
      title: 'Toplam Ürün',
      value: products.length,
      icon: <InventoryIcon />,
      color: '#10b981',
      trend: '+15%'
    },
    {
      title: 'Aktif Ürünler',
      value: products.length,
      icon: <TrendingUpIcon />,
      color: '#f97316',
      trend: '+12%'
    },
    {
      title: 'Ortalama Fiyat',
      value: products.length > 0 ? `₺${(products.reduce((sum, p) => sum + p.unitPrice, 0) / products.length).toFixed(2)}` : '₺0',
      icon: <LocalOfferIcon />,
      color: '#1e3a8a',
      trend: '+8%'
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
          Ürün Yönetimi
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Ürünlerinizi yönetin, düzenleyin ve takip edin
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
              placeholder="Ürün ara..."
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
              onClick={() => {
                resetForm();
                setOpenDialog(true);
              }}
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
              Yeni Ürün
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
                  Ürün
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Kod & Birim
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Fiyat
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  İşlemler
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <InventoryIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                        {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz ürün eklenmemiş'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        {searchTerm ? 'Farklı arama terimleri deneyin' : 'İlk ürününüzü eklemek için "Yeni Ürün" butonuna tıklayın'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product, index) => (
                  <TableRow 
                    key={product.id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f9fafb' },
                      borderBottom: index === filteredProducts.length - 1 ? 'none' : '1px solid #e5e7eb'
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
                          {product.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                            {product.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            ID: {product.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                            Kod: {product.code}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Birim: {product.unit}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600 }}>
                        ₺{product.unitPrice.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Görüntüle">
                          <IconButton 
                            size="small"
                            onClick={() => handleView(product)}
                            sx={{ 
                              color: '#6b7280',
                              '&:hover': { backgroundColor: '#f3f4f6', color: '#374151' }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Düzenle">
                          <IconButton 
                            size="small"
                            onClick={() => handleEdit(product)}
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
                            onClick={() => handleDelete(product.id)}
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
        onClick={() => {
          resetForm();
          setOpenDialog(true);
        }}
      >
        <AddIcon />
      </Fab>

      {/* Product Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#1f2937' }}>
          {selectedProduct ? 'Ürün Güncelle' : 'Yeni Ürün Ekle'}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            <TextField
              label="Ürün Adı"
              value={newProductName}
              onChange={(e) => setNewProductName(e.target.value)}
              fullWidth
              variant="outlined"
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
            <TextField
              label="Ürün Kodu"
              value={newProductCode}
              onChange={(e) => setNewProductCode(e.target.value)}
              fullWidth
              variant="outlined"
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
            <TextField
              label="Birim Fiyat"
              type="number"
              value={newProductPrice}
              onChange={(e) => setNewProductPrice(e.target.value)}
              fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
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
            <TextField
              label="Birim"
              value={newProductUnit}
              onChange={(e) => setNewProductUnit(e.target.value)}
              fullWidth
              variant="outlined"
              placeholder="Adet, Kg, Metre, vb."
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
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            disabled={isCreating || isUpdating}
            sx={{ 
              color: '#6b7280',
              borderRadius: 2,
              px: 3,
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            İptal
          </Button>
          <Button 
            onClick={selectedProduct ? handleUpdate : handleCreate}
            variant="contained"
            disabled={isCreating || isUpdating}
            sx={{
              backgroundColor: '#10b981',
              borderRadius: 2,
              px: 3,
              '&:hover': { backgroundColor: '#059669' }
            }}
          >
            {(selectedProduct && isUpdating) ? (
              <>
                <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
                Güncelleniyor...
              </>
            ) : (!selectedProduct && isCreating) ? (
              <>
                <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
                Ekleniyor...
              </>
            ) : (
              selectedProduct ? 'Güncelle' : 'Ekle'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Product Dialog */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#1f2937', pb: 2 }}>
          Ürün Detayları
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {viewProduct && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Product Header */}
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
                  {viewProduct.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 0.5 }}>
                    {viewProduct.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    ID: {viewProduct.id}
                  </Typography>
                </Box>
              </Box>

              {/* Product Details */}
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                    Ürün Kodu
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#374151' }}>
                    {viewProduct.code}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                    Birim
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#374151' }}>
                    {viewProduct.unit}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                    Birim Fiyat
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#059669' }}>
                    ₺{viewProduct.unitPrice.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setViewModalOpen(false)}
            sx={{ 
              color: '#6b7280',
              borderRadius: 2,
              px: 3,
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            Kapat
          </Button>
          {viewProduct && (
            <Button 
              onClick={() => {
                setViewModalOpen(false);
                handleEdit(viewProduct);
              }}
              variant="contained"
              sx={{
                backgroundColor: '#10b981',
                borderRadius: 2,
                px: 3,
                '&:hover': { backgroundColor: '#059669' }
              }}
            >
              Düzenle
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteProduct}
        title="Ürün Silme Onayı"
        message="Bu ürünü silmek istediğinize emin misiniz?"
        loading={isDeleting}
        confirmText={isDeleting ? 'Siliniyor...' : 'Sil'}
      />
    </Box>
  );
};

export default Products;

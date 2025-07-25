import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card,
  CardContent,
  Typography,
  Button,
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Tooltip,
  IconButton,
  TablePagination,
  CircularProgress,
  Alert,
  SelectChangeEvent,
  Avatar,
  InputAdornment,
  FormControlLabel,
  Switch,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  Category as CategoryIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  PowerSettingsNew as PowerIcon,
} from '@mui/icons-material';
import { Product, ProductCreateDto, ProductUpdateDto, Unit, getUnitDisplayName } from '../types/product';
import { productsService } from '../services/products';
import { ConfirmationDialog } from './ConfirmationDialog';
import { toast } from 'react-toastify';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<number | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<ProductCreateDto>({
    name: '',
    description: '',
    unit: Unit.ADET,
    unitPrice: 0,
    taxRate: 18.00
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesActive = showActiveOnly ? product.active : true;
    return matchesSearch && matchesActive;
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsService.getAll();
      setProducts(data);
      setError(null);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Ürünler yüklenirken bir hata oluştu');
      toast.error('Ürünler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || formData.unitPrice <= 0) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    setIsCreating(true);
    try {
      const product = await productsService.create(formData);
      setProducts([...products, product]);
      resetForm();
      setOpenDialog(false);
      toast.success('Ürün başarıyla oluşturuldu');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Ürün oluşturulurken bir hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedProduct || !formData.name.trim() || formData.unitPrice <= 0) {
      toast.error('Lütfen gerekli alanları doldurun');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: ProductUpdateDto = {
        name: formData.name,
        description: formData.description,
        unit: formData.unit,
        unitPrice: formData.unitPrice,
        taxRate: formData.taxRate
      };
      
      const updatedProduct = await productsService.update(selectedProduct.id, updateData);
      setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
      resetForm();
      setOpenDialog(false);
      toast.success('Ürün başarıyla güncellendi');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Ürün güncellenirken bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;

    setIsDeleting(true);
      try {
        await productsService.delete(deleteProductId);
        setProducts(products.filter(p => p.id !== deleteProductId));
      setConfirmDelete(false);
        setDeleteProductId(null);
      toast.success('Ürün başarıyla silindi');
      } catch (error) {
        console.error('Error deleting product:', error);
      toast.error('Ürün silinirken bir hata oluştu');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      const updatedProduct = product.active 
        ? await productsService.deactivate(product.id)
        : await productsService.activate(product.id);
      
      setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
      toast.success(`Ürün ${updatedProduct.active ? 'aktifleştirildi' : 'pasifleştirildi'}`);
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error('Ürün durumu değiştirilirken bir hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      unit: Unit.ADET,
      unitPrice: 0,
      taxRate: 18.00
    });
    setSelectedProduct(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  const openEditDialog = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      unit: product.unit,
      unitPrice: product.unitPrice,
      taxRate: product.taxRate
    });
    setOpenDialog(true);
  };

  const openViewModal = (product: Product) => {
    setViewProduct(product);
    setViewModalOpen(true);
  };

  const openDeleteDialog = (productId: number) => {
    setDeleteProductId(productId);
    setConfirmDelete(true);
  };

  const getStatusColor = (active: boolean) => {
    return active ? '#10b981' : '#ef4444';
  };

  const getStatusText = (active: boolean) => {
    return active ? 'Aktif' : 'Pasif';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

    return (
    <Box sx={{ p: { xs: 2, sm: 3 }, pl: { xs: 2, sm: 3, md: 3 }, pr: { xs: 2, sm: 3, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
          Ürünler
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Sistem ürünlerini buradan yönetebilirsiniz
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ flex: '1 1 250px', background: 'linear-gradient(135deg, #3b82f615 0%, #3b82f608 100%)', border: '1px solid #3b82f620' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                  {products.length}
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

        <Card sx={{ flex: '1 1 250px', background: 'linear-gradient(135deg, #10b98115 0%, #10b98108 100%)', border: '1px solid #10b98120' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                  {products.filter(p => p.active).length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Aktif Ürün
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#10b98120', color: '#10b981' }}>
                <CheckCircleIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 250px', background: 'linear-gradient(135deg, #f9731615 0%, #f9731608 100%)', border: '1px solid #f9731620' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#f97316' }}>
                  ₺{products.reduce((sum, p) => sum + p.unitPrice, 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Toplam Değer
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#f9731620', color: '#f97316' }}>
                <TrendingUpIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={showActiveOnly}
                onChange={(e) => setShowActiveOnly(e.target.checked)}
                color="primary"
              />
            }
            label="Sadece Aktif"
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
          sx={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Yeni Ürün
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Products Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Ürün Adı</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Açıklama</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Birim</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Birim Fiyat</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>KDV Oranı</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Durum</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151' }}>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: '#e0f2fe', color: '#0277bd', width: 40, height: 40 }}>
                        <InventoryIcon />
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {product.name}
                      </Typography>
                    </Box>
                </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 200 }}>
                      {product.description || '-'}
                    </Typography>
                </TableCell>
                  <TableCell>
                    <Chip
                      label={getUnitDisplayName(product.unit)}
                      size="small"
                      sx={{ backgroundColor: '#f1f5f9', color: '#475569' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#059669' }}>
                      ₺{product.unitPrice.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      %{product.taxRate.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(product.active)}
                      size="small"
                      sx={{
                        backgroundColor: product.active ? '#dcfce7' : '#fee2e2',
                        color: getStatusColor(product.active),
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Görüntüle">
                        <IconButton size="small" onClick={() => openViewModal(product)}>
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Düzenle">
                        <IconButton size="small" onClick={() => openEditDialog(product)}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={product.active ? 'Pasifleştir' : 'Aktifleştir'}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleToggleActive(product)}
                          sx={{ color: product.active ? '#ef4444' : '#10b981' }}
                        >
                          <PowerIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sil">
                        <IconButton size="small" onClick={() => openDeleteDialog(product.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

        {filteredProducts.length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <InventoryIcon sx={{ fontSize: 64, color: '#94a3b8', mb: 2 }} />
            <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
              Ürün bulunamadı
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              {searchTerm ? 'Arama kriterlerinize uygun ürün bulunamadı' : 'Henüz ürün eklenmemiş'}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Ürün Düzenle' : 'Yeni Ürün Oluştur'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <TextField
              label="Ürün Adı"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
              required
          />
            
          <TextField
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
              multiline
              rows={3}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Birim</InputLabel>
                <Select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value as Unit })}
                  label="Birim"
                >
                  {Object.values(Unit).map(unit => (
                    <MenuItem key={unit} value={unit}>
                      {getUnitDisplayName(unit)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

          <TextField
                label="Birim Fiyat"
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
            fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />

          <TextField
                label="KDV Oranı (%)"
                type="number"
                value={formData.taxRate}
                onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
            fullWidth
                inputProps={{ min: 0, max: 100, step: 0.01 }}
          />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button 
            onClick={selectedProduct ? handleUpdate : handleCreate}
            variant="contained"
            disabled={isCreating || isUpdating}
            startIcon={isCreating || isUpdating ? <CircularProgress size={20} /> : null}
          >
            {selectedProduct ? 'Güncelle' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ürün Detayları</DialogTitle>
        <DialogContent>
          {viewProduct && (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: '#e0f2fe', color: '#0277bd', width: 60, height: 60 }}>
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {viewProduct.name}
                  </Typography>
                  <Chip
                    label={getStatusText(viewProduct.active)}
                    size="small"
                    sx={{
                      backgroundColor: viewProduct.active ? '#dcfce7' : '#fee2e2',
                      color: getStatusColor(viewProduct.active),
                      fontWeight: 500
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                    Açıklama
                  </Typography>
                  <Typography variant="body1">
                    {viewProduct.description || 'Açıklama bulunmuyor'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                      Birim
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {getUnitDisplayName(viewProduct.unit)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                      Birim Fiyat
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#059669' }}>
                      ₺{viewProduct.unitPrice.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                      KDV Oranı
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      %{viewProduct.taxRate.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 0.5 }}>
                    KDV Dahil Fiyat
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#059669' }}>
                    ₺{(viewProduct.unitPrice * (1 + viewProduct.taxRate / 100)).toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewModalOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Ürün Sil"
        message="Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
        loading={isDeleting}
      />
    </Box>
  );
};

export default Products;

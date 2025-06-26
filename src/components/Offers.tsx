import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Divider,
  Typography,
  CircularProgress,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import { 
  ArrowForward as ArrowForwardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { authService } from '../services/auth';
import { Offer } from '../types/offer';
import { offersService } from '../services/offers';
import { brandsService } from '../services/brands';
import { Brand } from '../types/brand';
import { productsService } from '../services/products';
import { Product } from '../types/product';

interface FormItem {
  productId: string;
  quantity: string;
  price: string;
}

const Offers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Offer | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [convertingToOrder, setConvertingToOrder] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteQuoteId, setDeleteQuoteId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [formItems, setFormItems] = useState<FormItem[]>([{ productId: '0', quantity: '', price: '' }]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const addFormItem = () => {
    setFormItems(prev => [...prev, { productId: '0', quantity: '', price: '' }]);
  };

  const removeFormItem = (index: number) => {
    setFormItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateFormItem = (index: number, field: keyof FormItem, value: string) => {
    setFormItems(prev => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], [field]: value };
      return newItems;
    });
  };

  const handleCreate = async () => {
    if (!newBrandName.trim() || formItems.length === 0) return;

    try {
      const total = formItems.reduce((sum, item) => {
        const quantity = parseInt(item.quantity);
        const price = parseFloat(item.price);
        return sum + (quantity * price);
      }, 0);

      const selectedBrand = brands.find(brand => brand.name === newBrandName);
      const payload = {
        brandId: selectedBrand?.id || 0,
        status: 'OFFER_SENT' as const,
        totalPrice: total,
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        items: formItems.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.price),
          productName: products.find(p => p.id === parseInt(item.productId))?.name || '',
          lineTotal: parseFloat(item.price) * parseInt(item.quantity)
        }))
      };

      console.log('Creating offer with payload:', payload);

      const offer = await offersService.create(payload);
      setOffers(prev => [...prev, offer]);
      resetDialog();
      setOpenDialog(false);
      setSnackbarMessage('Teklif başarıyla oluşturuldu!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error creating offer:', error);
      setSnackbarMessage(error.response?.data?.message || 'Teklif oluşturulurken bir hata oluştu!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setOpenDialog(false);
    }
  };

  useEffect(() => {
    loadOffers();
    loadBrands();
    loadProducts();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const data = await offersService.getAll();
      setOffers(data);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBrands = async () => {
    try {
      setLoadingBrands(true);
      const data = await brandsService.getBrands();
      setBrands(data);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoadingBrands(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await productsService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const resetDialog = () => {
    setSelectedOffer(null);
    setNewBrandName('');
    setSelectedProduct(null);
    setQuantity('');
    setPrice('');
  };



  const handleEdit = (offer: Offer) => {
    setSelectedOffer(offer);
    const brand = brands.find(b => b.id === offer.brandId);
    setNewBrandName(brand?.name || '');
    setOpenDialog(true);
  };

  const handleUpdateOffer = async () => {
    if (!selectedOffer) return;

    try {
      const updatedOffer = await offersService.update(selectedOffer.id, { brandId: parseInt(newBrandName) });
      setOffers(offers.map(o => o.id === selectedOffer.id ? updatedOffer : o));
      resetDialog();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating offer:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteQuoteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteQuoteId) handleDelete(deleteQuoteId);
  };

  const handleDelete = async (id: string) => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error('Yetkilendirme hatası');

      const response = await fetch(`https://baskili-isler-backend.onrender.com/quotes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        setDeleteError(errorData.message || 'Silme işlemi başarısız');
        setDeleteDialogOpen(false);
        return;
      }

      await loadOffers();
      setDeleteDialogOpen(false);
      setSnackbarMessage('Teklif başarıyla silindi!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error: any) {
      console.error('Error deleting offer:', error);
      setSnackbarMessage(error.message || 'Silme işlemi sırasında bir hata oluştu!');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setDeleteDialogOpen(false);
    }
  };

  const handleDetailsClick = (offer: Offer) => {
    setSelectedQuote(offer);
    setDrawerOpen(true);
  };

  const convertToOrder = async () => {
    if (!selectedQuote) return;
    try {
      setConvertingToOrder(true);
      setDrawerOpen(false);
      // Simülasyon
      await new Promise((r) => setTimeout(r, 1000));
    } catch (error) {
      console.error('Error converting to order:', error);
    } finally {
      setConvertingToOrder(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Teklifler</Typography>
        <Button variant="contained" onClick={() => {
          resetDialog();
          setOpenDialog(true);
        }}>Yeni Teklif Ekle</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Marka Adı</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>Geçerlilik Tarihi</TableCell>
              <TableCell>Oluşturulma Tarihi</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box sx={{ py: 4 }}>
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell>{offer.brandName}</TableCell>
                  <TableCell>{offer.status}</TableCell>
                  <TableCell>{new Date(offer.validUntil).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(offer.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(offer)}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleDeleteClick(offer.id.toString())}><DeleteIcon /></IconButton>
                    <Button onClick={() => handleDetailsClick(offer)} variant="outlined" startIcon={<ShoppingCartIcon />}>Detaylar</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Ekle / Güncelle Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => {
          resetDialog();
          setOpenDialog(false);
        }}
        sx={{
          '& .MuiDialog-paper': {
            width: '600px',
            maxWidth: '90vw',
            minHeight: '400px',
            height: '60vh',
            maxHeight: '90vh',
            overflow: 'auto'
          }
        }}
      >
        <DialogTitle>{selectedOffer ? 'Teklifi Düzenle' : 'Yeni Teklif Ekle'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <FormControl fullWidth>
              <InputLabel id="brand-select-label">Marka</InputLabel>
              <Select
                labelId="brand-select-label"
                value={newBrandName}
                onChange={(e: SelectChangeEvent) => setNewBrandName(e.target.value)}
                disabled={loadingBrands}
              >
                <MenuItem value="">Seçiniz</MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.name}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <IconButton
                  onClick={addFormItem}
                  size="medium"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    '&:hover': {
                      bgcolor: 'primary.dark'
                    }
                  }}
                >
                  +
                </IconButton>
              </Box>
            </FormControl>
            <Box>
              {formItems.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <FormControl sx={{ flex: 1 }}>
                    <InputLabel id={`product-select-label-${index}`}>Ürün</InputLabel>
                    <Select
                      labelId={`product-select-label-${index}`}
                      id={`product-select-${index}`}
                      value={item.productId}
                      label="Ürün"
                      onChange={(e) => updateFormItem(index, 'productId', e.target.value)}
                      disabled={loadingProducts}
                    >
                      <MenuItem value="0">Seçiniz</MenuItem>
                      {products.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                          {product.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    sx={{ flex: 1 }}
                    label="Adet"
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateFormItem(index, 'quantity', e.target.value)}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                  <TextField
                    sx={{ flex: 1 }}
                    label="Fiyat"
                    type="number"
                    value={item.price}
                    onChange={(e) => updateFormItem(index, 'price', e.target.value)}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                  {index > 0 && (
                    <IconButton
                      onClick={() => removeFormItem(index)}
                      sx={{
                        bgcolor: 'error.main',
                        color: 'white',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        '&:hover': {
                          bgcolor: 'error.dark'
                        }
                      }}
                    >
                      -
                    </IconButton>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            resetDialog();
            setOpenDialog(false);
          }}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={selectedOffer ? handleUpdateOffer : handleCreate}
            disabled={!newBrandName.trim() || formItems.length === 0 || formItems.some(item => !item.productId || !item.quantity || !item.price)}
          >
            {selectedOffer ? 'Güncelle' : 'Teklifi Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onayı */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Silme Onayı</DialogTitle>
        <DialogContent>
          <Typography variant="h6" color="error" align="center">
            Silmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Sil
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Hatası */}
      <Dialog open={!!deleteError} onClose={() => setDeleteError(null)}>
        <DialogTitle>Hata</DialogTitle>
        <DialogContent>
          <Typography variant="h6" color="error" align="center">
            {deleteError}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteError(null)}>Tamam</Button>
        </DialogActions>
      </Dialog>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: '500px', borderRadius: '16px 0 0 16px', border: '1px solid', borderColor: 'divider', p: 2 } }}
      >
        <Typography variant="h6" gutterBottom>Teklif Detayları</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Marka Adı: <strong>{selectedQuote?.brandName || 'Yükleniyor...'}</strong></Typography>
        </Box>
        {selectedQuote?.items && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ürün</TableCell>
                  <TableCell>Adet</TableCell>
                  <TableCell>Birim Fiyat</TableCell>
                  <TableCell>Toplam</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedQuote.items.map(item => (
                  <TableRow key={item.productId}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unitPrice} ₺</TableCell>
                    <TableCell>{item.lineTotal} ₺</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Box sx={{ mt: 3, textAlign: 'right' }}>
          <Button
            onClick={convertToOrder}
            variant="contained"
            startIcon={convertingToOrder ? <CircularProgress size={20} /> : <ArrowForwardIcon />}
            disabled={convertingToOrder}
          >
            {convertingToOrder ? 'Siparişe Dönüştürülüyor...' : 'Siparişe Dönüştür'}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Offers;

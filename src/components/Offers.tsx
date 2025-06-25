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
import {
  ArrowForward as ArrowForwardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { Offer } from '../types/offer';
import { offersService } from '../services/offers';
import { brandsService } from '../services/brands';
import { Brand } from '../types/brand';
import { productsService } from '../services/products';
import { Product } from '../types/product';

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

  const handleCreate = async () => {
    if (!newBrandName.trim() || !selectedProduct || !quantity || !price) return;

    try {
      const offer = await offersService.create({
        brandName: newBrandName,
        status: 'OFFER_SENT',
        totalPrice: parseFloat(price) * parseInt(quantity),
        validUntil: new Date().toISOString(),
        items: [
          {
            productId: selectedProduct.id,
            productName: selectedProduct.name,
            quantity: parseInt(quantity),
            unitPrice: parseFloat(price),
            lineTotal: parseFloat(price) * parseInt(quantity)
          }
        ]
      });
      setOffers([...offers, offer]);
      resetDialog();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleEdit = (offer: Offer) => {
    setSelectedOffer(offer);
    setNewBrandName(offer.brandName);
    setOpenDialog(true);
  };

  const handleUpdateOffer = async () => {
    if (!selectedOffer) return;

    try {
      const updatedOffer = await offersService.update(selectedOffer.id, { brandName: newBrandName });
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
      const response = await fetch(`https://baskili-isler-backend.onrender.com/quotes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Silme işlemi başarısız');

      await loadOffers();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting offer:', error);
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
                id="brand-select"
                value={newBrandName}
                label="Marka"
                onChange={(e) => setNewBrandName(e.target.value)}
                autoFocus
                disabled={loadingBrands}
              >
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.name}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id="product-select-label">Ürün</InputLabel>
                <Select
                  labelId="product-select-label"
                  id="product-select"
                  value={selectedProduct?.id.toString() || '0'}
                  label="Ürün"
                  onChange={(e) => {
                    const productId = parseInt(e.target.value);
                    const product = products.find(p => p.id === productId);
                    setSelectedProduct(product || null);
                  }}
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
                value={quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
              <TextField
                sx={{ flex: 1 }}
                label="Fiyat"
                type="number"
                value={price}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
                InputProps={{ inputProps: { min: 0 } }}
              />
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
            disabled={!newBrandName.trim() || !selectedProduct || !quantity || !price}
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

      {/* Drawer */}
      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: '500px', height: '90vh', borderRadius: '16px 16px 0 0', border: '1px solid', borderColor: 'divider', p: 2 } }}
      >
        <Typography variant="h6" gutterBottom>Teklif Detayları</Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Marka Adı: <strong>{selectedQuote?.brandName}</strong></Typography>
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

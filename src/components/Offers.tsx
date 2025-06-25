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
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  ShoppingCart as ShoppingCartIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { Offer } from '../types/offer';
import { offersService } from '../services/offers';

const Offers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Offer | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [convertingToOrder, setConvertingToOrder] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteQuoteId, setDeleteQuoteId] = useState<string | null>(null);

  useEffect(() => {
    loadOffers();
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

  const handleCreate = async () => {
    if (!newBrandName.trim()) return;

    try {
      const offer = await offersService.create({
        brandName: newBrandName,
        status: 'OFFER_SENT',
        totalPrice: 0,
        validUntil: new Date().toISOString(),
        items: []
      });
      setOffers([...offers, offer]);
      setNewBrandName('');
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
      setSelectedOffer(null);
      setNewBrandName('');
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating offer:', error);
    }
  };

  const handleUpdate = async (event: React.MouseEvent<HTMLButtonElement>, id: number, status: 'OFFER_SENT' | 'OFFER_ACCEPTED' | 'OFFER_REJECTED') => {
    event.preventDefault();
    try {
      const response = await fetch(`https://baskili-isler-backend.onrender.com/quotes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Güncelleme başarısız');
      }

      setOffers(prev => prev.map(o => o.id === id ? { ...o, status } : o));
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
    } catch (error) {
      console.error('Error converting to order:', error);
    } finally {
      setConvertingToOrder(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h5">Teklifler</Typography>
            <Button variant="contained" onClick={() => {
              setSelectedOffer(null);
              setNewBrandName('');
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
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell>{offer.brandName}</TableCell>
                    <TableCell>{offer.status}</TableCell>
                    <TableCell>{offer.validUntil}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEdit(offer)}><EditIcon /></IconButton>
                      <IconButton onClick={() => handleDeleteClick(offer.id.toString())}><DeleteIcon /></IconButton>
                      <Button onClick={() => handleDetailsClick(offer)} variant="outlined" startIcon={<ShoppingCartIcon />}>Detaylar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>{selectedOffer ? 'Teklifi Düzenle' : 'Yeni Teklif'}</DialogTitle>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                label="Marka Adı"
                fullWidth
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>İptal</Button>
              <Button variant="contained" onClick={selectedOffer ? handleUpdateOffer : handleCreate}>
                {selectedOffer ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
            <DialogTitle>Silme Onayı</DialogTitle>
            <DialogContent>
              <Typography variant="h6" color="error" align="center">
                Bu teklifi silmek istediğinizden emin misiniz?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
              <Button onClick={handleConfirmDelete} color="error" variant="contained">Sil</Button>
            </DialogActions>
          </Dialog>

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
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ürün</TableCell>
                    <TableCell>Adet</TableCell>
                    <TableCell>Birim Fiyat</TableCell>
                    <TableCell>Toplam</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedQuote?.items.map(item => (
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
        </>
      )}
    </Box>
  );
};

export default Offers;

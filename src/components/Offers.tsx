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
  ListItemIcon,
  Divider,
  Typography,
  CircularProgress,
  IconButton
} from '@mui/material';
import { ArrowForward as ArrowForwardIcon, Close as CloseIcon } from '@mui/icons-material';
import { ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { Offer } from '../types/offer';
import { offersService } from '../services/offers';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';


const Offers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Offer | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [convertingToOrder, setConvertingToOrder] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteQuoteId, setDeleteQuoteId] = useState<string | null>(null);


  const handleDetailsClick = (offer: Offer) => {
    setSelectedQuote(offer);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedQuote(null);
  };

  const convertToOrder = async () => {
    if (!selectedQuote) return;

    try {
      setConvertingToOrder(true);
      // TODO: Implement the actual conversion logic here
      // This would typically involve:
      // 1. Creating a new order with the quote's items
      // 2. Updating the quote status
      // 3. Showing a success message

      // For now, just close the drawer and show a message
      setDrawerOpen(false);
      // You can add a toast or alert here to show success
    } catch (error) {
      console.error('Error converting to order:', error);
      // Handle error (e.g., show error message)
    } finally {
      setConvertingToOrder(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteQuoteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteQuoteId) {
      handleDelete(deleteQuoteId);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const data = await offersService.getAll();
      setOffers(data);
    } catch (error) {
      console.error('Error loading offers:', error);
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

      // Update the local state
      setOffers(prevOffers => 
        prevOffers.map(prevOffer => 
          prevOffer.id === id ? { ...prevOffer, status } : prevOffer
        )
      );
    } catch (error) {
      console.error('Error updating offer:', error);
    }
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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`https://baskili-isler-backend.onrender.com/quotes/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Silme işlemi başarısız');
      }

      await loadOffers();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting offer:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Teklifler</h2>
        <Button variant="contained" color="primary" onClick={() => {
          setSelectedOffer(null);
          setNewBrandName('');
          setOpenDialog(true);
        }}>
          Yeni Teklif Ekle
        </Button>
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
                  <IconButton onClick={() => handleEdit(offer)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(offer.id.toString())}>
                    <DeleteIcon />
                  </IconButton>
                  <Button
                      onClick={() => handleDetailsClick(offer)}
                      variant="outlined"
                      startIcon={<ShoppingCartIcon />}
                  >
                    Detaylar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>



      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Silme Onayı</DialogTitle>
        <DialogContent>
          <Typography variant="h6" color="error" align="center">
            Bu teklifi silmek istediğinizden emin misiniz?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            İptal
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Sil
          </Button>
        </DialogActions>
      </Dialog>

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
          <Button 
            variant="contained" 
            onClick={async (event) => {
              if (selectedOffer) {
                await handleUpdate(event, selectedOffer.id, selectedOffer.status);
              } else {
                await handleCreate();
              }
            }}
          >
            {selectedOffer ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer
        anchor="bottom"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: '500px',
            height: '90vh',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            boxShadow: 3,
            marginLeft: 'auto',
            borderRadius: '16px 16px 0 0',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <Box sx={{ 
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 2,
          mb: 3
        }}>
          <Typography variant="h6" component="h3" sx={{ mb: 2 }}>
            Teklif Detayları
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" color="text.secondary">
                Marka Adı:
              </Typography>
              <Typography variant="subtitle1" color="primary">
                {selectedQuote?.brandName}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            bgcolor: 'background.paper',
            borderRadius: 1,
            p: 2,
            border: '1px solid',
            borderColor: 'divider',
            mb: 3
          }}>
            <Typography variant="h6" component="h4" sx={{ mb: 2 }}>
              Ürünler
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Ürün</TableCell>
                    <TableCell>Adet</TableCell>
                    <TableCell>Fiyat</TableCell>
                    <TableCell>Toplam</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedQuote?.items.map((item) => (
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
          </Box>

          <Box sx={{ 
            position: 'absolute',
            bottom: 16,
            right: 16,
            zIndex: 1
          }}>
            <Button
              onClick={() => convertToOrder()}
              variant="contained"
              startIcon={convertingToOrder ? <CircularProgress size={20} /> : <ArrowForwardIcon />}
              disabled={convertingToOrder}
              sx={{ 
                bgcolor: '#4CAF50',
                borderRadius: 2,
                px: 3,
                py: 1,
                fontSize: '0.9rem',
                fontWeight: 500,
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  bgcolor: '#45a049',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 3px 5px rgba(0,0,0,0.15)'
                }
              }}
            >
              Siparişe Dönüştür
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Offers;

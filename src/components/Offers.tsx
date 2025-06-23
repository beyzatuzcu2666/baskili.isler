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
  DialogActions
} from '@mui/material';
import { Offer } from '../types/offer';
import { offersService } from '../services/offers';

const Offers = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [newBrandName, setNewBrandName] = useState('');

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
      const offer = await offersService.create({ brandName: newBrandName });
      setOffers([...offers, offer]);
      setNewBrandName('');
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleEdit = async (offer: Offer) => {
    setSelectedOffer(offer);
    setNewBrandName(offer.brandName);
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
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

  const handleDelete = async (id: number) => {
    try {
      await offersService.delete(id);
      setOffers(offers.filter(o => o.id !== id));
    } catch (error) {
      console.error('Error deleting offer:', error);
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
              <TableCell>Oluşturulma Tarihi</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {offers.map((offer) => (
              <TableRow key={offer.id}>
                <TableCell>{offer.brandName}</TableCell>
                <TableCell>{new Date(offer.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    onClick={() => handleEdit(offer)}
                  >
                    Düzenle
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={() => handleDelete(offer.id)}
                  >
                    Sil
                  </Button>
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
          <Button 
            variant="contained" 
            onClick={selectedOffer ? handleUpdate : handleCreate}
          >
            {selectedOffer ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Offers;

import React, { useState } from 'react';
import http from '../services/http';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
} from '@mui/material';

interface BrandFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    contactEmail: string;
    contactPhone: string;
  }) => void;
  initialData?: {
    name: string;
    contactEmail: string;
    contactPhone: string;
  };
  title: string;
  isUpdate?: boolean;
  brandId?: number;
}

export const BrandFormModal: React.FC<BrandFormModalProps> = ({ open, onClose, onSubmit, initialData, title, isUpdate, brandId }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        contactEmail: initialData.contactEmail,
        contactPhone: initialData.contactPhone,
      });
    }
  }, [initialData]);

  const handleSubmit = async () => {
    try {
      if (isUpdate && brandId) {
        await http.patch(`/brands/${brandId}`, formData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Marka Adı"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="E-posta"
            type="email"
            value={formData.contactEmail}
            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Telefon Numarası"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            margin="normal"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

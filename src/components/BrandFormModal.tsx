import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
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
  loading?: boolean;
}

export const BrandFormModal: React.FC<BrandFormModalProps> = ({ open, onClose, onSubmit, initialData, title, isUpdate, brandId, loading = false }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    contactEmail: initialData?.contactEmail || '',
    contactPhone: initialData?.contactPhone || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
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
        <Button onClick={onClose} disabled={loading || isSubmitting}>İptal</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || isSubmitting}
        >
          {(loading || isSubmitting) ? (
            <>
              <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
              {isUpdate ? 'Güncelleniyor...' : 'Kaydediliyor...'}
            </>
          ) : (
            'Kaydet'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

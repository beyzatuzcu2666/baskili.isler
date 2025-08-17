import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { dealersService } from '../services/dealers';
import { Dealer } from '../types/dealer';
import {
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Tooltip,
  Stack,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const Dealers: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDealerId, setDeleteDealerId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phoneNumber: '',
    taxNumber: '',
    admin: {
      name: '',
      email: '',
      phoneNumber: ''
    }
  });
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const data = await dealersService.getDealers();
        console.log('Backend\'den gelen dealer verisi:', data);
        setDealers(data);
      } catch (err) {
        setError('Bayiler yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    fetchDealers();
  }, []);

  // URL parametresi ile modal'ı otomatik aç
  useEffect(() => {
    const modalParam = searchParams.get('modal');
    if (modalParam === 'add') {
      handleOpenAddModal();
      // URL'den modal parametresini temizle
      navigate('/dealers', { replace: true });
    }
  }, [searchParams, navigate]);

  // Ana bayi'yi (ID=1) filtrele
  const filteredDealers = dealers
    .filter(dealer => dealer.id !== 1)
    .filter(dealer =>
      dealer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealer?.admin?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dealer?.phoneNumber?.includes(searchTerm)
    );

  const handleOpenAddModal = () => {
    setFormData({ 
      name: '', 
      address: '', 
      phoneNumber: '', 
      taxNumber: '', 
      admin: { name: '', email: '', phoneNumber: '' }
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dealer: Dealer) => {
    setSelectedDealer(dealer);
    setFormData({
      name: dealer?.name || '',
      address: dealer?.address || '',
      phoneNumber: dealer?.phoneNumber || '',
      taxNumber: dealer?.taxNumber || '',
      admin: {
        name: dealer?.admin?.name || '',
        email: dealer?.admin?.email || '',
        phoneNumber: dealer?.admin?.phoneNumber || ''
      }
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedDealer(null);
    setFormError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) return 'Bayi adı zorunlu';
    if (!formData.address.trim()) return 'Adres zorunlu';
    if (!formData.phoneNumber.trim()) return 'Telefon zorunlu';
    if (!formData.admin.name.trim()) return 'Admin adı zorunlu';
    if (!formData.admin.email.trim()) return 'Admin email zorunlu';
    if (!formData.admin.phoneNumber.trim()) return 'Admin telefon zorunlu';
    
    // Email format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.admin.email)) {
      return 'Geçerli bir email adresi giriniz';
    }
    
    // Telefon format kontrolü (sadece rakamlar ve minimum uzunluk)
    const cleanPhone = formData.phoneNumber.replace(/\D/g, '');
    const cleanAdminPhone = formData.admin.phoneNumber.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      return 'Telefon numarası en az 10 haneli olmalıdır';
    }
    
    if (cleanAdminPhone.length < 10) {
      return 'Admin telefon numarası en az 10 haneli olmalıdır';
    }
    
    return null;
  };

  const handleAddDealer = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setIsCreating(true);
    try {
      // Telefon numaralarını backend'in beklediği formata çevir
      const formatPhoneNumber = (phone: string) => {
        const clean = phone.replace(/\D/g, '');
        if (clean.startsWith('90')) {
          return `+${clean}`;
        } else if (clean.startsWith('0')) {
          return `+90${clean.substring(1)}`;
        } else if (clean.length === 10) {
          return `+90${clean}`;
        } else {
          return `+90${clean}`;
        }
      };

      const formattedData = {
        ...formData,
        phoneNumber: formatPhoneNumber(formData.phoneNumber),
        admin: {
          ...formData.admin,
          phoneNumber: formatPhoneNumber(formData.admin.phoneNumber)
        }
      };
      
      await dealersService.createDealer(formattedData);
      const updated = await dealersService.getDealers();
      setDealers(updated);
      setIsModalOpen(false);
      toast.success('Bayi başarıyla eklendi');
    } catch (e: any) {
      console.error('Dealer creation error:', e);
      if (e?.response?.data?.message) {
        setFormError(e.response.data.message);
      } else {
        setFormError('Bayi eklenemedi');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditDealer = async () => {
    if (!selectedDealer) return;
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setIsUpdating(true);
    try {
      // Sadece bayi bilgilerini güncelle (admin bilgileri hariç)
      const dealerData = {
        name: formData.name,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        taxNumber: formData.taxNumber
      };
      await dealersService.updateDealer(selectedDealer.id, dealerData);
      const updated = await dealersService.getDealers();
      setDealers(updated);
      setIsEditModalOpen(false);
      toast.success('Bayi güncellendi');
    } catch (e) {
      setFormError('Bayi güncellenemedi');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteDealer = async (id: number) => {
    setIsDeleting(true);
    try {
      await dealersService.deleteDealer(id);
      setDealers(await dealersService.getDealers());
      toast.success('Bayi silindi');
    } catch (e) {
      toast.error('Bayi silinemedi');
    } finally {
      setIsDeleting(false);
      setDeleteDealerId(null);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>Bayiler</Typography>
        <Tooltip title="Bayi Ekle">
          <Fab color="primary" size="small" onClick={handleOpenAddModal}>
            <AddIcon />
          </Fab>
        </Tooltip>
      </Box>
      <TextField
        size="small"
        placeholder="Ara..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        sx={{ mb: 2, width: 300 }}
      />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Adı</TableCell>
                <TableCell>Adres</TableCell>
                <TableCell>Telefon</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Admin E-posta</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDealers.map(dealer => (
                <TableRow key={dealer.id}>
                  <TableCell>{dealer?.name || 'Ad bilgisi yok'}</TableCell>
                  <TableCell>{dealer?.address || 'Adres bilgisi yok'}</TableCell>
                  <TableCell>{dealer?.phoneNumber || 'Telefon bilgisi yok'}</TableCell>
                  <TableCell>{dealer?.admin?.name || 'Admin adı yok'}</TableCell>
                  <TableCell>{dealer?.admin?.email || 'Admin e-posta yok'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => navigate(`/dealers/${dealer.id}`)} color="primary">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton onClick={() => handleOpenEditModal(dealer)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => setDeleteDealerId(dealer.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Ekle Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Bayi Ekle</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Bayi Adı"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Adres"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Telefon"
              value={formData.phoneNumber}
              onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Vergi Numarası"
              value={formData.taxNumber}
              onChange={e => setFormData({ ...formData, taxNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Admin Adı"
              value={formData.admin.name}
              onChange={e => setFormData({ ...formData, admin: { ...formData.admin, name: e.target.value } })}
              fullWidth
              required
            />
            <TextField
              label="Admin E-posta"
              value={formData.admin.email}
              onChange={e => setFormData({ ...formData, admin: { ...formData.admin, email: e.target.value } })}
              fullWidth
              required
              type="email"
            />
            <TextField
              label="Admin Telefon"
              value={formData.admin.phoneNumber}
              onChange={e => setFormData({ ...formData, admin: { ...formData.admin, phoneNumber: e.target.value } })}
              fullWidth
              required
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>İptal</Button>
          <Button onClick={handleAddDealer} variant="contained" disabled={isCreating}>
            {isCreating ? 'Ekleniyor...' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Düzenle Modal */}
      <Dialog open={isEditModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Bayi Düzenle</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Bayi Adı"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Adres"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Telefon"
              value={formData.phoneNumber}
              onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Vergi Numarası"
              value={formData.taxNumber}
              onChange={e => setFormData({ ...formData, taxNumber: e.target.value })}
              fullWidth
            />
            <TextField
              label="Admin Adı"
              value={formData.admin.name}
              fullWidth
              disabled
              helperText="Admin bilgileri ayrı olarak güncellenir"
            />
            <TextField
              label="Admin E-posta"
              value={formData.admin.email}
              fullWidth
              disabled
            />
            <TextField
              label="Admin Telefon"
              value={formData.admin.phoneNumber}
              fullWidth
              disabled
            />
            {formError && <Alert severity="error">{formError}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>İptal</Button>
          <Button onClick={handleEditDealer} variant="contained" disabled={isUpdating}>
            {isUpdating ? 'Güncelleniyor...' : 'Güncelle'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Silme Onayı */}
      <Dialog open={!!deleteDealerId} onClose={() => setDeleteDealerId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Bayi Sil</DialogTitle>
        <DialogContent>
          <Typography>Bu bayiyi silmek istediğinize emin misiniz?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDealerId(null)}>İptal</Button>
          <Button onClick={() => deleteDealerId && handleDeleteDealer(deleteDealerId)} color="error" variant="contained" disabled={isDeleting}>
            {isDeleting ? 'Siliniyor...' : 'Sil'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dealers; 
import React, { useEffect, useState } from 'react';
import { 
  Button, 
  Box, 
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
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { DealerWizardModal } from './DealerWizardModal';
import { ConfirmationDialog } from './ConfirmationDialog';
import { PageHeader } from './PageHeader';
import DealerDetailModal from './DealerDetailModal';
import { useDealer } from '../contexts/DealerContext';
import { dealersService } from '../services/dealers';
import { Dealer } from '../types/dealer';
import { toast } from 'react-toastify';

const Dealers: React.FC = () => {
  const { selectedDealer, setSelectedDealer, availableDealers, refreshDealers, isSuperAdmin } = useDealer();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isWizardModalOpen, setIsWizardModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteDealerId, setDeleteDealerId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDealerForDetail, setSelectedDealerForDetail] = useState<Dealer | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    const loadDealers = async () => {
      try {
        await refreshDealers();
        setError(null);
      } catch (err) {
        setError('Bayiler yüklenirken bir hata oluştu');
        console.error('Dealers fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (isSuperAdmin) {
      loadDealers();
    } else {
      setLoading(false);
    }
  }, [refreshDealers, isSuperAdmin]);

  const filteredDealers = availableDealers.filter(dealer =>
    dealer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealer.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteDealer = async (dealerId: number) => {
    setDeleteDealerId(dealerId);
    setConfirmDelete(true);
  };

  const confirmDeleteDealer = async () => {
    if (deleteDealerId) {
      setIsDeleting(true);
      try {
        await dealersService.delete(deleteDealerId);
        await refreshDealers();
        setConfirmDelete(false);
        setDeleteDealerId(null);
        setError(null);
        toast.success('Bayi başarıyla silindi');
      } catch (error: any) {
        console.error('Error deleting dealer:', error);
        const errorMessage = error.message || 'Bayi silinirken bir hata oluştu';
        setError(errorMessage);
        toast.error(errorMessage);
        setConfirmDelete(false);
        setDeleteDealerId(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleWizardSuccess = async () => {
    await refreshDealers();
    setIsWizardModalOpen(false);
  };

  const handleDealerClick = (dealer: Dealer) => {
    setSelectedDealerForDetail(dealer);
    setIsDetailModalOpen(true);
  };

  const handleDetailModalClose = () => {
    setIsDetailModalOpen(false);
    setSelectedDealerForDetail(null);
  };

  if (!isSuperAdmin) {
    return (
      <Box sx={{ 
        p: { xs: 2, sm: 3 },
        pl: { xs: 2, sm: 3, md: 3 },
        pr: { xs: 2, sm: 3, md: 3 },
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        minHeight: '100vh',
        backgroundColor: 'transparent'
      }}>
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece Super Admin kullanıcıları bayi yönetimi yapabilir.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      pl: { xs: 2, sm: 3, md: 3 },
      pr: { xs: 2, sm: 3, md: 3 },
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      minHeight: '100vh',
      backgroundColor: 'transparent'
    }}>
      {/* Page Header */}
      <PageHeader 
        title="Bayi Yönetimi"
        subtitle="Bayilerinizi yönetin, düzenleyin ve aktif bayi seçin"
      />

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
        <Card sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ backgroundColor: '#8b5cf620', color: '#8b5cf6' }}>
                <BusinessIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  {availableDealers.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Toplam Bayi
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ backgroundColor: '#10b98120', color: '#10b981' }}>
                <CheckCircleIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  {availableDealers.filter(d => d.isActive).length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Aktif Bayi
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ border: '1px solid #e5e7eb', borderRadius: 2 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>
                <BusinessIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937' }}>
                  {selectedDealer ? selectedDealer.name : 'Seçilmedi'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Aktif Bayi
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Search and Actions */}
      <Card sx={{ mb: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              placeholder="Bayi ara..."
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
                    borderColor: '#8b5cf6',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8b5cf6',
                    borderWidth: '2px',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsWizardModalOpen(true)}
              sx={{
                backgroundColor: '#8b5cf6',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                '&:hover': {
                  backgroundColor: '#7c3aed',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(139, 92, 246, 0.4)',
                },
              }}
            >
              Yeni Bayi
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

      {/* Loading */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        /* Main Table */
        <Card sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                    Bayi
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                    İletişim Bilgileri
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                    Durum
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                    Aktif Bayi
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                    İşlemler
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDealers.map((dealer, index) => (
                  <TableRow 
                    key={dealer.id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f9fafb' },
                      borderBottom: index === filteredDealers.length - 1 ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: '#f8fafc',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5
                          },
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => handleDealerClick(dealer)}
                      >
                        <Avatar 
                          sx={{ 
                            backgroundColor: '#8b5cf620',
                            color: '#8b5cf6',
                            width: 40,
                            height: 40,
                            fontWeight: 600
                          }}
                        >
                          {dealer.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                            {dealer.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {dealer.code}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                          <Typography variant="body2" sx={{ color: '#374151' }}>
                            {dealer.contactEmail}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                          <Typography variant="body2" sx={{ color: '#374151' }}>
                            {dealer.contactPhone}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={dealer.isActive ? 'Aktif' : 'Pasif'}
                        color={dealer.isActive ? 'success' : 'default'}
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Button
                        variant={selectedDealer?.id === dealer.id ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setSelectedDealer(dealer)}
                        sx={{
                          backgroundColor: selectedDealer?.id === dealer.id ? '#10b981' : 'transparent',
                          color: selectedDealer?.id === dealer.id ? 'white' : '#10b981',
                          borderColor: '#10b981',
                          '&:hover': {
                            backgroundColor: selectedDealer?.id === dealer.id ? '#059669' : '#10b98120',
                          }
                        }}
                      >
                        {selectedDealer?.id === dealer.id ? 'Aktif' : 'Seç'}
                      </Button>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Düzenle">
                          <IconButton 
                            size="small"
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
                            onClick={() => handleDeleteDealer(dealer.id)}
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#8b5cf6',
          '&:hover': { backgroundColor: '#7c3aed' },
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => setIsWizardModalOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Modals */}
      <DealerWizardModal
        open={isWizardModalOpen}
        onClose={() => setIsWizardModalOpen(false)}
        onSuccess={handleWizardSuccess}
      />
      
      <ConfirmationDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteDealer}
        title="Bayi Silme Onayı"
        message="Bu bayiyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
        loading={isDeleting}
        confirmText={isDeleting ? 'Siliniyor...' : 'Sil'}
      />

      <DealerDetailModal
        open={isDetailModalOpen}
        onClose={handleDetailModalClose}
        dealer={selectedDealerForDetail}
      />
    </Box>
  );
};

export default Dealers; 
import React, { useEffect, useState } from 'react';
import { brandsService } from '../services/brands';
import { Brand } from '../services/brands';
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
  DialogActions
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { BrandFormModal } from './BrandFormModal';
import { ConfirmationDialog } from './ConfirmationDialog';

import { toast } from 'react-toastify';

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteBrandId, setDeleteBrandId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewBrand, setViewBrand] = useState<Brand | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await brandsService.getBrands();
        if (!Array.isArray(data)) {
          throw new Error('Invalid brands data format');
        }
        setBrands(data);
      } catch (err) {
        setError('Brands data could not be loaded');
        console.error('Brands fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brand.contactPhone.includes(searchTerm)
  );

  const handleAddBrand = async (data: {
    name: string;
    contactEmail: string;
    contactPhone: string;
  }) => {
    setIsCreating(true);
    try {
      const createdBrand = await brandsService.createBrand(data);
      const updatedBrands = await brandsService.getBrands();
      setBrands(updatedBrands);
      setError(null);
      toast.success('Müşteri başarıyla eklendi');
      return createdBrand;
    } catch (error) {
      console.error('Error adding brand:', error);
      const errorMessage = 'Müşteri eklenirken bir hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditBrand = async (brandId: number, data: {
    name: string;
    contactEmail: string;
    contactPhone: string;
  }) => {
    setIsUpdating(true);
    try {
      await brandsService.updateBrand(brandId, data);
      const updatedBrands = await brandsService.getBrands();
      setBrands(updatedBrands);
      setError(null);
      toast.success('Müşteri başarıyla güncellendi');
    } catch (error) {
      console.error('Error updating brand:', error);
      const errorMessage = 'Müşteri güncellenirken bir hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteBrand = async (brandId: number) => {
    setDeleteBrandId(brandId);
    setConfirmDelete(true);
  };

  const confirmDeleteBrand = async () => {
    if (deleteBrandId) {
      setIsDeleting(true);
      try {
        await brandsService.deleteBrand(deleteBrandId);
        const updatedBrands = await brandsService.getBrands();
        setBrands(updatedBrands);
        setConfirmDelete(false);
        setDeleteBrandId(null);
        setError(null);
        toast.success('Müşteri başarıyla silindi');
      } catch (error: any) {
        console.error('Error deleting brand:', error);
        
        // Backend'den gelen hata mesajını analiz et
        let errorMessage = 'Müşteri silinirken bir hata oluştu';
        
        if (error?.response?.data?.message) {
          const backendMessage = error.response.data.message;
          
          if (backendMessage.includes('Süreç devam ediyor')) {
            errorMessage = 'Bu müşteri silinemez çünkü aktif sipariş, teklif veya diğer süreçleri bulunmaktadır. Önce ilgili işlemleri tamamlayın veya iptal edin.';
          } else if (backendMessage.includes('marka silinemez')) {
            errorMessage = 'Bu müşteri şu anda kullanımda olduğu için silinemez. Lütfen ilgili kayıtları kontrol edin.';
          } else {
            errorMessage = backendMessage;
          }
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
        setConfirmDelete(false);
        setDeleteBrandId(null);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleView = (brand: Brand) => {
    setViewBrand(brand);
    setViewModalOpen(true);
  };

  // Statistics Cards Data
  const statsData = [
    {
      title: 'Toplam Müşteri',
      value: brands.length,
      icon: <BusinessIcon />,
      color: '#10b981',
      trend: '+12%'
    },
    {
      title: 'Bu Yıl Eklenen',
      value: Math.floor(brands.length * 0.7),
      icon: <TrendingUpIcon />,
      color: '#f97316',
      trend: '+18%'
    },
    {
      title: 'Bu Ay Eklenen',
      value: Math.floor(brands.length * 0.3),
      icon: <AddIcon />,
      color: '#1e3a8a',
      trend: '+25%'
    }
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress size={40} sx={{ color: '#10b981' }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 },
      pl: { xs: 2, sm: 3, md: 3 }, // Sidebar'a göre ayarlanmış sol padding
      pr: { xs: 2, sm: 3, md: 3 },
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      minHeight: '100vh',
      backgroundColor: 'transparent'
    }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
          Müşteri Yönetimi
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Müşterilerinizi yönetin, düzenleyin ve takip edin
        </Typography>
      </Box>

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
        {statsData.map((stat, index) => (
          <Box key={index}>
            <Card 
              sx={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Chip 
                      label={stat.trend} 
                      size="small" 
                      sx={{ 
                        backgroundColor: `${stat.color}20`,
                        color: stat.color,
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }} 
                    />
                  </Box>
                  <Avatar 
                    sx={{ 
                      backgroundColor: `${stat.color}20`,
                      color: stat.color,
                      width: 56,
                      height: 56
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Action Bar */}
      <Card sx={{ mb: 3, border: '1px solid #e5e7eb', borderRadius: 2 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              placeholder="Müşteri ara..."
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
                    borderColor: '#10b981',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10b981',
                    borderWidth: '2px',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsModalOpen(true)}
              sx={{
                backgroundColor: '#10b981',
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  backgroundColor: '#059669',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                },
              }}
            >
              Yeni Müşteri
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

      {/* Main Table */}
      <Card sx={{ border: '1px solid #e5e7eb', borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Müşteri
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  İletişim Bilgileri
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Kayıt Tarihi
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  İşlemler
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBrands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <BusinessIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                        {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz müşteri eklenmemiş'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                                 {searchTerm ? 'Farklı arama terimleri deneyin' : 'İlk müşterinizi eklemek için "Yeni Müşteri" butonuna tıklayın'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
                ) : (
                filteredBrands.map((brand, index) => (
                  <TableRow 
                    key={brand.id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f9fafb' },
                      borderBottom: index === filteredBrands.length - 1 ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            backgroundColor: '#10b98120',
                            color: '#10b981',
                            width: 40,
                            height: 40,
                            fontWeight: 600
                          }}
                          src={brand.logoUrl || undefined}
                        >
                          {!brand.logoUrl && brand.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                            {brand.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            ID: {brand.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <EmailIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                          <Typography variant="body2" sx={{ color: '#374151' }}>
                            {brand.contactEmail}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                          <Typography variant="body2" sx={{ color: '#374151' }}>
                            {brand.contactPhone}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ color: '#6b7280' }}>
                        {new Date().toLocaleDateString('tr-TR')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Görüntüle">
                          <IconButton 
                            size="small"
                            onClick={() => handleView(brand)}
                            sx={{ 
                              color: '#6b7280',
                              '&:hover': { backgroundColor: '#f3f4f6', color: '#374151' }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Düzenle">
                          <IconButton 
                            size="small"
                          onClick={() => {
                            setSelectedBrand(brand);
                            setIsEditModalOpen(true);
                          }}
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
                          onClick={() => handleDeleteBrand(brand.id)}
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
                  ))
                )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#10b981',
          '&:hover': { backgroundColor: '#059669' },
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* View Brand Dialog */}
      <Dialog open={viewModalOpen} onClose={() => setViewModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#1f2937', pb: 2 }}>
          Müşteri Detayları
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {viewBrand && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Brand Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, backgroundColor: '#f9fafb', borderRadius: 2 }}>
                <Avatar 
                  sx={{ 
                    backgroundColor: '#10b98120',
                    color: '#10b981',
                    width: 56,
                    height: 56,
                    fontWeight: 600,
                    fontSize: '1.5rem'
                  }}
                  src={viewBrand.logoUrl || undefined}
                >
                  {!viewBrand.logoUrl && viewBrand.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 0.5 }}>
                    {viewBrand.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    ID: {viewBrand.id}
                  </Typography>
                </Box>
              </Box>

              {/* Brand Details */}
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                    İletişim E-postası
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#374151' }}>
                      {viewBrand.contactEmail}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                    İletişim Telefonu
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#374151' }}>
                      {viewBrand.contactPhone}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                    Müşteri ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500, color: '#374151' }}>
                    #{viewBrand.id}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setViewModalOpen(false)}
            sx={{ 
              color: '#6b7280',
              borderRadius: 2,
              px: 3,
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            Kapat
          </Button>
          {viewBrand && (
            <Button 
              onClick={() => {
                setViewModalOpen(false);
                setSelectedBrand(viewBrand);
                setIsEditModalOpen(true);
              }}
              variant="contained"
              sx={{
                backgroundColor: '#10b981',
                borderRadius: 2,
                px: 3,
                '&:hover': { backgroundColor: '#059669' }
              }}
            >
              Düzenle
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modals */}
      <BrandFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddBrand}
        title="Müşteri Ekle"
        isUpdate={false}
        loading={isCreating}
      />
      <BrandFormModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => handleEditBrand(selectedBrand?.id || 0, data)}
        initialData={selectedBrand || undefined}
        title="Müşteri Güncelle"
        isUpdate={true}
        brandId={selectedBrand?.id}
        loading={isUpdating}
      />
      <ConfirmationDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteBrand}
        title="Müşteri Silme Onayı"
        message="Bu müşteriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz. Eğer müşteri ile ilişkili aktif sipariş, teklif veya diğer süreçler varsa silme işlemi başarısız olacaktır."
        loading={isDeleting}
        confirmText={isDeleting ? 'Siliniyor...' : 'Sil'}
      />
    </Box>
  );
};

export default Brands;

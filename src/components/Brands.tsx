import React, { useEffect, useState } from 'react';
import { brandsService } from '../services/brands';
import { Brand } from '../services/brands';
import { authService } from '../services/auth';
import { useDealer } from '../contexts/DealerContext';
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
  const { selectedDealer } = useDealer();
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
  const [mostQuotedBrand, setMostQuotedBrand] = useState<{
    brandId: number;
    brandName: string;
    quoteCount: number;
    totalRevenue: number;
  } | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const userRole = authService.getUserRole();
        
        let data;
        if (userRole === 'DEALER_ADMIN') {
          // DEALER_ADMIN için sadece kendi bayisinin müşterilerini getir
          data = await brandsService.getDealerBrands();
        } else if (userRole === 'SUPER_ADMIN' && selectedDealer) {
          // SUPER_ADMIN için seçili dealer'ın müşterilerini getir
          data = await brandsService.getDealerBrands(selectedDealer.id);
        } else {
          // SUPER_ADMIN için tüm müşterileri getir (dealer seçilmemişse)
          data = await brandsService.getBrands();
        }
        
        if (!Array.isArray(data)) {
          throw new Error('Invalid brands data format');
        }
        setBrands(data);
        console.log('Loaded brands:', data); // Debug için
      } catch (err) {
        setError('Brands data could not be loaded');
        console.error('Brands fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
    loadMostQuotedBrand();
  }, [selectedDealer]);

  const loadMostQuotedBrand = async () => {
    try {
      const userRole = authService.getUserRole();
      let data;
      
      if (userRole === 'SUPER_ADMIN' && selectedDealer) {
        data = await brandsService.getMostQuotedBrand(selectedDealer.id);
      } else {
        data = await brandsService.getMostQuotedBrand();
      }
      
      setMostQuotedBrand(data);
    } catch (err) {
      console.error('Most quoted brand load error:', err);
    }
  };

  const filteredBrands = brands
    .filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.contactPhone.includes(searchTerm)
    )
    .sort((a, b) => {
      // createdAt alanına göre sırala (en yeni önce)
      if (!a.createdAt && !b.createdAt) return 0;
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime(); // En yeni önce
    });

  const handleAddBrand = async (data: {
    name: string;
    contactEmail: string;
    contactPhone: string;
    assignedUserId?: number;
  }) => {
    // SUPER_ADMIN için dealer ID kontrolü
    const userRole = authService.getUserRole();
    if (userRole === 'SUPER_ADMIN' && !selectedDealer) {
      toast.error('Lütfen önce bir bayi seçin');
      return;
    }

    setIsCreating(true);
    try {
      // SUPER_ADMIN için dealer ID ekle
      const createData = {
        ...data,
        dealerId: userRole === 'SUPER_ADMIN' ? selectedDealer?.id : undefined
      };

      const createdBrand = await brandsService.createBrand(createData);
      
      // Sayfa yenile - dealer'a göre doğru verileri getir
      let updatedBrands;
      
      if (userRole === 'DEALER_ADMIN') {
        updatedBrands = await brandsService.getDealerBrands();
      } else if (userRole === 'SUPER_ADMIN' && selectedDealer) {
        updatedBrands = await brandsService.getDealerBrands(selectedDealer.id);
      } else {
        updatedBrands = await brandsService.getBrands();
      }
      
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
    assignedUserId?: number;
  }) => {
    setIsUpdating(true);
    try {
      await brandsService.updateBrand(brandId, data);
      
      // Sayfa yenile - dealer'a göre doğru verileri getir
      const userRole = authService.getUserRole();
      let updatedBrands;
      
      if (userRole === 'DEALER_ADMIN') {
        updatedBrands = await brandsService.getDealerBrands();
      } else if (userRole === 'SUPER_ADMIN' && selectedDealer) {
        updatedBrands = await brandsService.getDealerBrands(selectedDealer.id);
      } else {
        updatedBrands = await brandsService.getBrands();
      }
      
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
        
        // Sayfa yenile - dealer'a göre doğru verileri getir
        const userRole = authService.getUserRole();
        let updatedBrands;
        
        if (userRole === 'DEALER_ADMIN') {
          updatedBrands = await brandsService.getDealerBrands();
        } else if (userRole === 'SUPER_ADMIN' && selectedDealer) {
          updatedBrands = await brandsService.getDealerBrands(selectedDealer.id);
        } else {
          updatedBrands = await brandsService.getBrands();
        }
        
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

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        {/* Toplam Marka */}
        <Card sx={{ flex: '1 1 250px', background: 'linear-gradient(135deg, #3b82f615 0%, #3b82f608 100%)', border: '1px solid #3b82f620' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                  {brands.length}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Toplam Marka
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#3b82f620', color: '#3b82f6' }}>
                <BusinessIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        {/* En Çok Teklif Alan Marka */}
        <Card sx={{ flex: '1 1 250px', background: 'linear-gradient(135deg, #ef444415 0%, #ef444408 100%)', border: '1px solid #ef444420' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#ef4444', mb: 0.5 }}>
                  {mostQuotedBrand?.quoteCount || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {mostQuotedBrand?.brandName || 'Marka Yok'}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                  En Çok Teklif Alan
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#ef444420', color: '#ef4444', ml: 1 }}>
                <TrendingUpIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>

        {/* Bu Ay Eklenen */}
        <Card sx={{ flex: '1 1 250px', background: 'linear-gradient(135deg, #10b98115 0%, #10b98108 100%)', border: '1px solid #10b98120' }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                  {(() => {
                    const thisMonthBrands = brands.filter(brand => {
                      console.log('Brand data:', brand); // Debug için
                      if (!brand.createdAt) return false;
                      const brandDate = new Date(brand.createdAt);
                      const now = new Date();
                      const isThisMonth = brandDate.getMonth() === now.getMonth() && 
                                        brandDate.getFullYear() === now.getFullYear();
                      console.log('Brand:', brand.name, 'Date:', brand.createdAt, 'IsThisMonth:', isThisMonth);
                      return isThisMonth;
                    });
                    console.log('This month brands count:', thisMonthBrands.length);
                    return thisMonthBrands.length;
                  })()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                  Bu Ay Eklenen
                </Typography>
              </Box>
              <Avatar sx={{ bgcolor: '#10b98120', color: '#10b981' }}>
                <AddIcon />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
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
                        {brand.createdAt 
                          ? new Date(brand.createdAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Tarih bilgisi yok'
                        }
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

                {/* Assigned User Bilgisi */}
                {viewBrand.assignedUserId && (
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                      Atanan Kullanıcı
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: '#374151' }}>
                      ID: {viewBrand.assignedUserId}
                    </Typography>
                  </Box>
                )}
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

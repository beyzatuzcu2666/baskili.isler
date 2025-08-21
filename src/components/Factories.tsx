import React, { useEffect, useState } from 'react';
import { factoriesService } from '../services/factories';
import { Factory, CreateFactoryRequest, UpdateFactoryRequest } from '../types/factory';
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
  Alert,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
  Factory as FactoryIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { FactoryFormModal } from './FactoryFormModal';
import { ConfirmationDialog } from './ConfirmationDialog';

const Factories: React.FC = () => {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteFactoryId, setDeleteFactoryId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const fetchFactories = async () => {
      try {
        const data = await factoriesService.getAll();
        if (!Array.isArray(data)) {
          console.warn('API response is not an array, using empty array');
          setFactories([]);
        } else {
          setFactories(data);
        }
        setError(null);
      } catch (err: any) {
        console.error('Factories fetch error:', err);
        setError(err.message || 'Fabrika verileri yüklenemedi. API bağlantısını kontrol edin.');
        setFactories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFactories();
  }, []);

  const filteredFactories = factories.filter(factory => {
    // Text search filter
    const matchesSearch = factory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      factory.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (factory.factoryNumber && factory.factoryNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && factory.active) ||
      (statusFilter === 'inactive' && !factory.active);
    
    return matchesSearch && matchesStatus;
  });

  const handleAddFactory = async (data: CreateFactoryRequest) => {
    try {
      await factoriesService.create(data);
      const updatedFactories = await factoriesService.getAll();
      setFactories(updatedFactories);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding factory:', error);
      setError('Fabrika eklenirken bir hata oluştu');
    }
  };

  const handleEditFactory = async (factoryId: number, data: UpdateFactoryRequest) => {
    try {
      await factoriesService.update(factoryId, data);
      const updatedFactories = await factoriesService.getAll();
      setFactories(updatedFactories);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating factory:', error);
      setError('Fabrika güncellenirken bir hata oluştu');
    }
  };

  const handleDeleteFactory = async (factoryId: number) => {
    setDeleteFactoryId(factoryId);
    setConfirmDelete(true);
  };

  const confirmDeleteFactory = async () => {
    if (deleteFactoryId) {
      try {
        await factoriesService.delete(deleteFactoryId);
        const updatedFactories = await factoriesService.getAll();
        setFactories(updatedFactories);
        setConfirmDelete(false);
        setDeleteFactoryId(null);
      } catch (error) {
        console.error('Error deleting factory:', error);
        setError('Fabrika silinirken bir hata oluştu');
      }
    }
  };

  const getActiveFactoriesCount = () => {
    return factories.filter(factory => factory.active).length;
  };

  const getInactiveFactoriesCount = () => {
    return factories.filter(factory => !factory.active).length;
  };

  // Statistics Cards Data
  const statsData = [
    {
      title: 'Toplam Fabrika',
      value: factories.length,
      icon: <FactoryIcon />,
      color: '#10b981',
      trend: '+12%'
    },
    {
      title: 'Aktif Fabrikalar',
      value: getActiveFactoriesCount(),
      icon: <TrendingUpIcon />,
      color: '#1e3a8a',
      trend: '+8%'
    },
    {
      title: 'Pasif Fabrikalar',
      value: getInactiveFactoriesCount(),
      icon: <BuildIcon />,
      color: '#ef4444',
      trend: '0%'
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>
          Fabrika Yönetimi
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Fabrikalarınızı yönetin, düzenleyin ve takip edin
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
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                placeholder="Fabrika ara..."
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
                  minWidth: 250,
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
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel id="status-filter-label">Durum</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  label="Durum"
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                  sx={{
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
                  }}
                >
                  <MenuItem value="all">Tümü</MenuItem>
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="inactive">Pasif</MenuItem>
                </Select>
              </FormControl>
            </Box>
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
              Yeni Fabrika
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
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
                  Fabrika
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Fabrika No
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  İletişim Bilgileri
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Durum
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  İşlemler
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFactories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <FactoryIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                        {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz fabrika eklenmemiş'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        {searchTerm ? 'Farklı arama terimleri deneyin' : 'İlk fabrikanızı eklemek için "Yeni Fabrika" butonuna tıklayın'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredFactories.map((factory, index) => (
                  <TableRow 
                    key={factory.id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f9fafb' },
                      borderBottom: index === filteredFactories.length - 1 ? 'none' : '1px solid #e5e7eb'
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
                        >
                          {factory.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                            {factory.name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            ID: {factory.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        {factory.factoryNumber}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <LocationIcon sx={{ fontSize: 16, color: '#6b7280', mt: 0.5 }} />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: '#374151',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {factory.address}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip 
                        label={factory.active ? 'Aktif' : 'Pasif'} 
                        size="small" 
                        sx={{ 
                          backgroundColor: factory.active ? '#10b98120' : '#ef444420',
                          color: factory.active ? '#10b981' : '#ef4444',
                          fontWeight: 600,
                          borderRadius: 2
                        }} 
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Görüntüle">
                          <IconButton 
                            size="small"
                            onClick={() => {
                              setSelectedFactory(factory);
                              setIsViewModalOpen(true);
                            }}
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
                              setSelectedFactory(factory);
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
                            onClick={() => handleDeleteFactory(factory.id)}
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

      {/* Modals */}
      <FactoryFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(data) => handleAddFactory(data as CreateFactoryRequest)}
        title="Yeni Fabrika Ekle"
        isUpdate={false}
      />

      <FactoryFormModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => {
          if (selectedFactory) {
            handleEditFactory(selectedFactory.id, data as UpdateFactoryRequest);
          }
        }}
        initialData={selectedFactory || undefined}
        title="Fabrika Düzenle"
        isUpdate={true}
      />

      {/* View Factory Modal */}
      <Dialog 
        open={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FactoryIcon sx={{ color: '#10b981' }} />
            <Typography variant="h6">Fabrika Detayları</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFactory && (
            <Box sx={{ mt: 2, display: 'grid', gap: 3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Fabrika Adı
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedFactory.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Fabrika Numarası
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedFactory.factoryNumber || 'Belirtilmemiş'}
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Adres
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedFactory.address}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Durum
                </Typography>
                <Chip 
                  label={selectedFactory.active ? 'Aktif' : 'Pasif'} 
                  color={selectedFactory.active ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Oluşturulma Tarihi
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {new Date(selectedFactory.createdAt).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Güncellenme Tarihi
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {selectedFactory.updatedAt ? new Date(selectedFactory.updatedAt).toLocaleDateString('tr-TR') : 'Güncellenmemiş'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsViewModalOpen(false)}>
            Kapat
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmationDialog
        open={confirmDelete}
        onClose={() => {
          setConfirmDelete(false);
          setDeleteFactoryId(null);
        }}
        onConfirm={confirmDeleteFactory}
        title="Fabrika Silme Onayı"
        message="Bu fabrikayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
      />
    </Box>
  );
};

export default Factories;
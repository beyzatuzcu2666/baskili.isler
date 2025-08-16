import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { usersService } from '../services/users';
import { authService } from '../services/auth';
import { User, UserRole, UserRoleLabels } from '../types/user';
import { ConfirmationDialog } from './ConfirmationDialog';
import { toast } from 'react-toastify';
import { useDealer } from '../contexts/DealerContext';

const Users = () => {
  const { selectedDealer } = useDealer();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    role: UserRole.DEALER_USER,
    dealerId: undefined as number | undefined,
  });

  useEffect(() => {
    console.log('Users component mounted, loading users...');
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userRole = authService.getUserRole();
      const userDealerId = authService.getUserDealerId();
      
      console.log('LoadUsers - Role:', userRole, 'DealerId:', userDealerId);
      
      let data;
      
      if (userRole === 'DEALER_ADMIN') {
        // DEALER_ADMIN için özel endpoint kullan
        console.log('Calling usersService.getUsers with dealerId:', userDealerId);
        data = await usersService.getUsers(userDealerId);
      } else {
        // SUPER_ADMIN için tüm kullanıcıları getir
        data = await usersService.getUsers();
      }
      
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Kullanıcılar yüklenirken hata oluştu');
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User, viewMode = false) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        dealerId: user.dealerId,
      });
      setIsViewMode(viewMode);
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        phoneNumber: '',
        role: UserRole.DEALER_USER,
        dealerId: undefined,
      });
      setIsViewMode(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      phoneNumber: '',
      role: UserRole.DEALER_USER,
      dealerId: undefined,
    });
    setIsViewMode(false);
  };

  const handleSubmit = async () => {
    try {
      const userRole = authService.getUserRole();
      const userDealerId = authService.getUserDealerId();
      
      if (selectedUser) {
        // Update existing user
        await usersService.updateUser(selectedUser.id, formData);
        toast.success('Kullanıcı başarıyla güncellendi');
      } else {
        // Create new user
        const userData = { ...formData };
        
        // DEALER_ADMIN ise dealer ID'sini ekle
        if (userRole === 'DEALER_ADMIN') {
          // Telefon numarasını doğru formata çevir
          const formatPhoneNumber = (phone: string) => {
            // 056776544576 -> +90 567 765 44 76
            if (phone.startsWith('0')) {
              const cleaned = phone.substring(1); // 56776544576
              return `+90 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
            }
            return phone;
          };
          
          const dealerUserData = {
            name: userData.name,
            email: userData.email,
            phoneNumber: formatPhoneNumber(userData.phoneNumber),
            dealerId: userDealerId,
            role: 'DEALER_USER' // Dealer admin sadece DEALER_USER oluşturabilir
          };
          console.log('Creating dealer user with data:', dealerUserData);
          await usersService.createUser(dealerUserData);
        } else {
          // SUPER_ADMIN için de telefon numarasını formatla ve dealerId set et
          const formatPhoneNumber = (phone: string) => {
            if (phone.startsWith('0')) {
              const cleaned = phone.substring(1);
              return `+90 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 8)} ${cleaned.substring(8, 10)}`;
            }
            return phone;
          };
          
          const superAdminUserData = {
            ...userData,
            phoneNumber: formatPhoneNumber(userData.phoneNumber),
            dealerId: selectedDealer?.id || userDealerId // SUPER_ADMIN'in seçili dealer'ının ID'si
          };
          await usersService.createUser(superAdminUserData);
        }
        
        toast.success('Kullanıcı başarıyla oluşturuldu');
      }
      handleCloseModal();
      loadUsers();
    } catch (err) {
      toast.error('İşlem sırasında hata oluştu');
      console.error('Error saving user:', err);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    try {
      await usersService.deleteUser(userToDelete.id);
      toast.success('Kullanıcı başarıyla silindi');
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      loadUsers();
    } catch (err) {
      toast.error('Kullanıcı silinirken hata oluştu');
      console.error('Error deleting user:', err);
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'error';
      case UserRole.DEALER_ADMIN:
        return 'warning';
      case UserRole.DEALER_USER:
        return 'info';
      case UserRole.FACTORY_USER:
        return 'success';
      default:
        return 'default';
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return <SecurityIcon />;
      case UserRole.DEALER_ADMIN:
        return <PersonIcon />;
      case UserRole.DEALER_USER:
        return <PersonIcon />;
      case UserRole.FACTORY_USER:
        return <PersonIcon />;
      default:
        return <PersonIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, pl: { xs: 2, sm: 3, md: 3 }, pr: { xs: 2, sm: 3, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
          {authService.getUserRole() === 'DEALER_ADMIN' ? 'Bayi Kullanıcıları' : 'Kullanıcı Yönetimi'}
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          {authService.getUserRole() === 'DEALER_ADMIN' 
            ? 'Bayinize ait kullanıcıları yönetin ve düzenleyin'
            : 'Sistem kullanıcılarını yönetin, düzenleyin ve takip edin'
          }
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {users.length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Toplam Kullanıcı
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {users.filter(u => u.role === UserRole.SUPER_ADMIN).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Süper Admin
                  </Typography>
                </Box>
                <SecurityIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {users.filter(u => u.role === UserRole.DEALER_ADMIN || u.role === UserRole.DEALER_USER).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Bayi Kullanıcısı
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {users.filter(u => u.role === UserRole.FACTORY_USER).length}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Fabrika Kullanıcısı
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Actions */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
          Kullanıcı Listesi
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenModal()}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            },
          }}
        >
          {authService.getUserRole() === 'DEALER_ADMIN' ? 'Yeni Bayi Kullanıcısı' : 'Yeni Kullanıcı'}
        </Button>
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 600 }}>Kullanıcı</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>E-posta</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Telefon</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="center">İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: getRoleColor(user.role) + '.main' }}>
                      {getRoleIcon(user.role)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        ID: {user.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    {user.email}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    {user.phoneNumber}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={UserRoleLabels[user.role]}
                    color={getRoleColor(user.role) as any}
                    size="small"
                    icon={getRoleIcon(user.role)}
                  />
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title="Görüntüle">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenModal(user, true)}
                        sx={{ color: '#3b82f6' }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Düzenle">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenModal(user, false)}
                        sx={{ color: '#f59e0b' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Sil">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setUserToDelete(user);
                          setIsDeleteDialogOpen(true);
                        }}
                        sx={{ color: '#ef4444' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* User Modal */}
      <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isViewMode 
            ? (authService.getUserRole() === 'DEALER_ADMIN' ? 'Bayi Kullanıcısı Detayları' : 'Kullanıcı Detayları')
            : selectedUser 
              ? (authService.getUserRole() === 'DEALER_ADMIN' ? 'Bayi Kullanıcısı Düzenle' : 'Kullanıcı Düzenle')
              : (authService.getUserRole() === 'DEALER_ADMIN' ? 'Yeni Bayi Kullanıcısı' : 'Yeni Kullanıcı')
          }
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Ad Soyad"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isViewMode}
              />
              <TextField
                fullWidth
                label="E-posta"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isViewMode}
              />
              <TextField
                fullWidth
                label="Telefon"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                disabled={isViewMode}
              />
              <FormControl fullWidth disabled={isViewMode}>
                <InputLabel>Rol</InputLabel>
                <Select
                  value={formData.role}
                  label="Rol"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                >
                  {Object.entries(UserRoleLabels).map(([role, label]) => {
                    const userRole = authService.getUserRole();
                    
                                        // DEALER_ADMIN sadece DEALER_USER oluşturabilir
                    if (userRole === 'DEALER_ADMIN' && role !== 'DEALER_USER') {
                      return null;
                    }
                    
                    // SUPER_ADMIN bu ekranda sadece DEALER_USER oluşturabilir
                    // DEALER_ADMIN bayiler oluşturulurken otomatik oluşturuluyor
                    // FACTORY_USER fabrikalar oluşturulurken otomatik oluşturuluyor
                    if (userRole === 'SUPER_ADMIN' && role !== 'DEALER_USER') {
                      return null;
                    }
                    
                    return (
                      <MenuItem key={role} value={role}>
                        {label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>İptal</Button>
          {!isViewMode && (
            <Button onClick={handleSubmit} variant="contained">
              {selectedUser ? 'Güncelle' : 'Oluştur'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={isDeleteDialogOpen}
        title="Kullanıcıyı Sil"
        message={`"${userToDelete?.name}" kullanıcısını silmek istediğinizden emin misiniz?`}
        onConfirm={handleDelete}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
      />
    </Box>
  );
};

export default Users; 
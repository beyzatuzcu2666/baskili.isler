import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Chip,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Stack,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Business as BusinessIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  LocalShipping as ShippingIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { Dealer } from '../types/dealer';
import { Product, Unit } from '../types/product';
import { Order } from '../types/order';
import { Offer } from '../types/offer';

interface DealerDetailModalProps {
  open: boolean;
  onClose: () => void;
  dealer: Dealer | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dealer-tabpanel-${index}`}
      aria-labelledby={`dealer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DealerDetailModal: React.FC<DealerDetailModalProps> = ({ open, onClose, dealer }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mock data - gerçek implementasyonda API'den gelecek
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    if (open && dealer) {
      loadDealerData();
    }
  }, [open, dealer]);

  const loadDealerData = async () => {
    if (!dealer) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Mock data - gerçek implementasyonda API çağrıları yapılacak
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock products
      const mockProducts: Product[] = [
        {
          id: 1,
          name: 'Kartvizit',
          description: 'Profesyonel kartvizit baskısı',
          unit: Unit.ADET,
          unitPrice: 150,
          taxRate: 18,
          active: true
        },
        {
          id: 2,
          name: 'Broşür',
          description: 'A4 boyutunda broşür baskısı',
          unit: Unit.ADET,
          unitPrice: 300,
          taxRate: 18,
          active: true
        }
      ];
      
      // Mock orders
      const mockOrders: Order[] = [
        {
          id: 1,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          totalPrice: 1500,
          brand: {
            id: 1,
            name: 'ABC Şirketi',
            logoUrl: undefined
          },
          factory: null,
          items: [
            {
              productId: 1,
              productName: 'Kartvizit',
              quantity: 1000,
              unitPrice: 150,
              lineTotal: 1500,
              plannedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'PENDING'
            }
          ]
        },
        {
          id: 2,
          status: 'IN_PROGRESS',
          createdAt: new Date().toISOString(),
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          totalPrice: 3000,
          brand: {
            id: 2,
            name: 'XYZ Ltd.',
            logoUrl: undefined
          },
          factory: {
            id: 1,
            name: 'Test Fabrika'
          },
          items: [
            {
              productId: 2,
              productName: 'Broşür',
              quantity: 500,
              unitPrice: 300,
              lineTotal: 3000,
              plannedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'IN_PROGRESS'
            }
          ]
        }
      ];
      
      // Mock offers
      const mockOffers: Offer[] = [
        {
          id: 1,
          brandId: 3,
          brandName: 'DEF Şirketi',
          createdAt: new Date().toISOString(),
          status: 'OFFER_SENT',
          totalPrice: 5000,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
            {
              productId: 1,
              quantity: 100,
              unitPrice: 50,
              taxRate: 18
            }
          ]
        }
      ];
      
      // Mock customers
      const mockCustomers = [
        {
          id: 1,
          name: 'ABC Şirketi',
          email: 'info@abc.com',
          phone: '+905551234567',
          totalOrders: 5,
          totalSpent: 15000
        },
        {
          id: 2,
          name: 'XYZ Ltd.',
          email: 'contact@xyz.com',
          phone: '+905559876543',
          totalOrders: 3,
          totalSpent: 8000
        }
      ];
      
      setProducts(mockProducts);
      setOrders(mockOrders);
      setOffers(mockOffers);
      setCustomers(mockCustomers);
      
    } catch (error) {
      setError('Veriler yüklenirken bir hata oluştu');
      console.error('Error loading dealer data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'IN_PROGRESS':
        return 'info';
      case 'IN_PRODUCTION':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Bekliyor';
      case 'IN_PROGRESS':
        return 'İşlemde';
      case 'IN_PRODUCTION':
        return 'Üretimde';
      case 'COMPLETED':
        return 'Tamamlandı';
      case 'CANCELLED':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  if (!dealer) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ 
            backgroundColor: '#8b5cf620',
            color: '#8b5cf6',
            width: 48,
            height: 48
          }}>
            <BusinessIcon />
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937' }}>
              {dealer.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              {dealer.code}
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#64748b' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Bayi Bilgileri */}
        <Box sx={{ p: 3, backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Stack spacing={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmailIcon sx={{ fontSize: 20, color: '#64748b' }} />
              <Typography variant="body1" sx={{ color: '#374151' }}>
                {dealer.contactEmail}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 20, color: '#64748b' }} />
              <Typography variant="body1" sx={{ color: '#374151' }}>
                {dealer.contactPhone}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon sx={{ fontSize: 20, color: '#64748b' }} />
              <Typography variant="body1" sx={{ color: '#374151' }}>
                {dealer.address}
              </Typography>
            </Box>
            <Chip
              label={dealer.isActive ? 'Aktif' : 'Pasif'}
              color={dealer.isActive ? 'success' : 'default'}
              sx={{ alignSelf: 'flex-start' }}
            />
          </Stack>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: '#e2e8f0' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 3,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                color: '#64748b',
                '&.Mui-selected': {
                  color: '#8b5cf6',
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#8b5cf6',
              }
            }}
          >
            <Tab label="Ürünler" />
            <Tab label="Müşteriler" />
            <Tab label="Teklifler" />
            <Tab label="Siparişler" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <>
              {/* Ürünler Tab */}
              <TabPanel value={tabValue} index={0}>
                <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Ürün Adı</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Fiyat</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.name}</TableCell>
                            <TableCell>{product.description}</TableCell>
                            <TableCell>₺{product.unitPrice}</TableCell>
                            <TableCell>
                              <Chip
                                label={product.active ? 'Aktif' : 'Pasif'}
                                color={product.active ? 'success' : 'default'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title="Görüntüle">
                                  <IconButton size="small" sx={{ color: '#8b5cf6' }}>
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Düzenle">
                                  <IconButton size="small" sx={{ color: '#f97316' }}>
                                    <EditIcon fontSize="small" />
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
              </TabPanel>

              {/* Müşteriler Tab */}
              <TabPanel value={tabValue} index={1}>
                <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Müşteri</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>İletişim</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Toplam Sipariş</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Toplam Harcama</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {customers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {customer.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack spacing={0.5}>
                                <Typography variant="body2">{customer.email}</Typography>
                                <Typography variant="body2">{customer.phone}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>{customer.totalOrders}</TableCell>
                            <TableCell>₺{customer.totalSpent}</TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title="Görüntüle">
                                  <IconButton size="small" sx={{ color: '#8b5cf6' }}>
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Düzenle">
                                  <IconButton size="small" sx={{ color: '#f97316' }}>
                                    <EditIcon fontSize="small" />
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
              </TabPanel>

              {/* Teklifler Tab */}
              <TabPanel value={tabValue} index={2}>
                <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Müşteri</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Açıklama</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Tutar</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {offers.map((offer) => (
                          <TableRow key={offer.id}>
                            <TableCell>{offer.brandName}</TableCell>
                            <TableCell>Teklif #{offer.id}</TableCell>
                            <TableCell>₺{offer.totalPrice}</TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusText(offer.status)}
                                color={getStatusColor(offer.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title="Görüntüle">
                                  <IconButton size="small" sx={{ color: '#8b5cf6' }}>
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Düzenle">
                                  <IconButton size="small" sx={{ color: '#f97316' }}>
                                    <EditIcon fontSize="small" />
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
              </TabPanel>

              {/* Siparişler Tab */}
              <TabPanel value={tabValue} index={3}>
                <Card sx={{ border: '1px solid #e2e8f0', borderRadius: 2 }}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f9fafb' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Müşteri</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Ürünler</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Tutar</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Durum</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Teslim Tarihi</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>İşlemler</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>
                              <Stack spacing={0.5}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  {order.brand.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                  Sipariş #{order.id}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              {order.items.map(item => `${item.productName} x ${item.quantity}`).join(', ')}
                            </TableCell>
                            <TableCell>₺{order.totalPrice}</TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusText(order.status)}
                                color={getStatusColor(order.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {order.deadline ? new Date(order.deadline).toLocaleDateString('tr-TR') : '-'}
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                <Tooltip title="Görüntüle">
                                  <IconButton size="small" sx={{ color: '#8b5cf6' }}>
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Fabrika Ata">
                                  <IconButton size="small" sx={{ color: '#10b981' }}>
                                    <AssignmentIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                {order.status === 'IN_PRODUCTION' && (
                                  <Tooltip title="Tamamla">
                                    <IconButton size="small" sx={{ color: '#10b981' }}>
                                      <CheckCircleIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </TabPanel>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0' }}>
        <Button onClick={onClose} variant="outlined">
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DealerDetailModal; 
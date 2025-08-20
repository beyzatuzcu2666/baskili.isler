import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
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
  LocalOffer as LocalOfferIcon,
  TrendingUp as TrendingUpIcon,

  Visibility as VisibilityIcon,
  ShoppingCart as ShoppingCartIcon,
  Close as CloseIcon,
  Remove as RemoveIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  BarChart as BarChartIcon,
  AttachMoney as AttachMoneyIcon
} from '@mui/icons-material';
import { Offer } from '../types/offer';
import { Brand } from '../types/brand';
import { Product, getUnitDisplayName, Unit, ProductCreateDto } from '../types/product';
import { offersService } from '../services/offers';
import { ordersService } from '../services/orders';
import { brandsService } from '../services/brands';
import { productsService } from '../services/products';
import { ConfirmationDialog } from './ConfirmationDialog';
import { BrandFormModal } from './BrandFormModal';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { authService } from '../services/auth';
import { useDealer } from '../contexts/DealerContext';
import { getLogoBase64, getFallbackLogoBase64 } from '../utils/logoBase64';

const Offers = () => {
  const { selectedDealer } = useDealer();
  const [searchParams] = useSearchParams();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteOfferId, setDeleteOfferId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [convertingToOrder, setConvertingToOrder] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewOffer, setViewOffer] = useState<Offer | null>(null);
  
  // Yeni modal'lar için state'ler
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  
  // Product form state'i
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    unit: Unit.ADET,
    unitPrice: 0,
    taxRate: 20
  });
  
  const [editOffer, setEditOffer] = useState<{
    brandId: number;
    status: string;
    totalPrice: number;
    validUntil: string;
    items: { productId: number; quantity: number; unitPrice: number; taxRate: number; }[];
  } | null>(null);
  const [newOffer, setNewOffer] = useState({
    brandId: 0,
    status: 'OFFER_SENT' as const,
    totalPrice: 0,
    validUntil: '',
    items: [] as { productId: number; quantity: number; unitPrice: number; taxRate: number; }[]
  });

  useEffect(() => {
    loadOffers();
    loadBrands();
    loadProducts();
    loadStats();
  }, [selectedDealer]);

  // URL parametresi ile modal'ı otomatik aç
  useEffect(() => {
    const modalParam = searchParams.get('modal');
    if (modalParam === 'add') {
      handleOpenCreateModal();
      // URL'den modal parametresini temizle
      window.history.replaceState({}, '', '/offers');
    }
  }, [searchParams]);

  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true);
    setNewOffer({
      brandId: 0,
      status: 'OFFER_SENT',
      totalPrice: 0,
      validUntil: '',
      items: []
    });
  };

  const loadBrands = async () => {
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
      
      setBrands(data);
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const userRole = authService.getUserRole();
      
      let data;
      if (userRole === 'DEALER_ADMIN') {
        // DEALER_ADMIN için sadece kendi bayisinin ürünlerini getir
        data = await productsService.getDealerProducts();
      } else if (userRole === 'SUPER_ADMIN' && selectedDealer) {
        // SUPER_ADMIN için seçili dealer'ın ürünlerini getir
        data = await productsService.getDealerProducts(selectedDealer.id);
      } else {
        // SUPER_ADMIN için tüm ürünleri getir (dealer seçilmemişse)
        data = await productsService.getAll();
      }
      
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offer.status?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = false;
    if (statusFilter === 'all') {
      matchesStatus = true;
    } else if (statusFilter === 'OFFER_SENT') {
      matchesStatus = offer.status === 'OFFER_SENT';
    } else if (statusFilter === 'OFFER_ACCEPTED') {
      matchesStatus = offer.status === 'ACCEPTED';
    } else if (statusFilter === 'OFFER_REJECTED') {
      matchesStatus = offer.status === 'DECLINED' || offer.status === 'EXPIRED';
    }
    

    
    return matchesSearch && matchesStatus;
  });

  const loadOffers = async () => {
    try {
      const userRole = authService.getUserRole();
      console.log('Loading offers - User role:', userRole, 'Selected dealer:', selectedDealer);
      
      let data;
      if (userRole === 'DEALER_ADMIN') {
        // DEALER_ADMIN için sadece kendi bayisinin tekliflerini getir
        data = await offersService.getDealerOffers();
      } else if (userRole === 'SUPER_ADMIN' && selectedDealer) {
        // SUPER_ADMIN için seçili dealer'ın tekliflerini getir
        data = await offersService.getDealerOffers(selectedDealer.id);
      } else {
        // SUPER_ADMIN için tüm teklifleri getir (dealer seçilmemişse)
        data = await offersService.getAll();
      }
      
      console.log('Loaded offers:', data);
      console.log('User role:', authService.getUserRole());
      console.log('Can convert offers:', authService.canConvertOfferToOrder());
      setOffers(data);
      setError(null);
    } catch (error) {
      console.error('Error loading offers:', error);
      setError('Teklifler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (offer: Offer) => {
    setViewOffer(offer);
    setIsViewModalOpen(true);
  };

  // Yeni müşteri oluşturma fonksiyonu
  const handleCreateBrand = async (data: {
    name: string;
    contactEmail: string;
    contactPhone: string;
    assignedUserId?: number;
  }) => {
    setIsCreatingBrand(true);
    try {
      await brandsService.createBrand(data);
      await loadBrands(); // Müşteri listesini yenile
      setIsBrandModalOpen(false);
      toast.success('Müşteri başarıyla oluşturuldu');
    } catch (error) {
      console.error('Error creating brand:', error);
      toast.error('Müşteri oluşturulurken bir hata oluştu');
    } finally {
      setIsCreatingBrand(false);
    }
  };

  // Yeni ürün oluşturma fonksiyonu
  const handleCreateProduct = async (data: ProductCreateDto) => {
    setIsCreatingProduct(true);
    try {
      await productsService.create(data);
      await loadProducts(); // Ürün listesini yenile
      setIsProductModalOpen(false);
      setProductForm({
        name: '',
        description: '',
        unit: Unit.ADET,
        unitPrice: 0,
        taxRate: 20
      });
      toast.success('Ürün başarıyla oluşturuldu');
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Ürün oluşturulurken bir hata oluştu');
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const handleEdit = (offer: Offer) => {
    setSelectedOffer(offer);
    setEditOffer({
      brandId: offer.brandId,
      status: offer.status,
      totalPrice: offer.totalPrice,
      validUntil: offer.validUntil,
      items: offer.items.map(item => ({
        ...item,
        taxRate: item.taxRate || 20 // Eğer taxRate yoksa varsayılan 20 kullan
      }))
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedOffer || !editOffer) return;

    setIsUpdating(true);
    try {
      const updatedData = {
        brandId: editOffer.brandId,
        totalPrice: editOffer.totalPrice,
        validUntil: editOffer.validUntil,
        items: editOffer.items
      };
      
      await offersService.update(selectedOffer.id, updatedData);
      await loadOffers(); // Reload offers
      setIsEditModalOpen(false);
      setSelectedOffer(null);
      setEditOffer(null);
      setError(null);
    } catch (error) {
      console.error('Error updating offer:', error);
      setError('Teklif güncellenirken bir hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreate = async (newOfferData: Omit<Offer, 'id' | 'createdAt'>) => {
    setIsCreating(true);
    try {
      const userRole = authService.getUserRole();
      
      // Dealer ID'sini ekle
      const offerData = {
        ...newOfferData,
        dealerId: userRole === 'SUPER_ADMIN' && selectedDealer ? selectedDealer.id : undefined
      };
      
      await offersService.create(offerData);
      await loadOffers(); // Reload offers
      setIsCreateModalOpen(false);
      setError(null);
    } catch (error) {
      console.error('Error creating offer:', error);
      setError('Yeni teklif oluşturulürken bir hata oluştu');
    } finally {
      setIsCreating(false);
    }
  };

  const addItem = () => {
    const updatedItems = [...newOffer.items, { productId: 0, quantity: 1, unitPrice: 0, taxRate: 20 }];
    const newTotalPrice = updatedItems.reduce((total, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const taxAmount = lineTotal * (item.taxRate / 100);
      return total + lineTotal + taxAmount;
    }, 0);
    
    setNewOffer({
      ...newOffer,
      items: updatedItems,
      totalPrice: newTotalPrice
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = newOffer.items.filter((_, i) => i !== index);
    const newTotalPrice = updatedItems.reduce((total, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const taxAmount = lineTotal * (item.taxRate / 100);
      return total + lineTotal + taxAmount;
    }, 0);
    
    setNewOffer({
      ...newOffer,
      items: updatedItems,
      totalPrice: newTotalPrice
    });
  };

  const updateItem = (index: number, field: 'productId' | 'quantity' | 'unitPrice' | 'taxRate', value: number) => {
    const updatedItems = [...newOffer.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Ürün seçildiğinde varsayılan KDV'yi set et
    if (field === 'productId' && value > 0) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedItems[index].taxRate = selectedProduct.taxRate;
      }
    }
    
    // Toplam fiyatı güncelle
    const newTotalPrice = updatedItems.reduce((total, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const taxAmount = lineTotal * (item.taxRate / 100);
      return total + lineTotal + taxAmount;
    }, 0);
    
    setNewOffer({
      ...newOffer,
      items: updatedItems,
      totalPrice: newTotalPrice
    });
  };

  const addEditItem = () => {
    if (!editOffer) return;
    const updatedItems = [...editOffer.items, { productId: 0, quantity: 1, unitPrice: 0, taxRate: 20 }];
    const newTotalPrice = updatedItems.reduce((total, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const taxAmount = lineTotal * (item.taxRate / 100);
      return total + lineTotal + taxAmount;
    }, 0);
    
    setEditOffer({
      ...editOffer,
      items: updatedItems,
      totalPrice: newTotalPrice
    });
  };

  const removeEditItem = (index: number) => {
    if (!editOffer) return;
    const updatedItems = editOffer.items.filter((_, i) => i !== index);
    const newTotalPrice = updatedItems.reduce((total, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const taxAmount = lineTotal * (item.taxRate / 100);
      return total + lineTotal + taxAmount;
    }, 0);
    
    setEditOffer({
      ...editOffer,
      items: updatedItems,
      totalPrice: newTotalPrice
    });
  };

  const updateEditItem = (index: number, field: 'productId' | 'quantity' | 'unitPrice' | 'taxRate', value: number) => {
    if (!editOffer) return;
    const updatedItems = [...editOffer.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Ürün seçildiğinde varsayılan KDV'yi set et
    if (field === 'productId' && value > 0) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedItems[index].taxRate = selectedProduct.taxRate;
      }
    }
    
    // Toplam fiyatı güncelle
    const newTotalPrice = updatedItems.reduce((total, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const taxAmount = lineTotal * (item.taxRate / 100);
      return total + lineTotal + taxAmount;
    }, 0);
    
    setEditOffer({
      ...editOffer,
      items: updatedItems,
      totalPrice: newTotalPrice
    });
  };



  const handleDelete = async (id: string) => {
    setDeleteOfferId(id);
    setConfirmDelete(true);
  };

  const confirmDeleteOffer = async () => {
    if (deleteOfferId) {
      setIsDeleting(true);
      try {
        await offersService.delete(parseInt(deleteOfferId));
        setOffers(offers.filter(o => o.id.toString() !== deleteOfferId));
        setDeleteOfferId(null);
        setConfirmDelete(false);
        setError(null);
      } catch (error) {
      console.error('Error deleting offer:', error);
        setError('Teklif silinirken bir hata oluştu');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleConvertToOrder = (offer: Offer) => {
    setSelectedOffer(offer);
    setIsOrderModalOpen(true);
  };

    const confirmConvertToOrder = async () => {
    if (!selectedOffer) return;
    
      setConvertingToOrder(true);
    try {
      // Convert offer to order using the correct endpoint
      // Swagger'da belirtilen /orders/accept endpoint'ini kullan
      const itemDeadlines: Record<string, string> = {};
      selectedOffer.items.forEach((item, index) => {
        // Her item için 30 gün sonraki tarih
        itemDeadlines[item.productId.toString()] = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      });

      await ordersService.acceptOffer(selectedOffer.id.toString(), itemDeadlines);
      
      await loadOffers(); // Reload offers
      setIsOrderModalOpen(false);
      setSelectedOffer(null);
      
      // Show success message
      setError(null);
      // You could show a success toast here instead
      
    } catch (error) {
      console.error('Error converting to order:', error);
      setError('Teklif siparişe dönüştürülürken bir hata oluştu');
    } finally {
      setConvertingToOrder(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'offer_sent':
        return '#f97316';
      case 'accepted':
        return '#10b981';
      case 'declined':
      case 'expired':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'offer_sent':
        return 'Gönderildi';
      case 'accepted':
        return 'Kabul Edildi';
      case 'declined':
        return 'Reddedildi';
      case 'expired':
        return 'Süresi Doldu';
      default:
        return status;
    }
  };

  // Farklı KDV oranlarını tespit eden fonksiyon
  const getTaxRateDisplay = (items: { taxRate: number }[]) => {
    const uniqueTaxRates = Array.from(new Set(items.map(item => item.taxRate)));
    if (uniqueTaxRates.length === 1) {
      return `%${uniqueTaxRates[0]}`;
    } else {
      return 'Farklı oranlar';
    }
  };

  const generatePDF = async (offer: Offer) => {
    const doc = new jsPDF();
    
    // Türkçe karakterler için özel font ayarları
    doc.setFont('helvetica');
    doc.setCharSpace(0.1);
    
    // Türkçe karakter dönüştürme fonksiyonu
    const turkishToLatin = (text: string) => {
      return text
        .replace(/ç/g, 'c').replace(/Ç/g, 'C')
        .replace(/ğ/g, 'g').replace(/Ğ/g, 'G')  
        .replace(/ı/g, 'i').replace(/I/g, 'I')
        .replace(/ö/g, 'o').replace(/Ö/g, 'O')
        .replace(/ş/g, 's').replace(/Ş/g, 'S')
        .replace(/ü/g, 'u').replace(/Ü/g, 'U')
        .replace(/İ/g, 'I');
    };
    
    // Logo yükleme
    let logoBase64 = getFallbackLogoBase64();
    try {
      logoBase64 = await getLogoBase64();
    } catch (error) {
      console.warn('Logo yüklenemedi, fallback logo kullanılıyor:', error);
    }
    
    // Sayfa başlığı ve arka plan rengi
    doc.setFillColor(248, 250, 252); // Açık gri arka plan
    doc.rect(0, 0, 210, 297, 'F');
    
    // Üst header alanı
    doc.setFillColor(16, 185, 129); // Yeşil header
    doc.rect(0, 0, 210, 50, 'F');
    
    // Logo alanı (sol üst) - daha büyük ve görünür
    try {
      if (logoBase64.includes('svg')) {
        // SVG logo için - daha büyük boyut
        doc.addImage(logoBase64, 'SVG', 10, 8, 60, 35);
      } else {
        // PNG logo için
        doc.addImage(logoBase64, 'PNG', 10, 8, 60, 35);
      }
    } catch (e) {
      // Logo yüklenemezse renkli metin logo
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('BASKILI ISLER', 15, 30);
    }
    
    // Şirket bilgileri (beyaz metin) - logo ile çakışmayacak konumda
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal');
    doc.text('www.baskiliisler.com', 75, 18);
    doc.text(turkishToLatin('Ornek Mah. Baku Sok. No:38/1B'), 75, 24);
    doc.text(turkishToLatin('Atasehir / Istanbul'), 75, 30);
    doc.text('Tel: +90 (212) 123 45 67', 75, 36);
    
    // Başlık (sağ üst - beyaz metin)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(turkishToLatin('TEKLIF FORMU'), 140, 25);
    
    // Tarih bilgileri (sağ üst - beyaz metin)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('tr-TR');
    const validUntil = new Date(offer.validUntil).toLocaleDateString('tr-TR');
    doc.text(`Tarih: ${currentDate}`, 140, 35);
    doc.text(turkishToLatin(`Gecerlilik: ${validUntil}`), 140, 42);
    
    // Müşteri bilgisi kartı
    const customerName = offer.brandName || turkishToLatin('Bilinmeyen Müşteri');
    
    // Müşteri kartı arka planı
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, 60, 180, 25, 3, 3, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 60, 180, 25, 3, 3, 'S');
    
    // Müşteri bilgisi
    doc.setFontSize(11);
    doc.setTextColor(107, 114, 128);
    doc.text('SAYIN', 20, 70);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(turkishToLatin(customerName), 20, 78);
    
    // Sağ tarafta sadece şirket adı
    doc.setFontSize(14);
    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text(turkishToLatin('BASKILI İŞLER'), 150, 75);
    

    // Modern tablo oluşturma (autoTable ile)
    const tableData = offer.items.map((item, index) => {
      const product = products.find(p => p.id === item.productId);
      const lineTotal = item.quantity * item.unitPrice;
      const taxAmount = lineTotal * (item.taxRate / 100);
      const totalWithTax = lineTotal + taxAmount;
      
      return [
        `${index + 1}. ${turkishToLatin(product?.name || 'Bilinmeyen Ürün')}`,
        `${item.quantity} ${turkishToLatin(product?.unit || 'adet')}`,
        `${item.unitPrice.toFixed(2)} TL`,
        `%${item.taxRate}`,
        `${lineTotal.toFixed(2)} TL`,
        `${totalWithTax.toFixed(2)} TL`
      ];
    });

    // autoTable ile modern tablo
    autoTable(doc, {
      startY: 95,
      head: [[turkishToLatin('Açıklama'), 'Miktar', 'Birim Fiyat', 'KDV', 'Net Tutar', 'Toplam']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [16, 185, 129],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4,
        lineColor: [229, 231, 235],
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        0: { cellWidth: 60, halign: 'left' },   // Açıklama
        1: { cellWidth: 25, halign: 'center' }, // Miktar
        2: { cellWidth: 25, halign: 'right' },  // Birim Fiyat
        3: { cellWidth: 20, halign: 'center' }, // KDV
        4: { cellWidth: 25, halign: 'right' },  // Net Tutar
        5: { cellWidth: 30, halign: 'right' }   // Toplam
      },
      margin: { left: 15, right: 15 }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Toplam hesaplamaları
    const netTotal = offer.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
    const taxTotal = offer.items.reduce((total, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      return total + (lineTotal * item.taxRate / 100);
    }, 0);
    const grandTotal = netTotal + taxTotal;
    
    // Toplam kutusu - daha geniş ve düzenli
    doc.setFillColor(240, 253, 244); // Açık yeşil arka plan
    doc.roundedRect(100, finalY, 95, 40, 3, 3, 'F');
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.5);
    doc.roundedRect(100, finalY, 95, 40, 3, 3, 'S');
    
    // Toplam bilgileri - daha düzenli spacing
    doc.setFontSize(10);
    doc.setTextColor(5, 150, 105);
    doc.setFont('helvetica', 'normal');
    
    // Net Toplam
    doc.text('Net Toplam:', 105, finalY + 10);
    doc.text(`${netTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, 190, finalY + 10, { align: 'right' });
    
    // KDV
    doc.text(`KDV (${getTaxRateDisplay(offer.items)}):`, 105, finalY + 20);
    doc.text(`${taxTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, 190, finalY + 20, { align: 'right' });
    
    // Ayırıcı çizgi
    doc.setDrawColor(16, 185, 129);
    doc.line(105, finalY + 22, 190, finalY + 22);
    
    // Genel toplam (kalın ve büyük)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('GENEL TOPLAM:', 105, finalY + 30);
    doc.text(`${grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, 190, finalY + 30, { align: 'right' });
    
    // Şartlar ve koşullar kutusu
    const termsY = finalY + 50;
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(15, termsY, 180, 60, 3, 3, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, termsY, 180, 60, 3, 3, 'S');
    
    // Başlık
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(turkishToLatin('ŞARTLAR VE KOŞULLAR'), 20, termsY + 10);
    
    // Şartlar listesi
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(turkishToLatin('• Teslimat grafik onayından sonra 14 iş günüdür.'), 20, termsY + 18);
    doc.text(turkishToLatin('• Karton bardak çeşitlerinde klişe bedeli yoktur.'), 20, termsY + 24);
    doc.text(turkishToLatin('• Islak mendil, peçete, şeker, soğuk bardakların klişe bedeli renk başı 1.000 TL.'), 20, termsY + 30);
    doc.text(turkishToLatin('• Çanta, yağlı kağıt, kese kağıtları çeşitlerinde klişe bedeli ölçüye göre değişir.'), 20, termsY + 36);
    doc.text(turkishToLatin('• Tüm ürünlerimiz gıda kullanımına uygundur, halk sağlığı izinleri mevcuttur.'), 20, termsY + 42);
    
    // Banka bilgileri kutusu
    const bankY = termsY + 70;
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(15, bankY, 180, 30, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(turkishToLatin('HESAP BİLGİLERİMİZ'), 20, bankY + 10);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('AKBANK - TR 22 0004 6002 9788 8000 1389 30', 20, bankY + 18);
    doc.text(turkishToLatin('BASKILI İŞLER A.Ş.'), 20, bankY + 24);
    
    // Kapanış mesajı
    const closingY = bankY + 40;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(107, 114, 128);
    doc.text(turkishToLatin('Teklifimiz ile ilgili sorularınızı cevaplamaya hazır olduğumuzu belirtir,'), 20, closingY);
    doc.text(turkishToLatin('çalışmalarınızda başarılar dileriz.'), 20, closingY + 6);
    doc.setFont('helvetica', 'bold');
    doc.text(turkishToLatin('Saygılarımızla, BASKILI İŞLER Ekibi'), 20, closingY + 15);
    
    // PDF'i indir - Türkçe karakterleri koruyarak
    const cleanCustomerName = turkishToLatin(customerName).replace(/\s+/g, '_');
    
    const fileName = `Teklif_${cleanCustomerName}_${offer.id}_${currentDate.replace(/\./g, '-')}.pdf`;
    doc.save(fileName);
    
    toast.success(turkishToLatin('PDF başarıyla oluşturuldu ve indirildi! 🎉'));
  };

  // Statistics Cards Data
  const [statsData, setStatsData] = useState([
    {
      title: 'Geçerlilik Süresi Yaklaşan',
      value: 0,
      icon: <WarningIcon />,
      color: '#ef4444',
      trend: '0 teklif'
    },
    {
      title: 'Bu Hafta Kabul Edilen',
      value: 0,
      icon: <TrendingUpIcon />,
      color: '#10b981',
      trend: '0 gönderilen'
    },
    {
      title: 'Kabul Oranı',
      value: '0%',
      icon: <BarChartIcon />,
      color: '#1e3a8a',
      trend: '0 işlenen'
    },
    {
      title: 'Toplam Teklif Değeri',
      value: '0 ₺',
      icon: <AttachMoneyIcon />,
      color: '#f59e0b',
      trend: '0 teklif'
    }
  ]);

  // İstatistikleri yükle
  const loadStats = async () => {
    try {
      const userRole = authService.getUserRole();
      let dealerId = undefined;
      
      if (userRole === 'SUPER_ADMIN' && selectedDealer) {
        dealerId = selectedDealer.id;
      }

      console.log('Loading stats - User role:', userRole, 'Dealer ID:', dealerId);

      const [expiringData, weeklyData, overviewData] = await Promise.all([
        offersService.getExpiringOffers(dealerId),
        offersService.getWeeklyStats(dealerId),
        offersService.getOffersOverview(dealerId)
      ]);

      console.log('Backend responses:');
      console.log('Expiring data:', expiringData);
      console.log('Weekly data:', weeklyData);
      console.log('Overview data:', overviewData);

      setStatsData([
        {
          title: 'Geçerlilik Süresi Yaklaşan',
          value: expiringData.expiringCount,
          icon: <WarningIcon />,
          color: '#ef4444',
          trend: `${expiringData.expiringCount} teklif`
        },
        {
          title: 'Bu Hafta Kabul Edilen',
          value: weeklyData.acceptedCount,
          icon: <TrendingUpIcon />,
          color: '#10b981',
          trend: `${weeklyData.sentCount} gönderilen`
        },
        {
          title: 'Kabul Oranı',
          value: `${Math.round(overviewData.acceptanceRate)}%`,
          icon: <BarChartIcon />,
          color: '#1e3a8a',
          trend: `${overviewData.acceptedOffers + overviewData.rejectedOffers} işlenen`
        },
        {
          title: 'Toplam Teklif Değeri',
          value: `${overviewData.totalValue.toLocaleString('tr-TR')} ₺`,
          icon: <AttachMoneyIcon />,
          color: '#f59e0b',
          trend: `${overviewData.totalOffers} teklif`
        }
      ]);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

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
          Teklif Yönetimi
        </Typography>
        <Typography variant="body1" sx={{ color: '#6b7280' }}>
          Tekliflerinizi yönetin, düzenleyin ve takip edin
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(4, 1fr)', 
          lg: 'repeat(4, 1fr)' 
        },
        gap: 2, 
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
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5, fontSize: '0.875rem' }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937', mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Chip 
                      label={stat.trend} 
                      size="small" 
                      sx={{ 
                        backgroundColor: `${stat.color}20`,
                        color: stat.color,
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }} 
                    />
                  </Box>
                  <Avatar 
                    sx={{ 
                      backgroundColor: `${stat.color}20`,
                      color: stat.color,
                      width: 40,
                      height: 40
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
                placeholder="Teklif ara..."
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
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel sx={{ color: '#6b7280' }}>Durum Filtresi</InputLabel>
                <Select
                  value={statusFilter}
                  label="Durum Filtresi"
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                  <MenuItem value="all">Tüm Durumlar</MenuItem>
                  <MenuItem value="OFFER_SENT">Gönderildi</MenuItem>
                                  <MenuItem value="ACCEPTED">Kabul Edildi</MenuItem>
                <MenuItem value="DECLINED">Reddedildi</MenuItem>
                <MenuItem value="EXPIRED">Süresi Doldu</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsCreateModalOpen(true)}
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
              Yeni Teklif
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
                  Teklif
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Durum
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Tarih Bilgileri
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  Toplam
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#374151', py: 2 }}>
                  İşlemler
                </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              {filteredOffers.length === 0 ? (
              <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <LocalOfferIcon sx={{ fontSize: 48, color: '#9ca3af', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#6b7280', mb: 1 }}>
                        {searchTerm || statusFilter !== 'all' ? 'Arama sonucu bulunamadı' : 'Henüz teklif eklenmemiş'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                        {searchTerm || statusFilter !== 'all' ? 'Farklı arama terimleri veya durum filtresi deneyin' : 'İlk teklifinizi eklemek için "Yeni Teklif" butonuna tıklayın'}
                      </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
                filteredOffers.map((offer, index) => (
                  <TableRow 
                    key={offer.id}
                    sx={{ 
                      '&:hover': { backgroundColor: '#f9fafb' },
                      borderBottom: index === filteredOffers.length - 1 ? 'none' : '1px solid #e5e7eb'
                    }}
                  >
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          src={brands.find(brand => brand.name === offer.brandName)?.logoUrl}
                          sx={{ 
                            backgroundColor: '#10b98120',
                            color: '#10b981',
                            width: 40,
                            height: 40,
                            fontWeight: 600
                          }}
                        >
                          {offer.brandName?.charAt(0).toUpperCase() || 'T'}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                            {offer.brandName || 'Bilinmeyen Müşteri'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            ID: {offer.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Chip 
                        label={getStatusText(offer.status)} 
                        size="small" 
                        sx={{ 
                          backgroundColor: `${getStatusColor(offer.status)}20`,
                          color: getStatusColor(offer.status),
                          fontWeight: 600,
                          borderRadius: 2
                        }} 
                      />
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: '#374151', fontWeight: 500 }}>
                            Oluşturulma: {new Date(offer.createdAt).toLocaleDateString('tr-TR')}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            Geçerli: {new Date(offer.validUntil).toLocaleDateString('tr-TR')}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600 }}>
                        ₺{offer.totalPrice?.toFixed(2) || '0.00'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Görüntüle">
                          <IconButton 
                            size="small"
                            onClick={() => handleView(offer)}
                            sx={{ 
                              color: '#6b7280',
                              '&:hover': { backgroundColor: '#f3f4f6', color: '#374151' }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {offer.status === 'OFFER_SENT' && authService.canConvertOfferToOrder() && (
                          <Tooltip title="Siparişe Dönüştür">
                            <IconButton 
                              size="small"
                              onClick={() => handleConvertToOrder(offer)}
                              sx={{ 
                                color: '#1e3a8a',
                                '&:hover': { backgroundColor: '#eff6ff', color: '#1d4ed8' }
                              }}
                            >
                              <ShoppingCartIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {offer.status === 'OFFER_SENT' && (
                          <Tooltip title="Düzenle">
                            <IconButton 
                              size="small"
                              onClick={() => handleEdit(offer)}
                              sx={{ 
                                color: '#f97316',
                                '&:hover': { backgroundColor: '#fef3e2', color: '#ea580c' }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Sil">
                          <IconButton 
                            size="small"
                            onClick={() => handleDelete(offer.id.toString())}
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
        onClick={() => setIsCreateModalOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#10b981',
          '&:hover': { backgroundColor: '#059669' },
          display: { xs: 'flex', md: 'none' }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Edit Modal */}
      <Dialog
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle
        sx={{
            pb: 2,
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: '#10b98120',
                color: '#10b981',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
        }}
      >
              <EditIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Teklif Düzenle
            </Typography>
          </Box>
          <IconButton onClick={() => setIsEditModalOpen(false)} sx={{ color: '#6b7280' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {editOffer && (
            <Box sx={{ display: 'grid', gap: 3 }}>
              <FormControl fullWidth disabled>
                <InputLabel id="edit-brand-select-label">Müşteri</InputLabel>
              <Select
                  labelId="edit-brand-select-label"
                  value={editOffer.brandId}
                  label="Müşteri"
                  sx={{
                    borderRadius: 2,
                    backgroundColor: '#f9fafb',
                  }}
              >
                {brands.map((brand) => (
                    <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
              </FormControl>
              
              {/* Items Section */}
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600 }}>
                    Ürünler
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={addEditItem}
                  sx={{
                        borderColor: '#10b981',
                        color: '#10b981',
                    '&:hover': {
                          borderColor: '#059669',
                          backgroundColor: '#10b98110'
                        }
                      }}
                    >
                      Ürün Ekle
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<InventoryIcon />}
                      onClick={() => setIsProductModalOpen(true)}
                      sx={{
                        borderColor: '#3b82f6',
                        color: '#3b82f6',
                        '&:hover': {
                          borderColor: '#2563eb',
                          backgroundColor: '#3b82f610'
                    }
                  }}
                >
                      Yeni Ürün Oluştur
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PersonIcon />}
                      onClick={() => setIsBrandModalOpen(true)}
                      sx={{
                        borderColor: '#f59e0b',
                        color: '#f59e0b',
                        '&:hover': {
                          borderColor: '#d97706',
                          backgroundColor: '#f59e0b10'
                        }
                      }}
                    >
                      Yeni Müşteri Oluştur
                    </Button>
              </Box>
              </Box>
                
                {editOffer.items.map((item, index) => (
                  <Box key={index} sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '2fr 1fr 1fr 1fr auto', 
                    gap: 2, 
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    border: '1px solid #e5e7eb',
                    borderRadius: 2,
                    backgroundColor: '#f9fafb'
                  }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Ürün</InputLabel>
                    <Select
                      value={item.productId}
                      label="Ürün"
                        onChange={(e) => updateEditItem(index, 'productId', Number(e.target.value))}
                    >
                      {products.map((product) => (
                        <MenuItem key={product.id} value={product.id}>
                            {product.name} ({getUnitDisplayName(product.unit)})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                    
                  <TextField
                      size="small"
                    label="Adet"
                    type="number"
                    value={item.quantity}
                      onChange={(e) => updateEditItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      inputProps={{ min: 1 }}
                  />
                    
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <TextField
                        size="small"
                        label="Birim Fiyat"
                      type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateEditItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        inputProps={{ min: 0, step: 0.01 }}
                    />
                    {item.productId > 0 && (() => {
                      const selectedProduct = products.find(p => p.id === item.productId);
                      return selectedProduct ? (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#6b7280', 
                            fontSize: '0.75rem',
                            fontStyle: 'italic'
                          }}
                        >
                          Asıl fiyat: ₺{selectedProduct.unitPrice.toFixed(2)}
                        </Typography>
                      ) : null;
                    })()}
                  </Box>

                  <TextField
                      size="small"
                      label="KDV (%)"
                    type="number"
                      value={item.taxRate}
                      onChange={(e) => updateEditItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                      inputProps={{ min: 0, max: 100, step: 0.01 }}
                    />
                    
                    <IconButton
                      size="small"
                      onClick={() => removeEditItem(index)}
                      sx={{ color: '#ef4444' }}
                    >
                      <RemoveIcon />
                    </IconButton>
                </Box>
              ))}
                
                {editOffer.items.length === 0 && (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4, 
                    color: '#6b7280',
                    border: '2px dashed #e5e7eb',
                    borderRadius: 2
                  }}>
                    <Typography variant="body2">
                      Henüz ürün eklenmedi. "Ürün Ekle" butonuna tıklayın.
                    </Typography>
            </Box>
                )}
          </Box>

              {/* Total Price Display */}
              <Box sx={{ 
                p: 2, 
                backgroundColor: '#f0fdf4', 
                borderRadius: 2,
                border: '1px solid #10b981'
              }}>
                <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600, mb: 1 }}>
                  Teklif Özeti
                </Typography>
                {(() => {
                  const netTotal = editOffer?.items.reduce((total, item) => {
                    const lineTotal = item.quantity * item.unitPrice;
                    return total + lineTotal;
                  }, 0) || 0;
                  
                  const taxTotal = editOffer?.items.reduce((total, item) => {
                    const lineTotal = item.quantity * item.unitPrice;
                    const taxAmount = lineTotal * (item.taxRate / 100);
                    return total + taxAmount;
                  }, 0) || 0;
                  
                  const grandTotal = netTotal + taxTotal;
                  
                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#059669' }}>Net:</Typography>
                        <Typography variant="body2" sx={{ color: '#059669', fontWeight: 600 }}>₺{netTotal.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#059669' }}>
                          KDV ({getTaxRateDisplay(editOffer.items)}):
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#059669', fontWeight: 600 }}>₺{taxTotal.toFixed(2)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5, borderTop: '1px solid #10b981' }}>
                        <Typography variant="body1" sx={{ color: '#059669', fontWeight: 700 }}>Toplam:</Typography>
                        <Typography variant="body1" sx={{ color: '#059669', fontWeight: 700 }}>₺{grandTotal.toFixed(2)}</Typography>
                      </Box>
                    </Box>
                  );
                })()}
              </Box>
              
              <TextField
                fullWidth
                label="Geçerlilik Tarihi"
                type="date"
                value={editOffer.validUntil ? editOffer.validUntil.split('T')[0] : ''}
                onChange={(e) => setEditOffer({
                  ...editOffer,
                  validUntil: e.target.value ? e.target.value + 'T23:59:59.000Z' : ''
                })}
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#10b981',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#10b981',
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => {
              setIsEditModalOpen(false);
              setEditOffer(null);
              setSelectedOffer(null);
            }}
            disabled={isUpdating}
            sx={{ 
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            İptal
          </Button>
          <Button 
            variant="contained" 
            onClick={handleUpdate}
            disabled={isUpdating || !editOffer || editOffer.items.length === 0 || !editOffer.validUntil || editOffer.totalPrice <= 0}
            sx={{
              backgroundColor: '#10b981',
              '&:hover': { backgroundColor: '#059669' },
              borderRadius: 2,
              px: 3
            }}
          >
            {isUpdating ? (
              <>
                <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
                Güncelleniyor...
              </>
            ) : (
              'Güncelle'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Convert to Order Modal */}
      <Dialog
        open={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: '#1e3a8a20',
                color: '#1e3a8a',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShoppingCartIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Siparişe Dönüştür
          </Typography>
          </Box>
          <IconButton onClick={() => setIsOrderModalOpen(false)} sx={{ color: '#6b7280' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ color: '#374151', mb: 2 }}>
            Bu teklifi siparişe dönüştürmek istediğinize emin misiniz?
          </Typography>
          {selectedOffer && (
            <Box sx={{ 
              backgroundColor: '#f9fafb', 
              borderRadius: 2, 
              p: 2,
              border: '1px solid #e5e7eb'
            }}>
              <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                Teklif Detayları:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937', mb: 1 }}>
                {selectedOffer.brandName} - ₺{selectedOffer.totalPrice.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                {selectedOffer.items.length} ürün
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setIsOrderModalOpen(false)}
            sx={{ 
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
            disabled={convertingToOrder}
          >
            İptal
          </Button>
          <Button
            variant="contained"
            onClick={confirmConvertToOrder}
            disabled={convertingToOrder}
            sx={{
              backgroundColor: '#1e3a8a',
              '&:hover': { backgroundColor: '#1d4ed8' },
              borderRadius: 2,
              px: 3
            }}
          >
            {convertingToOrder ? 'Dönüştürülüyor...' : 'Siparişe Dönüştür'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Offer Modal */}
      <Dialog
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: '#6b728020',
                color: '#6b7280',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <VisibilityIcon />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Teklif Detayları
          </Typography>
          </Box>
          <IconButton onClick={() => setIsViewModalOpen(false)} sx={{ color: '#6b7280' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {viewOffer && (
            <Box sx={{ display: 'grid', gap: 3 }}>
              {/* Basic Info */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
                gap: 2,
                p: 2,
                backgroundColor: '#f9fafb',
                borderRadius: 2,
                border: '1px solid #e5e7eb'
              }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                    Müşteri
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600 }}>
                    {viewOffer.brandName || 'Bilinmeyen Müşteri'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                    Durum
                  </Typography>
                  <Chip 
                    label={getStatusText(viewOffer.status)} 
                    size="small" 
                    sx={{ 
                      backgroundColor: `${getStatusColor(viewOffer.status)}20`,
                      color: getStatusColor(viewOffer.status),
                      fontWeight: 600,
                      borderRadius: 2
                    }} 
                  />
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                    Oluşturulma Tarihi
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1f2937' }}>
                    {new Date(viewOffer.createdAt).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                    Geçerlilik Tarihi
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#1f2937' }}>
                    {new Date(viewOffer.validUntil).toLocaleDateString('tr-TR')}
                  </Typography>
                </Box>
              </Box>

              {/* Items List */}
              <Box>
                <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600, mb: 2 }}>
                  Ürünler ({viewOffer.items.length})
                </Typography>
                {viewOffer.items.length > 0 ? (
                  <Box sx={{ display: 'grid', gap: 2 }}>
                    {viewOffer.items.map((item, index) => {
                      const product = products.find(p => p.id === item.productId);
                      const lineTotal = item.quantity * item.unitPrice;
                      const taxAmount = lineTotal * (item.taxRate / 100);
                      const totalWithTax = lineTotal + taxAmount;
                      return (
                        <Box 
                          key={index}
                          sx={{ 
                            display: 'grid', 
                            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr 1fr' }, 
                            gap: 2, 
                            alignItems: 'center',
                            p: 2,
                            border: '1px solid #e5e7eb',
                            borderRadius: 2,
                            backgroundColor: '#ffffff'
                          }}
                        >
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                              {product?.name || `Ürün ID: ${item.productId}`}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              Birim: {product?.unit ? getUnitDisplayName(product.unit) : 'Belirtilmemiş'}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              Adet
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {item.quantity}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              Birim Fiyat
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              ₺{item.unitPrice.toFixed(2)}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: { xs: 'left', md: 'center' } }}>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                              KDV (%)
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              %{item.taxRate}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                            <Typography variant="body2" sx={{ color: '#6b7280', mb: 0.5 }}>
                              Net Tutar
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#374151' }}>
                              ₺{lineTotal.toFixed(2)}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                              KDV (%{item.taxRate}): ₺{taxAmount.toFixed(2)}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: '#059669', mt: 0.5 }}>
                              Toplam: ₺{totalWithTax.toFixed(2)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 4, 
                    color: '#6b7280',
                    border: '2px dashed #e5e7eb',
                    borderRadius: 2
                  }}>
                    <Typography variant="body2">
                      Bu teklifte ürün bulunmuyor.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Total Price */}
              <Box sx={{ 
                p: 3, 
                backgroundColor: '#f0fdf4', 
                borderRadius: 2,
                border: '1px solid #10b981',
              }}>
                <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600, mb: 2, textAlign: 'center' }}>
                  Teklif Özeti
                </Typography>
                
                {/* Calculate totals */}
                {(() => {
                  const netTotal = viewOffer.items.reduce((total, item) => {
                    const lineTotal = item.quantity * item.unitPrice;
                    return total + lineTotal;
                  }, 0);
                  
                  const taxTotal = viewOffer.items.reduce((total, item) => {
                    const lineTotal = item.quantity * item.unitPrice;
                    const taxAmount = lineTotal * (item.taxRate / 100);
                    return total + taxAmount;
                  }, 0);
                  
                  const grandTotal = netTotal + taxTotal;
                  
                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ color: '#059669', fontWeight: 500 }}>
                          Net:
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#059669', fontWeight: 600 }}>
                          ₺{netTotal.toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body1" sx={{ color: '#059669', fontWeight: 500 }}>
                          KDV:
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#059669', fontWeight: 600 }}>
                          ₺{taxTotal.toFixed(2)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        pt: 1,
                        borderTop: '1px solid #10b981'
                      }}>
                        <Typography variant="h6" sx={{ color: '#059669', fontWeight: 700 }}>
                          Toplam:
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#059669', fontWeight: 700 }}>
                          ₺{grandTotal.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })()}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setIsViewModalOpen(false)}
            sx={{ 
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            Kapat
          </Button>
          <Button
            variant="outlined"
            startIcon={<LocalOfferIcon />}
            onClick={async () => {
              if (viewOffer) {
                await generatePDF(viewOffer);
              }
            }}
            sx={{
              borderColor: '#10b981',
              color: '#10b981',
              '&:hover': {
                borderColor: '#059669',
                backgroundColor: '#10b98110'
              },
              borderRadius: 2,
              px: 3
            }}
          >
            PDF İndir
          </Button>
          {viewOffer?.status === 'OFFER_SENT' && authService.canConvertOfferToOrder() && (
            <Button
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={() => {
                setIsViewModalOpen(false);
                if (viewOffer) {
                  handleConvertToOrder(viewOffer);
                }
              }}
              sx={{
                backgroundColor: '#1e3a8a',
                '&:hover': { backgroundColor: '#1d4ed8' },
                borderRadius: 2,
                px: 3
              }}
            >
              Siparişe Dönüştür
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Create New Offer Modal */}
      <Dialog
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle
          sx={{
            pb: 2,
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                backgroundColor: '#10b98120',
                color: '#10b981',
                borderRadius: 2,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LocalOfferIcon />
        </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937' }}>
              Yeni Teklif Oluştur
            </Typography>
          </Box>
          <IconButton onClick={() => setIsCreateModalOpen(false)} sx={{ color: '#6b7280' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'grid', gap: 3 }}>
            <FormControl fullWidth>
                              <InputLabel id="brand-select-label">Müşteri</InputLabel>
              <Select
                labelId="brand-select-label"
                id="brand-select"
                                  value={newOffer.brandId}
                  label="Müşteri"
                onChange={(e) => setNewOffer({
                  ...newOffer,
                  brandId: Number(e.target.value)
                })}
                sx={{
                  borderRadius: 2,
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10b981',
                  },
                }}
              >
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
                         {/* Items Section */}
             <Box>
               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                 <Typography variant="h6" sx={{ color: '#1f2937', fontWeight: 600 }}>
                   Ürünler
                 </Typography>
                 <Box sx={{ display: 'flex', gap: 1 }}>
                   <Button
                     variant="outlined"
                     size="small"
                     startIcon={<AddIcon />}
                     onClick={addItem}
                     sx={{
                       borderColor: '#10b981',
                       color: '#10b981',
                       '&:hover': {
                         borderColor: '#059669',
                         backgroundColor: '#10b98110'
                       }
                     }}
                   >
                     Ürün Ekle
                   </Button>
                   <Button
                     variant="outlined"
                     size="small"
                     startIcon={<InventoryIcon />}
                     onClick={() => setIsProductModalOpen(true)}
                     sx={{
                       borderColor: '#3b82f6',
                       color: '#3b82f6',
                       '&:hover': {
                         borderColor: '#2563eb',
                         backgroundColor: '#3b82f610'
                       }
                     }}
                   >
                     Yeni Ürün Oluştur
                   </Button>
                   <Button
                     variant="outlined"
                     size="small"
                     startIcon={<PersonIcon />}
                     onClick={() => setIsBrandModalOpen(true)}
                     sx={{
                       borderColor: '#f59e0b',
                       color: '#f59e0b',
                       '&:hover': {
                         borderColor: '#d97706',
                         backgroundColor: '#f59e0b10'
                       }
                     }}
                   >
                     Yeni Müşteri Oluştur
                   </Button>
                 </Box>
               </Box>
               
               {newOffer.items.map((item, index) => (
                 <Box key={index} sx={{ 
                   display: 'grid', 
                   gridTemplateColumns: '2fr 1fr 1fr 1fr auto', 
                   gap: 2, 
                   alignItems: 'center',
                   mb: 2,
                   p: 2,
                   border: '1px solid #e5e7eb',
                   borderRadius: 2,
                   backgroundColor: '#f9fafb'
                 }}>
                   <FormControl fullWidth size="small">
                     <InputLabel>Ürün</InputLabel>
                     <Select
                       value={item.productId}
                       label="Ürün"
                       onChange={(e) => updateItem(index, 'productId', Number(e.target.value))}
                     >
                       {products.map((product) => (
                         <MenuItem key={product.id} value={product.id}>
                           {product.name} ({getUnitDisplayName(product.unit)})
                         </MenuItem>
                       ))}
                     </Select>
                   </FormControl>
                   
                   <TextField
                     size="small"
                     label="Adet"
                     type="number"
                     value={item.quantity}
                     onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                     inputProps={{ min: 1 }}
                   />
                   
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                     <TextField
                       size="small"
                       label="Birim Fiyat"
                       type="number"
                       value={item.unitPrice}
                       onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                       inputProps={{ min: 0, step: 0.01 }}
                     />
                     {item.productId > 0 && (() => {
                       const selectedProduct = products.find(p => p.id === item.productId);
                       return selectedProduct ? (
                         <Typography 
                           variant="caption" 
                           sx={{ 
                             color: '#6b7280', 
                             fontSize: '0.75rem',
                             fontStyle: 'italic'
                           }}
                         >
                           Asıl fiyat: ₺{selectedProduct.unitPrice.toFixed(2)}
                         </Typography>
                       ) : null;
                     })()}
                   </Box>

                   <TextField
                     size="small"
                     label="KDV (%)"
                     type="number"
                     value={item.taxRate}
                     onChange={(e) => updateItem(index, 'taxRate', parseFloat(e.target.value) || 0)}
                     inputProps={{ min: 0, max: 100, step: 0.01 }}
                   />
                   
                   <IconButton
                     size="small"
                     onClick={() => removeItem(index)}
                     sx={{ color: '#ef4444' }}
                   >
                     <RemoveIcon />
                   </IconButton>
                 </Box>
               ))}
               
               {newOffer.items.length === 0 && (
                 <Box sx={{ 
                   textAlign: 'center', 
                   py: 4, 
                   color: '#6b7280',
                   border: '2px dashed #e5e7eb',
                   borderRadius: 2
                 }}>
                   <Typography variant="body2">
                     Henüz ürün eklenmedi. "Ürün Ekle" butonuna tıklayın.
                   </Typography>
                 </Box>
               )}
             </Box>

             {/* Total Price Display */}
             <Box sx={{ 
               p: 2, 
               backgroundColor: '#f0fdf4', 
               borderRadius: 2,
               border: '1px solid #10b981'
             }}>
               <Typography variant="h6" sx={{ color: '#059669', fontWeight: 600, mb: 1 }}>
                 Teklif Özeti
               </Typography>
               {(() => {
                 const netTotal = newOffer.items.reduce((total, item) => {
                   const lineTotal = item.quantity * item.unitPrice;
                   return total + lineTotal;
                 }, 0);
                 
                 const taxTotal = newOffer.items.reduce((total, item) => {
                   const lineTotal = item.quantity * item.unitPrice;
                   const taxAmount = lineTotal * (item.taxRate / 100);
                   return total + taxAmount;
                 }, 0);
                 
                 const grandTotal = netTotal + taxTotal;
                 
                 return (
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                       <Typography variant="body2" sx={{ color: '#059669' }}>Net:</Typography>
                       <Typography variant="body2" sx={{ color: '#059669', fontWeight: 600 }}>₺{netTotal.toFixed(2)}</Typography>
                     </Box>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                       <Typography variant="body2" sx={{ color: '#059669' }}>
                         KDV ({getTaxRateDisplay(newOffer.items)}):
                       </Typography>
                       <Typography variant="body2" sx={{ color: '#059669', fontWeight: 600 }}>₺{taxTotal.toFixed(2)}</Typography>
                     </Box>
                     <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5, borderTop: '1px solid #10b981' }}>
                       <Typography variant="body1" sx={{ color: '#059669', fontWeight: 700 }}>Toplam:</Typography>
                       <Typography variant="body1" sx={{ color: '#059669', fontWeight: 700 }}>₺{grandTotal.toFixed(2)}</Typography>
                     </Box>
                   </Box>
                 );
               })()}
             </Box>
            
                         <TextField
               fullWidth
               label="Geçerlilik Tarihi"
               type="date"
               value={newOffer.validUntil ? newOffer.validUntil.split('T')[0] : ''}
               onChange={(e) => setNewOffer({
                 ...newOffer,
                 validUntil: e.target.value ? e.target.value + 'T23:59:59.000Z' : ''
               })}
               InputLabelProps={{
                 shrink: true,
               }}
               sx={{
                 '& .MuiOutlinedInput-root': {
                   borderRadius: 2,
                   '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                     borderColor: '#10b981',
                   },
                 },
                 '& .MuiInputLabel-root.Mui-focused': {
                   color: '#10b981',
                 },
               }}
             />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
             onClick={() => {
               setIsCreateModalOpen(false);
               setNewOffer({
                 brandId: 0,
                 status: 'OFFER_SENT' as const,
                 totalPrice: 0,
                 validUntil: '',
                 items: [] as { productId: number; quantity: number; unitPrice: number; taxRate: number; }[]
               });
             }}
             disabled={isCreating}
            sx={{ 
              color: '#6b7280',
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
          >
            İptal
          </Button>
                     <Button
            variant="contained"
             onClick={() => {
               const selectedBrand = brands.find(b => b.id === newOffer.brandId);
               if (selectedBrand && newOffer.items.length > 0 && newOffer.validUntil && newOffer.totalPrice > 0) {
                 handleCreate({
                   brandId: newOffer.brandId,
                   status: newOffer.status,
                   totalPrice: newOffer.totalPrice,
                   validUntil: newOffer.validUntil,
                   items: newOffer.items,
                   brandName: selectedBrand.name
                 });
                 setNewOffer({
                   brandId: 0,
                   status: 'OFFER_SENT' as const,
                   totalPrice: 0,
                   validUntil: '',
                   items: [] as { productId: number; quantity: number; unitPrice: number; taxRate: number; }[]
                 });
               }
             }}
             disabled={isCreating || !newOffer.brandId || newOffer.items.length === 0 || !newOffer.validUntil || newOffer.totalPrice <= 0}
             sx={{
               backgroundColor: '#10b981',
               '&:hover': { backgroundColor: '#059669' },
               borderRadius: 2,
               px: 3
             }}
           >
             {isCreating ? (
               <>
                 <CircularProgress size={16} sx={{ color: 'white', mr: 1 }} />
                 Oluşturuluyor...
               </>
             ) : (
               'Teklif Oluştur'
             )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteOffer}
        title="Teklif Silme Onayı"
        message="Bu teklifi silmek istediğinize emin misiniz?"
        loading={isDeleting}
        confirmText={isDeleting ? 'Siliniyor...' : 'Sil'}
      />

      {/* Brand Form Modal */}
      <BrandFormModal
        open={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onSubmit={handleCreateBrand}
        title="Yeni Müşteri Oluştur"
        loading={isCreatingBrand}
      />

      {/* Product Form Modal */}
      <Dialog open={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Yeni Ürün Oluştur</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="Ürün Adı"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Açıklama"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Birim</InputLabel>
              <Select
                value={productForm.unit}
                label="Birim"
                onChange={(e) => setProductForm({ ...productForm, unit: e.target.value as Unit })}
              >
                {Object.values(Unit).map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {getUnitDisplayName(unit)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Birim Fiyat"
              type="number"
              value={productForm.unitPrice}
              onChange={(e) => setProductForm({ ...productForm, unitPrice: parseFloat(e.target.value) || 0 })}
              inputProps={{ min: 0, step: 0.01 }}
              required
            />
            <TextField
              fullWidth
              label="Vergi Oranı (%)"
              type="number"
              value={productForm.taxRate}
              onChange={(e) => setProductForm({ ...productForm, taxRate: parseFloat(e.target.value) || 20 })}
              inputProps={{ min: 0, max: 100, step: 0.01 }}
            />
        </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsProductModalOpen(false);
            setProductForm({
              name: '',
              description: '',
              unit: Unit.ADET,
              unitPrice: 0,
              taxRate: 20
            });
          }}>İptal</Button>
          <Button 
            variant="contained" 
            color="primary"
            disabled={isCreatingProduct || !productForm.name || productForm.unitPrice <= 0}
            onClick={() => handleCreateProduct(productForm)}
          >
            {isCreatingProduct ? 'Oluşturuluyor...' : 'Oluştur'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Offers;

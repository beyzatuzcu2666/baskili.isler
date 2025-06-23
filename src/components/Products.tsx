import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Product } from '../types/product';
import { productsService } from '../services/products';

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProductName, setNewProductName] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsService.getAll();
      if (!Array.isArray(data)) {
        throw new Error('Invalid products data format');
      }
      setProducts(data);
      setError(null);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Ürünler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newProductName.trim()) return;

    try {
      const product = await productsService.create({ name: newProductName });
      setProducts([...products, product]);
      setNewProductName('');
      setOpenDialog(false);
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleEdit = async (product: Product) => {
    setSelectedProduct(product);
    setNewProductName(product.name);
    setOpenDialog(true);
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;

    try {
      const updatedProduct = await productsService.update(selectedProduct.id, { name: newProductName });
      setProducts(products.map(p => p.id === selectedProduct.id ? updatedProduct : p));
      setSelectedProduct(null);
      setNewProductName('');
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await productsService.delete(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Ürünler</h2>
          <Button variant="contained" color="primary" onClick={() => {
            setSelectedProduct(null);
            setNewProductName('');
            setOpenDialog(true);
          }}>
            Yeni Ürün Ekle
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ürün Adı</TableCell>
                <TableCell>Oluşturulma Tarihi</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: '20px', height: '20px', border: '3px solid #f3f3f3', borderTop: '3px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 10px' }}></div>
                    <span>Yükleniyor...</span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Ürünler</h2>
          <Button variant="contained" color="primary" onClick={() => {
            setSelectedProduct(null);
            setNewProductName('');
            setOpenDialog(true);
          }}>
            Yeni Ürün Ekle
          </Button>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ürün Adı</TableCell>
                <TableCell>Oluşturulma Tarihi</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} style={{ textAlign: 'center', padding: '20px', color: '#dc3545' }}>
                  {error}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Ürünler</h2>
        <Button variant="contained" color="primary" onClick={() => {
          setSelectedProduct(null);
          setNewProductName('');
          setOpenDialog(true);
        }}>
          Yeni Ürün Ekle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ürün Adı</TableCell>
              <TableCell>Oluşturulma Tarihi</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} style={{ textAlign: 'center' }}>
                  Kayıtlı ürün bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{new Date(product.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleEdit(product)}
                    >
                      Düzenle
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      sx={{ ml: 1 }}
                      onClick={() => handleDelete(product.id)}
                    >
                      Sil
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{selectedProduct ? 'Ürünü Düzenle' : 'Yeni Ürün'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Ürün Adı"
            fullWidth
            value={newProductName}
            onChange={(e) => setNewProductName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>İptal</Button>
          <Button 
            variant="contained" 
            onClick={selectedProduct ? handleUpdate : handleCreate}
          >
            {selectedProduct ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Products;

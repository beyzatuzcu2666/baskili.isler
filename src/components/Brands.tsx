import React, { useEffect, useState } from 'react';
import { brandsService } from '../services/brands';
import { Brand } from '../services/brands';
import '../components/Brands.css';
import { Button } from '@mui/material';
import { BrandFormModal } from './BrandFormModal';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ConfirmationDialog } from './ConfirmationDialog';

const Brands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteBrandId, setDeleteBrandId] = useState<number | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const data = await brandsService.getBrands();
        console.log(data);
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

  if (loading) {
    return (
      <div className="brands-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Markalar</h2>
          <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
            Marka Ekle
          </Button>
        </div>
        <div className="brands-table">
          <div className="table-wrapper">
            <div className="table-content">
              <table>
                <thead>
                  <tr>
                    <th style={{ minWidth: '200px' }}>Marka Adı</th>
                    <th style={{ minWidth: '250px' }}>E-posta</th>
                    <th style={{ minWidth: '150px' }}>Telefon</th>
                    <th style={{ minWidth: '100px' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="loading">
                      <div className="loading-spinner"></div>
                      <span>Yükleniyor...</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brands-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Markalar</h2>
          <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
            Marka Ekle
          </Button>
        </div>
        <div className="brands-table">
          <div className="table-wrapper">
            <div className="table-content">
              <table>
                <thead>
                  <tr>
                    <th style={{ minWidth: '200px' }}>Marka Adı</th>
                    <th style={{ minWidth: '250px' }}>E-posta</th>
                    <th style={{ minWidth: '150px' }}>Telefon</th>
                    <th style={{ minWidth: '100px' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4} className="error-message">
                      <span>{error}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddBrand = async (data: {
    name: string;
    contactEmail: string;
    contactPhone: string;
  }) => {
    try {
      await brandsService.createBrand(data);
      // Refresh brands list after successful addition
      const updatedBrands = await brandsService.getBrands();
      setBrands(updatedBrands);
    } catch (error) {
      console.error('Error adding brand:', error);
      setError('Marka eklenirken bir hata oluştu');
    }
  };

  const handleEditBrand = async (brandId: number, data: {
    name: string;
    contactEmail: string;
    contactPhone: string;
  }) => {
    try {
      await brandsService.updateBrand(brandId, data);
      // Refresh brands list after successful update
      const updatedBrands = await brandsService.getBrands();
      setBrands(updatedBrands);
    } catch (error) {
      console.error('Error updating brand:', error);
      setError('Marka güncellenirken bir hata oluştu');
    }
  };

  const handleDeleteBrand = async (brandId: number) => {
    setDeleteBrandId(brandId);
    setConfirmDelete(true);
  };

  const confirmDeleteBrand = async () => {
    if (deleteBrandId) {
      try {
        await brandsService.deleteBrand(deleteBrandId);
        // Refresh brands list after successful deletion
        const updatedBrands = await brandsService.getBrands();
        setBrands(updatedBrands);
        setConfirmDelete(false);
      } catch (error) {
        console.error('Error deleting brand:', error);
        setError('Marka silinirken bir hata oluştu');
      }
    }
  };

  return (
    <div className="brands-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Markalar</h2>
        <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
          Marka Ekle
        </Button>
      </div>
      <div className="brands-table">
        <div className="table-wrapper">
          <div className="table-content">
            <table>
              <thead>
                <tr>
                  <th style={{ minWidth: '200px' }}>Marka Adı</th>
                  <th style={{ minWidth: '250px' }}>E-posta</th>
                  <th style={{ minWidth: '150px' }}>Telefon</th>
                  <th style={{ minWidth: '100px' }}>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="no-data">
                      Kayıtlı marka bulunamadı
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => (
                    <tr key={brand.id}>
                      <td style={{ minWidth: '200px' }}>{brand.name}</td>
                      <td style={{ minWidth: '250px' }}>{brand.contactEmail}</td>
                      <td style={{ minWidth: '150px' }}>{brand.contactPhone}</td>
                      <td style={{ minWidth: '100px', textAlign: 'center' }}>
                        <EditIcon 
                          fontSize="small" 
                          style={{ cursor: 'pointer', marginRight: 8 }} 
                          onClick={() => {
                            setSelectedBrand(brand);
                            setIsEditModalOpen(true);
                          }}
                        />
                        <DeleteIcon 
                          fontSize="small" 
                          style={{ cursor: 'pointer', color: 'red' }} 
                          onClick={() => handleDeleteBrand(brand.id)}
                          titleAccess="Sil"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <BrandFormModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddBrand}
        title="Marka Ekle"
        isUpdate={false}
      />
      <BrandFormModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={(data) => handleEditBrand(selectedBrand?.id || 0, data)}
        initialData={selectedBrand || undefined}
        title="Marka Güncelle"
        isUpdate={true}
        brandId={selectedBrand?.id}
      />
      <ConfirmationDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmDeleteBrand}
        title="Marka Silme Onayı"
        message="Bu markayı silmek istediğinize emin misiniz?"
      />
    </div>
  );
};

export default Brands;

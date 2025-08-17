import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Dealer } from '../types/dealer';
import { authService } from '../services/auth';
import { dealersService } from '../services/dealers';

interface DealerContextType {
  selectedDealer: Dealer | null;
  setSelectedDealer: (dealer: Dealer | null) => void;
  isSuperAdmin: boolean;
  dealers: Dealer[];
  loading: boolean;
  error: string | null;
  isChangingDealer: boolean;
  resetChangingDealer: () => void;
}

const DealerContext = createContext<DealerContextType | undefined>(undefined);

interface DealerProviderProps {
  children: ReactNode;
}

export const DealerProvider: React.FC<DealerProviderProps> = ({ children }) => {
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangingDealer, setIsChangingDealer] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  
  // Kullanıcı rolünü kontrol et
  useEffect(() => {
    const checkUserRole = () => {
      const superAdmin = authService.isSuperAdmin();
      setIsSuperAdmin(superAdmin);
    };
    
    checkUserRole();
    
    // Token değişikliklerini dinle
    const interval = setInterval(checkUserRole, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dealer seçimi değiştiğinde localStorage'a kaydet
  const handleSetSelectedDealer = (dealer: Dealer | null) => {
    setIsChangingDealer(true);
    setSelectedDealer(dealer);
    if (dealer) {
      localStorage.setItem('selectedDealerId', dealer.id.toString());
    } else {
      localStorage.removeItem('selectedDealerId');
    }
    
    // Minimum 2.5 saniye loading göster
    setTimeout(() => {
      setIsChangingDealer(false);
    }, 2500);
  };

  // Dealers'ları yükle
  useEffect(() => {
    const loadDealers = async () => {
      if (!isSuperAdmin) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await dealersService.getDealers();
        setDealers(data);
        
        // LocalStorage'dan seçili dealer'ı al
        const savedDealerId = localStorage.getItem('selectedDealerId');
        if (savedDealerId) {
          const savedDealer = data.find(d => d.id === parseInt(savedDealerId));
          if (savedDealer) {
            setSelectedDealer(savedDealer);
          } else {
            // Kayıtlı dealer bulunamazsa varsayılan dealer'ı seç
            const defaultDealer = data.find(d => d.id === 1);
            if (defaultDealer) {
              setSelectedDealer(defaultDealer);
              localStorage.setItem('selectedDealerId', '1');
            }
          }
        } else {
          // LocalStorage'da kayıt yoksa varsayılan dealer'ı seç
          const defaultDealer = data.find(d => d.id === 1);
          if (defaultDealer) {
            setSelectedDealer(defaultDealer);
            localStorage.setItem('selectedDealerId', '1');
          }
        }
      } catch (err) {
        setError('Bayiler yüklenirken bir hata oluştu');
        console.error('Dealers load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDealers();
  }, [isSuperAdmin]);

  const value: DealerContextType = {
    selectedDealer,
    setSelectedDealer: handleSetSelectedDealer,
    isSuperAdmin,
    dealers,
    loading,
    error,
    isChangingDealer,
    resetChangingDealer: () => setIsChangingDealer(false)
  };

  return (
    <DealerContext.Provider value={value}>
      {children}
    </DealerContext.Provider>
  );
};

export const useDealer = (): DealerContextType => {
  const context = useContext(DealerContext);
  if (context === undefined) {
    throw new Error('useDealer must be used within a DealerProvider');
  }
  return context;
}; 
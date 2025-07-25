import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Dealer } from '../types/dealer';
import { User, UserRole } from '../types/user';
import { dealersService } from '../services/dealers';
import { usersService } from '../services/users';
import { authService } from '../services/auth';

interface DealerContextType {
  selectedDealer: Dealer | null;
  setSelectedDealer: (dealer: Dealer | null) => void;
  availableDealers: Dealer[];
  currentUser: User | null;
  isSuperAdmin: boolean;
  isDealerAdmin: boolean;
  isDealerUser: boolean;
  isFactoryUser: boolean;
  loading: boolean;
  refreshDealers: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
}

const DealerContext = createContext<DealerContextType | undefined>(undefined);

interface DealerProviderProps {
  children: ReactNode;
}

export const DealerProvider: React.FC<DealerProviderProps> = ({ children }) => {
  const [selectedDealer, setSelectedDealer] = useState<Dealer | null>(null);
  const [availableDealers, setAvailableDealers] = useState<Dealer[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Role helpers
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isDealerAdmin = currentUser?.role === UserRole.DEALER_ADMIN;
  const isDealerUser = currentUser?.role === UserRole.DEALER_USER;
  const isFactoryUser = currentUser?.role === UserRole.FACTORY_USER;

  // Load current user
  const refreshCurrentUser = async () => {
    try {
      const user = await usersService.getCurrentUser();
      console.log('Loaded current user:', user);
      setCurrentUser(user);
      
      // Eğer kullanıcı bir bayie bağlıysa, o bayiyi seç
      if (user.dealerId && !selectedDealer) {
        const userDealer = availableDealers.find(d => d.id === user.dealerId);
        if (userDealer) {
          setSelectedDealer(userDealer);
        }
      }
    } catch (error) {
      console.error('Error loading current user:', error);
      // Test kullanıcısı ekle (backend hazır olmadığında)
      const testUser = {
        id: 1,
        email: 'admin@example.com',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'SUPER_ADMIN' as any,
        dealerId: undefined,
        dealerName: undefined,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      console.log('Using test user:', testUser);
      setCurrentUser(testUser);
    }
  };

  // Load available dealers
  const refreshDealers = async () => {
    try {
      const dealers = await dealersService.getActive();
      console.log('Loaded dealers:', dealers);
      setAvailableDealers(dealers);
      
      // Eğer seçili bayi artık mevcut değilse, temizle
      if (selectedDealer && !dealers.find(d => d.id === selectedDealer.id)) {
        setSelectedDealer(null);
      }
    } catch (error) {
      console.error('Error loading dealers:', error);
      // Test verisi ekle (backend hazır olmadığında)
      const testDealers = [
        {
          id: 1,
          code: 'BAYI001',
          name: 'Test Bayi 1',
          contactEmail: 'test1@example.com',
          contactPhone: '+905551234567',
          address: 'Test Adres 1',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          code: 'BAYI002',
          name: 'Test Bayi 2',
          contactEmail: 'test2@example.com',
          contactPhone: '+905559876543',
          address: 'Test Adres 2',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      console.log('Using test dealers:', testDealers);
      setAvailableDealers(testDealers);
    }
  };

  // Initial load
  useEffect(() => {
    const initializeContext = async () => {
      setLoading(true);
      try {
        await Promise.all([
          refreshCurrentUser(),
          refreshDealers()
        ]);
      } catch (error) {
        console.error('Error initializing dealer context:', error);
      } finally {
        setLoading(false);
      }
    };

    if (authService.isAuthenticated()) {
      initializeContext();
    } else {
      setLoading(false);
    }
  }, []);

  const value: DealerContextType = {
    selectedDealer,
    setSelectedDealer,
    availableDealers,
    currentUser,
    isSuperAdmin,
    isDealerAdmin,
    isDealerUser,
    isFactoryUser,
    loading,
    refreshDealers,
    refreshCurrentUser
  };

  return (
    <DealerContext.Provider value={value}>
      {children}
    </DealerContext.Provider>
  );
};

export const useDealer = () => {
  const context = useContext(DealerContext);
  if (context === undefined) {
    throw new Error('useDealer must be used within a DealerProvider');
  }
  return context;
}; 
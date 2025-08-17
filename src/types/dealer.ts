export interface DealerAdmin {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface Dealer {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  taxNumber: string;
  active: boolean;
  admin: DealerAdmin;
  createdAt?: string;
  updatedAt?: string;
} 
export interface Dealer {
  id: number;
  code: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DealerCreateDto {
  code: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  address?: string;
}

export interface DealerUpdateDto {
  code?: string;
  name?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isActive?: boolean;
}

export interface DealerWizardData {
  dealer: DealerCreateDto;
  adminUser: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  };
} 
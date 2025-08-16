export interface Factory {
  id: number;
  name: string;
  address: string;
  factoryNumber?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FactoryUser {
  name: string;
  email: string;
  phoneNumber: string;
}

export interface CreateFactoryRequest {
  factory: {
    name: string;
    address: string;
    factoryNumber: string;
    active: boolean;
  };
  user: FactoryUser;
}

export interface UpdateFactoryRequest {
  name: string;
  address: string;
  factoryNumber?: string;
  active: boolean;
} 
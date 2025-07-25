export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DEALER_ADMIN = 'DEALER_ADMIN',
  DEALER_USER = 'DEALER_USER',
  FACTORY_USER = 'FACTORY_USER'
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  dealerId?: number;
  dealerName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface UserCreateDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  dealerId?: number;
}

export interface UserUpdateDto {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  dealerId?: number;
  isActive?: boolean;
}

export interface UserResponseDto {
  user: User;
  temporaryPassword?: string;
} 
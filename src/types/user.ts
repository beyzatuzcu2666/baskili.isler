export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DEALER_ADMIN = 'DEALER_ADMIN',
  DEALER_USER = 'DEALER_USER',
  FACTORY_USER = 'FACTORY_USER'
}

export const UserRoleLabels: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Süper Admin',
  [UserRole.DEALER_ADMIN]: 'Bayi Admin',
  [UserRole.DEALER_USER]: 'Bayi Kullanıcısı',
  [UserRole.FACTORY_USER]: 'Fabrika Kullanıcısı'
}; 
export interface Brand {
  id: number;
  name: string;
  contactEmail: string;
  contactPhone: string;
  logoUrl?: string;
  taxNumber?: string | null;
  createdAt?: string;
  assignedUserId?: number;
}

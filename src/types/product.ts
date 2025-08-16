// Backend'deki Unit enum'una uygun
export enum Unit {
  ADET = "ADET",
  KG = "KG", 
  METRE = "METRE",
  LITRE = "LITRE",
  M2 = "M2",
  CM = "CM",
  MM = "MM",
  TON = "TON",
  GRAM = "GRAM"
}

// Unit display name'leri
export const getUnitDisplayName = (unit: Unit): string => {
  const displayNames: Record<Unit, string> = {
    [Unit.ADET]: "Adet",
    [Unit.KG]: "Kilogram",
    [Unit.METRE]: "Metre", 
    [Unit.LITRE]: "Litre",
    [Unit.M2]: "Metrekare",
    [Unit.CM]: "Santimetre",
    [Unit.MM]: "Milimetre",
    [Unit.TON]: "Ton",
    [Unit.GRAM]: "Gram"
  };
  return displayNames[unit];
};

// Backend'deki Product entity'sine uygun interface
export interface Product {
  id: number;
  name: string;
  description?: string;
  unit: Unit;
  unitPrice: number;
  taxRate: number;
  active: boolean;
}

// Product oluşturma için DTO
export interface ProductCreateDto {
  name: string;
  description?: string;
  unit: Unit;
  unitPrice: number;
  taxRate?: number;
  dealerId?: number; // SUPER_ADMIN için dealer ID
}

// Product güncelleme için DTO
export interface ProductUpdateDto {
  name?: string;
  description?: string;
  unit?: Unit;
  unitPrice?: number;
  taxRate?: number;
}

// Product response DTO (backend'den gelen)
export interface ProductResponseDto {
  id: number;
  name: string;
  description?: string;
  unit: Unit;
  unitPrice: number;
  taxRate: number;
  active: boolean;
}

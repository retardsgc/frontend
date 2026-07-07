export interface Address {
  _id?: string;
  label: 'home' | 'work' | 'other';
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface AddressValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export type AddressFormData = Omit<Address, '_id'>;

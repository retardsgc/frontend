import axios from 'axios';
import { Address, AddressValidationResult, AddressFormData } from '../types/Address';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:openLogin'));
    }
    return Promise.reject(error);
  }
);

class AddressService {
  // Get all addresses
  async getAddresses(): Promise<Address[]> {
    try {
      const response = await api.get('/addresses');
      // Backend returns { success: true, data: [...] }
      return response.data?.data || response.data || [];
    } catch (error: any) {
      return []; // Return empty array on error
    }
  }

  // Get default address
  async getDefaultAddress(): Promise<Address | null> {
    try {
      const response = await api.get('/addresses/default');
      return response.data?.data || response.data || null;
    } catch (error: any) {
      return null;
    }
  }

  // Add new address
  async addAddress(addressData: AddressFormData): Promise<Address> {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data?.data || response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to add address' };
    }
  }

  // Update address
  async updateAddress(addressId: string, addressData: Partial<Address>): Promise<Address> {
    try {
      const response = await api.patch(`/addresses/${addressId}`, addressData);
      return response.data?.data || response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to update address' };
    }
  }

  // Delete address
  async deleteAddress(addressId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/addresses/${addressId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to delete address' };
    }
  }

  // Set address as default
  async setDefaultAddress(addressId: string): Promise<Address> {
    try {
      const response = await api.patch(`/addresses/${addressId}/default`);
      return response.data?.data || response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to set default address' };
    }
  }

  // Validate address fields
  validateAddress(address: Partial<Address>): AddressValidationResult {
    const errors: Record<string, string> = {};
    const requiredFields: Record<string, string> = {
      fullName: 'Full name',
      phone: 'Phone number',
      addressLine1: 'Address',
      city: 'City',
      state: 'State',
      postalCode: 'Postal code'
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      const value = address[field as keyof Address];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors[field] = `${label} is required`;
      }
    });

    // Validate phone number format
    if (address.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(address.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Validate postal code format (Indian - 6 digits)
    if (address.postalCode && !/^\d{6}$/.test(address.postalCode)) {
      errors.postalCode = 'Please enter a valid 6-digit postal code';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Format address for display
  formatAddress(address: Address | null): string {
    if (!address) return '';
    const parts = [
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country
    ].filter(Boolean);
    return parts.join(', ');
  }

  // Format address as multiple lines
  formatAddressLines(address: Address | null): string[] {
    if (!address) return [];
    return [
      address.fullName,
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country,
      address.phone
    ].filter((line): line is string => Boolean(line));
  }
}

// Export both the class instance and the Address type
const addressService = new AddressService();
export default addressService;
export type { Address };

import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

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
  async getAddresses() {
    try {
      const response = await api.get('/addresses');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get addresses' };
    }
  }

  // Get default address
  async getDefaultAddress() {
    try {
      const response = await api.get('/addresses/default');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get default address' };
    }
  }

  // Add new address
  async addAddress(addressData) {
    try {
      const response = await api.post('/addresses', addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add address' };
    }
  }

  // Update address
  async updateAddress(addressId, addressData) {
    try {
      const response = await api.patch(`/addresses/${addressId}`, addressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update address' };
    }
  }

  // Delete address
  async deleteAddress(addressId) {
    try {
      const response = await api.delete(`/addresses/${addressId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete address' };
    }
  }

  // Set address as default
  async setDefaultAddress(addressId) {
    try {
      const response = await api.patch(`/addresses/${addressId}/default`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to set default address' };
    }
  }

  // Validate address fields
  validateAddress(address) {
    const errors = {};
    const requiredFields = {
      fullName: 'Full name',
      phone: 'Phone number',
      addressLine1: 'Address',
      city: 'City',
      state: 'State',
      postalCode: 'Postal code'
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!address[field] || address[field].trim() === '') {
        errors[field] = `${label} is required`;
      }
    });

    // Validate phone number format
    if (address.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(address.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Validate postal code format (US)
    if (address.postalCode && !/^\d{5}(-\d{4})?$/.test(address.postalCode)) {
      errors.postalCode = 'Please enter a valid ZIP code';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Format address for display
  formatAddress(address) {
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
  formatAddressLines(address) {
    if (!address) return [];
    return [
      address.fullName,
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country,
      address.phone
    ].filter(Boolean);
  }
}

export default new AddressService();

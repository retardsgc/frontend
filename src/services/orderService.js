import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

class OrderService {
  // Create order directly from product selection
  async createDirectOrder(orderData) {
    try {
      const response = await api.post('/orders/direct', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create order' };
    }
  }
  // Create order from current cart
  async createOrderFromCart() {
    try {
      const response = await api.post('/orders');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create order from cart' };
    }
  }

  // Get user's orders
  async getMyOrders() {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get orders' };
    }
  }

  // Get specific order by ID
  async getOrderById(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get order' };
    }
  }

  // Get order tracking information
  async getOrderTracking(orderId) {
    try {
      const response = await api.get(`/orders/${orderId}/tracking`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get tracking information' };
    }
  }

  // Create reorder from existing order
  async reorderFromOrder(orderId) {
    try {
      const response = await api.post(`/orders/${orderId}/reorder`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create reorder' };
    }
  }

  // Get order statistics
  async getOrderStats() {
    try {
      const response = await api.get('/orders/stats/overview');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get order statistics' };
    }
  }

  // Cancel order (if pending)
  async cancelOrder(orderId) {
    try {
      const response = await api.patch(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to cancel order' };
    }
  }
  // Validate shipping address
  validateShippingAddress(address) {
    const errors = {};
    const requiredFields = {
      fullName: 'Full name',
      addressLine1: 'Address',
      city: 'City',
      state: 'State',
      postalCode: 'ZIP code',
      phone: 'Phone number'
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!address[field] || address[field].trim() === '') {
        errors[field] = `${label} is required`;
      }
    });

    // Validate phone number format (basic validation)
    if (address.phone && !/^\+?[\d\s\-\(\)]{10,}$/.test(address.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }

    // Validate postal code format (basic validation for US)
    if (address.postalCode && !/^\d{5}(-\d{4})?$/.test(address.postalCode)) {
      errors.postalCode = 'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Calculate shipping cost
  calculateShipping(subtotal) {
    return subtotal > 50 ? 0 : 10; // Free shipping over ₹50
  }

  // Format price
  formatPrice(price) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(price);
  }

  // Generate order summary for display
  generateOrderSummary(product, quantity, shippingCost) {
    const subtotal = product.price * quantity;
    const total = subtotal + shippingCost;

    return {
      product: {
        id: product._id || product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        formattedPrice: this.formatPrice(product.price)
      },
      quantity,
      subtotal,
      shipping: shippingCost,
      total,
      formattedSubtotal: this.formatPrice(subtotal),
      formattedShipping: shippingCost === 0 ? 'FREE' : this.formatPrice(shippingCost),
      formattedTotal: this.formatPrice(total)
    };
  }
}

export default new OrderService();








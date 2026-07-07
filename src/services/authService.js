import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const clearAuthStorage = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const parseJwtPayload = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4 || 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const isTokenValid = (token) => {
  if (!token || typeof token !== 'string') return false;
  const payload = parseJwtPayload(token);
  if (!payload) return false;
  // If exp is present, enforce it. If missing, treat token as invalid for storefront auth.
  if (!payload.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now;
};

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && isTokenValid(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token) {
    clearAuthStorage();
    window.dispatchEvent(new Event('auth:changed'));
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthStorage();
      window.dispatchEvent(new Event('auth:changed'));
      // Open login modal instead of redirecting to a page
      window.dispatchEvent(new Event('auth:openLogin'));
    }
    return Promise.reject(error);
  }
);

class AuthService {
  // Send OTP for email verification
  async sendOTP(email) {
    try {
      const response = await api.post('/auth/send-otp', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to send verification code' };
    }
  }

  // Verify OTP
  async verifyOTP(email, otp) {
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'OTP verification failed' };
    }
  }

  // Resend OTP
  async resendOTP(email) {
    try {
      const response = await api.post('/auth/resend-otp', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to resend verification code' };
    }
  }

  // Register new user
  async signup(userData) {
    try {
      const response = await api.post('/auth/signup', userData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        window.dispatchEvent(new Event('auth:changed'));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Signup failed' };
    }
  }

  // Login user
  async login(credentials, rememberMe = false) {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        
        // If remember me is checked, store a flag
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('rememberedEmail', credentials.email);
        } else {
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('rememberedEmail');
        }
        
        window.dispatchEvent(new Event('auth:changed'));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Login failed' };
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgotPassword', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Forgot password request failed' };
    }
  }

  // Reset password
  async resetPassword(token, passwordData) {
    try {
      const response = await api.patch(`/auth/resetPassword/${token}`, passwordData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        window.dispatchEvent(new Event('auth:changed'));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password reset failed' };
    }
  }

  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get user data' };
    }
  }

  // Update user profile
  async updateProfile(userData) {
    try {
      const response = await api.patch('/auth/updateMe', userData);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.data));
        window.dispatchEvent(new Event('auth:changed'));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Profile update failed' };
    }
  }

  // Update password
  async updatePassword(passwordData) {
    try {
      const response = await api.patch('/auth/updatePassword', passwordData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data));
        window.dispatchEvent(new Event('auth:changed'));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Password update failed' };
    }
  }

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear remember me data on logout
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('rememberedEmail');
    // Clear any per-user welcome flags
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith('welcomeShown:'))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
  window.dispatchEvent(new Event('auth:changed'));
  // Open login modal (no page redirects)
  window.dispatchEvent(new Event('auth:openLogin'));
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = localStorage.getItem('token');
    if (!token) return false;
    if (!isTokenValid(token)) {
      clearAuthStorage();
      return false;
    }
    return true;
  }

  // Get current user from localStorage
  getCurrentUserFromStorage() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Get token from localStorage
  getToken() {
    const token = localStorage.getItem('token');
    if (!token || !isTokenValid(token)) {
      clearAuthStorage();
      return null;
    }
    return token;
  }

  // Check if remember me is enabled
  isRememberMeEnabled() {
    return localStorage.getItem('rememberMe') === 'true';
  }

  // Get remembered email
  getRememberedEmail() {
    return localStorage.getItem('rememberedEmail');
  }

  // Auto-login if remember me is enabled and token exists
  autoLogin() {
    const token = this.getToken();
    const rememberMe = this.isRememberMeEnabled();
    
    if (token && rememberMe) {
      // Token exists and remember me is enabled, user should be logged in
      return true;
    }
    
    return false;
  }
}

export default new AuthService();


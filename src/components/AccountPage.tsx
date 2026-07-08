import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import addressService from '../services/addressService';
import { Address, AddressFormData } from '../types/Address';
import LogoutConfirmation from './LogoutConfirmation';
import Toast from './Toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  totalAmount?: number; // legacy field
  items: Array<{
    product?: {
      name: string;
      images: string[];
    };
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
}

// Chevron Icon Component
const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg 
    className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const AccountPage = () => {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState<string | null>('dashboard');
  
  // User state
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Address state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressFormData, setAddressFormData] = useState<AddressFormData>({
    label: 'home',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({});
  
  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  // Account details state
  const [accountForm, setAccountForm] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [accountSaving, setAccountSaving] = useState(false);
  
  // Logout state
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({ message: '', type: 'success', isVisible: false });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  // Check auth and fetch user data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      window.dispatchEvent(new Event('auth:openLogin'));
      return;
    }
    fetchUserData();
  }, [navigate]);

  // Fetch addresses when addresses section is expanded
  useEffect(() => {
    if (expandedSection === 'addresses' && user) {
      fetchAddresses();
    }
  }, [expandedSection, user]);

  // Fetch orders when orders section is expanded
  useEffect(() => {
    if (expandedSection === 'orders' && user) {
      fetchOrders();
    }
  }, [expandedSection, user]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/');
          window.dispatchEvent(new Event('auth:openLogin'));
          return;
        }
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      const userData = data.data || data;
      setUser(userData);
      
      // Populate account form
      const nameParts = (userData.name || '').split(' ');
      setAccountForm(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        displayName: userData.name || '',
        email: userData.email || ''
      }));
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    setAddressLoading(true);
    try {
      const data = await addressService.getAddresses();
      // Ensure we always have an array
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const ordersData = data.data || data || [];
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = addressService.validateAddress(addressFormData as Address);
    if (!validation.isValid) {
      setAddressErrors(validation.errors);
      return;
    }
    
    setAddressLoading(true);
    try {
      if (editingAddress) {
        await addressService.updateAddress(editingAddress._id!, addressFormData);
      } else {
        await addressService.addAddress(addressFormData);
      }
      await fetchAddresses();
      resetAddressForm();
      showToast('Address saved successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to save address', 'error');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await addressService.deleteAddress(addressId);
      await fetchAddresses();
      showToast('Address deleted successfully!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Failed to delete address', 'error');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      await addressService.setDefaultAddress(addressId);
      await fetchAddresses();
    } catch (error: any) {
      // Error handled silently
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressFormData({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  const resetAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressFormData({
      label: 'home',
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false
    });
    setAddressErrors({});
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountSaving(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Update profile using correct endpoint (PATCH /api/auth/updateMe)
      const profileResponse = await fetch(`${API_BASE_URL}/auth/updateMe`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `${accountForm.firstName} ${accountForm.lastName}`.trim(),
          email: accountForm.email
        })
      });
      
      if (!profileResponse.ok) {
        throw new Error('Failed to update profile');
      }
      
      // Update password if provided
      if (accountForm.currentPassword && accountForm.newPassword) {
        if (accountForm.newPassword !== accountForm.confirmPassword) {
          showToast('New passwords do not match', 'error');
          setAccountSaving(false);
          return;
        }
        
        // Use correct endpoint (PATCH /api/auth/updatePassword)
        const passwordResponse = await fetch(`${API_BASE_URL}/auth/updatePassword`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: accountForm.currentPassword,
            newPassword: accountForm.newPassword,
            newPasswordConfirm: accountForm.confirmPassword
          })
        });
        
        if (!passwordResponse.ok) {
          const data = await passwordResponse.json();
          throw new Error(data.message || 'Failed to change password');
        }
      }
      
      showToast('Changes saved successfully!', 'success');
      setAccountForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      // Update local storage
      const updatedUser = { ...user, name: `${accountForm.firstName} ${accountForm.lastName}`.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('auth:changed'));
      
    } catch (error: any) {
      showToast(error.message || 'Failed to save changes', 'error');
    } finally {
      setAccountSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth:changed'));
    navigate('/');
  };

  const handleSectionToggle = (sectionId: string) => {
    if (sectionId === 'logout') {
      setShowLogoutConfirmation(true);
    } else if (sectionId === 'wishlist') {
      navigate('/wishlist');
    } else {
      setExpandedSection(expandedSection === sectionId ? null : sectionId);
    }
  };

  const renderDashboard = () => (
    <div className="text-left">
      <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
        From your account dashboard you can view your{' '}
        <button 
          onClick={() => setExpandedSection('orders')}
          className="text-red-500 hover:text-red-600 underline"
        >
          recent orders
        </button>
        , manage your{' '}
        <button 
          onClick={() => setExpandedSection('addresses')}
          className="text-red-500 hover:text-red-600 underline"
        >
          shipping and billing addresses
        </button>
        , and{' '}
        <button 
          onClick={() => setExpandedSection('account-details')}
          className="text-red-500 hover:text-red-600 underline"
        >
          edit your password and account details
        </button>
        .
      </p>
    </div>
  );

  const renderOrders = () => (
    <div>
      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {ordersLoading ? (
          <div className="py-8 text-center text-gray-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No orders found</div>
        ) : (
          orders.map((order) => (
            <div key={order._id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Order #{order.orderNumber || order._id.slice(-6)}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded capitalize ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <p className="text-sm font-medium">₹{(order.total || order.totalAmount || 0).toFixed(2)} <span className="text-gray-500 text-xs font-normal">({order.items?.length || 0} items)</span></p>
                <Link
                  to={`/order-tracking/${order._id}`}
                  className="bg-black text-white px-3 py-1.5 text-xs font-medium hover:bg-gray-800 transition-colors rounded"
                >
                  Track Order
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 pr-6 font-semibold text-gray-900 text-sm tracking-wide uppercase">Product</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm tracking-wide uppercase">Date</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm tracking-wide uppercase">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm tracking-wide uppercase">Total</th>
              <th className="text-right py-4 pl-6 font-semibold text-gray-900 text-sm tracking-wide uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ordersLoading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">Loading orders...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">No orders found</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-5 pr-6">
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-medium text-base">
                        {order.items && order.items.length > 0 
                          ? (order.items[0].product?.name || order.items[0].name || 'Unknown Product').length > 35
                            ? (order.items[0].product?.name || order.items[0].name || 'Unknown Product').substring(0, 35) + '...'
                            : (order.items[0].product?.name || order.items[0].name || 'Unknown Product')
                          : 'No items'}
                      </span>
                      {order.items && order.items.length > 1 && (
                        <span className="text-gray-500 text-sm mt-0.5">+{order.items.length - 1} more item{order.items.length > 2 ? 's' : ''}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-5 px-6 text-gray-600 text-base whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="py-5 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-5 px-6">
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-semibold text-base">₹{(order.total || order.totalAmount || 0).toFixed(2)}</span>
                      <span className="text-gray-500 text-sm">{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}</span>
                    </div>
                  </td>
                  <td className="py-5 pl-6 text-right">
                    <Link
                      to={`/order-tracking/${order._id}`}
                      className="inline-flex items-center justify-center bg-black text-white px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors rounded"
                    >
                      Track Order
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAddresses = () => (
    <div>
      <button 
        onClick={() => setShowAddressForm(true)}
        className="w-full sm:w-auto bg-black text-white px-4 sm:px-6 lg:px-8 py-3 lg:py-3.5 font-medium mb-6 sm:mb-8 hover:bg-gray-800 transition-colors text-sm sm:text-base lg:text-lg rounded-none lg:rounded-sm"
      >
        Add a new address
      </button>
      
      {addressLoading ? (
        <div className="text-gray-500">Loading addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="text-gray-500">No addresses saved yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {addresses.map((address) => (
            <div key={address._id} className="bg-white border border-gray-200 p-4 sm:p-6 lg:p-8 rounded-lg lg:rounded-xl">
              <h3 className="font-semibold mb-3 sm:mb-4 capitalize text-sm sm:text-base lg:text-lg">
                {address.label}
                {address.isDefault && <span className="ml-2 text-xs sm:text-sm lg:text-base text-green-600 font-normal">(Default)</span>}
              </h3>
              <div className="text-gray-700 mb-4 lg:mb-6 leading-relaxed text-sm sm:text-base lg:text-lg">
                <p className="font-medium">{address.fullName}</p>
                <p className="break-words">{address.addressLine1}</p>
                {address.addressLine2 && <p className="break-words">{address.addressLine2}</p>}
                <p>{address.city}, {address.state} {address.postalCode}</p>
                <p>{address.country}</p>
                <p className="mt-2">Phone: {address.phone}</p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 lg:gap-4">
                <button 
                  onClick={() => handleEditAddress(address)}
                  className="bg-black text-white px-3 sm:px-4 lg:px-5 py-2 lg:py-2.5 text-xs sm:text-sm lg:text-base font-medium hover:bg-gray-800 transition-colors rounded-none lg:rounded-sm"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteAddress(address._id!)}
                  className="border border-black text-black px-3 sm:px-4 lg:px-5 py-2 lg:py-2.5 text-xs sm:text-sm lg:text-base font-medium hover:bg-gray-50 transition-colors rounded-none lg:rounded-sm"
                >
                  Delete
                </button>
                {!address.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(address._id!)}
                    className="border border-green-600 text-green-600 px-3 sm:px-4 lg:px-5 py-2 lg:py-2.5 text-xs sm:text-sm lg:text-base font-medium hover:bg-green-50 transition-colors whitespace-nowrap rounded-none lg:rounded-sm"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Address Form Modal - extracted to prevent focus loss
  const renderAddressFormModal = () => {
    if (!showAddressForm) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-lg lg:rounded-xl w-full max-w-lg lg:max-w-xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
              <button onClick={resetAddressForm} className="text-gray-500 hover:text-gray-700 text-2xl p-1">&times;</button>
            </div>
            
            <form onSubmit={handleAddressSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Address Label *</label>
                <select
                  value={addressFormData.label}
                  onChange={(e) => setAddressFormData(prev => ({...prev, label: e.target.value as 'home' | 'work' | 'other'}))}
                  className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Full Name *</label>
                <input
                  type="text"
                  value={addressFormData.fullName}
                  onChange={(e) => setAddressFormData(prev => ({...prev, fullName: e.target.value}))}
                  className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                />
                {addressErrors.fullName && <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.fullName}</p>}
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Phone *</label>
                <input
                  type="tel"
                  value={addressFormData.phone}
                  onChange={(e) => setAddressFormData(prev => ({...prev, phone: e.target.value}))}
                  className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                />
                {addressErrors.phone && <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.phone}</p>}
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Address Line 1 *</label>
                <input
                  type="text"
                  value={addressFormData.addressLine1}
                  onChange={(e) => setAddressFormData(prev => ({...prev, addressLine1: e.target.value}))}
                  className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                />
                {addressErrors.addressLine1 && <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.addressLine1}</p>}
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Address Line 2</label>
                <input
                  type="text"
                  value={addressFormData.addressLine2}
                  onChange={(e) => setAddressFormData(prev => ({...prev, addressLine2: e.target.value}))}
                  className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">City *</label>
                  <input
                    type="text"
                    value={addressFormData.city}
                    onChange={(e) => setAddressFormData(prev => ({...prev, city: e.target.value}))}
                    className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  />
                  {addressErrors.city && <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">State *</label>
                  <input
                    type="text"
                    value={addressFormData.state}
                    onChange={(e) => setAddressFormData(prev => ({...prev, state: e.target.value}))}
                    className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  />
                  {addressErrors.state && <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.state}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Postal Code *</label>
                  <input
                    type="text"
                    value={addressFormData.postalCode}
                    onChange={(e) => setAddressFormData(prev => ({...prev, postalCode: e.target.value}))}
                    className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  />
                  {addressErrors.postalCode && <p className="text-red-500 text-xs sm:text-sm mt-1">{addressErrors.postalCode}</p>}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Country</label>
                  <input
                    type="text"
                    value={addressFormData.country}
                    onChange={(e) => setAddressFormData(prev => ({...prev, country: e.target.value}))}
                    className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressFormData.isDefault}
                  onChange={(e) => setAddressFormData(prev => ({...prev, isDefault: e.target.checked}))}
                  className="w-4 h-4"
                />
                <label htmlFor="isDefault" className="text-xs sm:text-sm text-gray-700">Set as default address</label>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-3 sm:pt-4">
                <button
                  type="submit"
                  disabled={addressLoading}
                  className="w-full sm:w-auto bg-black text-white px-4 sm:px-6 py-2 text-sm sm:text-base font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 rounded"
                >
                  {addressLoading ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
                </button>
                <button
                  type="button"
                  onClick={resetAddressForm}
                  className="w-full sm:w-auto border border-black px-4 sm:px-6 py-2 text-sm sm:text-base font-medium hover:bg-gray-50 transition-colors rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderAccountDetails = () => (
    <div>
      <form onSubmit={handleAccountSubmit} className="max-w-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              First Name *
            </label>
            <input
              type="text"
              value={accountForm.firstName}
              onChange={(e) => setAccountForm({...accountForm, firstName: e.target.value})}
              className="w-full border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-sm sm:text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded lg:rounded-md"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Last Name *
            </label>
            <input
              type="text"
              value={accountForm.lastName}
              onChange={(e) => setAccountForm({...accountForm, lastName: e.target.value})}
              className="w-full border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-sm sm:text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded lg:rounded-md"
            />
          </div>
        </div>
        
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1 sm:mb-2">
            Display Name *
          </label>
          <input
            type="text"
            value={accountForm.displayName}
            onChange={(e) => setAccountForm({...accountForm, displayName: e.target.value})}
            className="w-full border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-sm sm:text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded lg:rounded-md"
          />
        </div>

        <div className="mb-6 sm:mb-8 lg:mb-10">
          <label className="block text-xs sm:text-sm lg:text-base font-medium text-gray-700 mb-1 sm:mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={accountForm.email}
            onChange={(e) => setAccountForm({...accountForm, email: e.target.value})}
            className="w-full border border-gray-300 px-3 lg:px-4 py-2 lg:py-3 text-sm sm:text-base lg:text-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded lg:rounded-md"
          />
        </div>

        <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4">Password Change</h3>
        
        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Current Password (leave blank to leave unchanged)
          </label>
          <input
            type="password"
            value={accountForm.currentPassword}
            onChange={(e) => setAccountForm({...accountForm, currentPassword: e.target.value})}
            className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded"
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            New Password (leave blank to leave unchanged)
          </label>
          <input
            type="password"
            value={accountForm.newPassword}
            onChange={(e) => setAccountForm({...accountForm, newPassword: e.target.value})}
            className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded"
          />
        </div>

        <div className="mb-6 sm:mb-8">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
            Confirm New Password
          </label>
          <input
            type="password"
            value={accountForm.confirmPassword}
            onChange={(e) => setAccountForm({...accountForm, confirmPassword: e.target.value})}
            className="w-full border border-gray-300 px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent rounded"
          />
        </div>

        <button
          type="submit"
          disabled={accountSaving}
          className="w-full sm:w-auto bg-black text-white px-6 sm:px-8 lg:px-10 py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 rounded lg:rounded-md"
        >
          {accountSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );

  // Accordion Section Component
  const AccordionSection = ({ 
    id, 
    label, 
    icon,
    children 
  }: { 
    id: string; 
    label: string; 
    icon: React.ReactNode;
    children: React.ReactNode;
  }) => {
    const isOpen = expandedSection === id;
    const isLogout = id === 'logout';
    const isWishlist = id === 'wishlist';
    
    return (
      <div className="border border-gray-200 rounded-lg lg:rounded-xl overflow-hidden bg-white">
        <button
          onClick={() => handleSectionToggle(id)}
          className={`w-full flex items-center justify-between px-4 sm:px-5 lg:px-6 py-4 lg:py-5 text-left transition-colors ${
            isOpen ? 'bg-gray-50' : 'hover:bg-gray-50'
          } ${isLogout ? 'text-red-600 hover:bg-red-50' : ''}`}
        >
          <div className="flex items-center gap-3 lg:gap-4">
            <span className={`${isLogout ? 'text-red-500' : 'text-gray-500'}`}>
              {icon}
            </span>
            <span className={`font-medium text-sm sm:text-base lg:text-lg ${isLogout ? 'text-red-600' : 'text-gray-800'}`}>
              {label}
            </span>
          </div>
          {!isLogout && !isWishlist && (
            <ChevronIcon isOpen={isOpen} />
          )}
          {isWishlist && (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
        {!isLogout && !isWishlist && isOpen && (
          <div className="px-4 sm:px-5 lg:px-6 py-4 lg:py-5 border-t border-gray-100 bg-white">
            {children}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Header Section - matching ContactUs style */}
      <div 
        className="w-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(254, 240, 239, 1) 50%, rgba(243, 251, 251, 1) 76%, rgba(254, 255, 255, 1) 98%)',
          height: 'clamp(140px, 15vw, 194px)'
        }}
      >
        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 
            className="text-black text-2xl sm:text-3xl lg:text-4xl xl:text-[42px]"
            style={{ 
              fontWeight: 'normal', 
              fontFamily: "'Albert Sans', sans-serif" 
            }}
          >
            My Account
          </h1>
          <p 
            className="text-gray-600 mt-1"
            style={{ fontFamily: "'Albert Sans', sans-serif" }}
          >
            Hello, {user?.name || 'User'} 👋
          </p>
        </div>
      </div>

      {/* Main Content - Accordion Style */}
      <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <div className="space-y-3 lg:space-y-4">
          {/* Dashboard Section */}
          <AccordionSection 
            id="dashboard" 
            label="Dashboard"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            }
          >
            {renderDashboard()}
          </AccordionSection>

          {/* Orders Section */}
          <AccordionSection 
            id="orders" 
            label="Orders"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            }
          >
            {renderOrders()}
          </AccordionSection>

          {/* Addresses Section */}
          <AccordionSection 
            id="addresses" 
            label="Addresses"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            {renderAddresses()}
          </AccordionSection>

          {/* Account Details Section */}
          <AccordionSection 
            id="account-details" 
            label="Account Details"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          >
            {renderAccountDetails()}
          </AccordionSection>

          {/* Wishlist Link */}
          <AccordionSection 
            id="wishlist" 
            label="Wishlist"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          >
            <></>
          </AccordionSection>

          {/* Logout Section */}
          <AccordionSection 
            id="logout" 
            label="Logout"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            }
          >
            <></>
          </AccordionSection>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        isOpen={showLogoutConfirmation}
        onClose={() => setShowLogoutConfirmation(false)}
        onConfirm={handleLogout}
      />

      {/* Address Form Modal - rendered at root level to prevent focus issues */}
      {renderAddressFormModal()}
      
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
};

export default AccountPage;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Heart, LogOut, Settings, ChevronRight, Plus, Edit2, Trash2, Star, Phone, Mail, Home, X, Eye, Truck, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import LogoutConfirmation from './LogoutConfirmation';
import addressService, { Address } from '../services/addressService';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

interface WishlistItem {
  _id: string;
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  originalPrice?: number;
}

type TabType = 'dashboard' | 'orders' | 'addresses' | 'account-details' | 'wishlist' | 'logout';

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Address form state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressFormData, setAddressFormData] = useState<Partial<Address>>({
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
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressSuccess, setAddressSuccess] = useState<string | null>(null);

  // Order details modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Account details form state
  const [accountFormData, setAccountFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/');
        return;
      }

      // Fetch user profile
      const response = await fetch('http://localhost:5001/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setAccountFormData(prev => ({
          ...prev,
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || ''
        }));
      }

      // Fetch orders (placeholder data for now)
      setOrders([
        {
          _id: '1',
          orderNumber: 'ORD-2024-001',
          items: [
            { productId: '1', productName: 'Wireless Earbuds Pro', productImage: '/images/wireless-white-beats-earbuds.png', quantity: 1, price: 2499 },
            { productId: '2', productName: 'Smart Watch Strap', productImage: '/images/smart-watch-strap.png', quantity: 2, price: 599 }
          ],
          totalAmount: 3697,
          status: 'delivered',
          shippingAddress: {
            _id: '1',
            label: 'home',
            fullName: 'John Doe',
            phone: '+91 98765 43210',
            addressLine1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
            isDefault: true
          },
          createdAt: '2024-01-15T10:30:00Z',
          estimatedDelivery: '2024-01-20',
          trackingNumber: 'TRK123456789'
        },
        {
          _id: '2',
          orderNumber: 'ORD-2024-002',
          items: [
            { productId: '3', productName: 'USB-C Charging Cable', productImage: '/images/usb-cable.png', quantity: 3, price: 299 }
          ],
          totalAmount: 897,
          status: 'shipped',
          shippingAddress: {
            _id: '2',
            label: 'work',
            fullName: 'John Doe',
            phone: '+91 98765 43210',
            addressLine1: '456 Office Complex',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India',
            isDefault: false
          },
          createdAt: '2024-01-18T14:45:00Z',
          estimatedDelivery: '2024-01-25',
          trackingNumber: 'TRK987654321'
        },
        {
          _id: '3',
          orderNumber: 'ORD-2024-003',
          items: [
            { productId: '4', productName: 'Phone Case Premium', productImage: '/images/phone-case.png', quantity: 1, price: 799 }
          ],
          totalAmount: 799,
          status: 'processing',
          shippingAddress: {
            _id: '1',
            label: 'home',
            fullName: 'John Doe',
            phone: '+91 98765 43210',
            addressLine1: '123 Main Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
            isDefault: true
          },
          createdAt: '2024-01-20T09:15:00Z',
          estimatedDelivery: '2024-01-28'
        }
      ]);

      // Fetch wishlist (placeholder data)
      setWishlist([
        { _id: '1', productId: '1', productName: 'Red Beats Airpods', productImage: '/images/red-beats-airpods.png', price: 4999, originalPrice: 5999 },
        { _id: '2', productId: '2', productName: 'Three Device Wireless Charger', productImage: '/images/three-device-wireless-charger.png', price: 2999, originalPrice: 3499 }
      ]);

    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setAddressLoading(true);
      const data = await addressService.getAddresses();
      setAddresses(data);
    } catch (error: any) {
      setAddressError(error.message || 'Failed to fetch addresses');
    } finally {
      setAddressLoading(false);
    }
  };

  const resetAddressForm = () => {
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
    setEditingAddress(null);
    setAddressError(null);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);
    setAddressSuccess(null);

    // Validate form
    const validation = addressService.validateAddress(addressFormData as Address);
    if (!validation.isValid) {
      setAddressError(validation.errors.join(', '));
      return;
    }

    try {
      setAddressLoading(true);
      if (editingAddress) {
        await addressService.updateAddress(editingAddress._id!, addressFormData);
        setAddressSuccess('Address updated successfully!');
      } else {
        await addressService.addAddress(addressFormData as Omit<Address, '_id'>);
        setAddressSuccess('Address added successfully!');
      }
      await fetchAddresses();
      setShowAddressForm(false);
      resetAddressForm();
      setTimeout(() => setAddressSuccess(null), 3000);
    } catch (error: any) {
      setAddressError(error.message || 'Failed to save address');
    } finally {
      setAddressLoading(false);
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
    setAddressError(null);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      setAddressLoading(true);
      await addressService.deleteAddress(addressId);
      setAddressSuccess('Address deleted successfully!');
      await fetchAddresses();
      setTimeout(() => setAddressSuccess(null), 3000);
    } catch (error: any) {
      setAddressError(error.message || 'Failed to delete address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      setAddressLoading(true);
      await addressService.setDefaultAddress(addressId);
      setAddressSuccess('Default address updated!');
      await fetchAddresses();
      setTimeout(() => setAddressSuccess(null), 3000);
    } catch (error: any) {
      setAddressError(error.message || 'Failed to set default address');
    } finally {
      setAddressLoading(false);
    }
  };

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement account update API
    alert('Account update functionality will be implemented soon!');
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowLogoutConfirm(false);
    window.location.href = '/';
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleTrackOrder = (orderId: string) => {
    navigate(`/order-tracking/${orderId}`);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'processing': return <Settings className="w-4 h-4" />;
      case 'shipped': return <Truck className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'account-details', label: 'Account Details', icon: Settings },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'logout', label: 'Logout', icon: LogOut }
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'User'}!</h2>
        <p className="text-blue-100">Member since {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{orders.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Saved Addresses</p>
              <p className="text-3xl font-bold text-gray-900">{addresses.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Wishlist Items</p>
              <p className="text-3xl font-bold text-gray-900">{wishlist.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          <button 
            onClick={() => setActiveTab('orders')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {orders.slice(0, 3).map(order => (
            <div key={order._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <img 
                  src={order.items[0]?.productImage || '/images/placeholder.svg'} 
                  alt={order.items[0]?.productName}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <div>
                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
                <button 
                  onClick={() => handleViewOrderDetails(order)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">My Orders</h2>
      
      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
          <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Start Shopping <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <img 
                        src={item.productImage || '/images/placeholder.svg'} 
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.productName}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                      </div>
                      <p className="font-semibold text-gray-900">{formatPrice(item.quantity * item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-xl font-bold text-gray-900">{formatPrice(order.totalAmount)}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleViewOrderDetails(order)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <button 
                      onClick={() => handleTrackOrder(order._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Track Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAddresses = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Addresses</h2>
        <button
          onClick={() => {
            resetAddressForm();
            setShowAddressForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Address
        </button>
      </div>

      {/* Success/Error Messages */}
      {addressSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-700">{addressSuccess}</p>
        </div>
      )}
      {addressError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-700">{addressError}</p>
        </div>
      )}

      {/* Address Form Modal */}
      {showAddressForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => {
                  setShowAddressForm(false);
                  resetAddressForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddressSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Label</label>
                  <select
                    value={addressFormData.label}
                    onChange={(e) => setAddressFormData({...addressFormData, label: e.target.value as 'home' | 'work' | 'other'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={addressFormData.fullName}
                    onChange={(e) => setAddressFormData({...addressFormData, fullName: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={addressFormData.phone}
                    onChange={(e) => setAddressFormData({...addressFormData, phone: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                  <input
                    type="text"
                    value={addressFormData.addressLine1}
                    onChange={(e) => setAddressFormData({...addressFormData, addressLine1: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="House/Flat No., Building, Street"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                  <input
                    type="text"
                    value={addressFormData.addressLine2}
                    onChange={(e) => setAddressFormData({...addressFormData, addressLine2: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Landmark, Area (Optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={addressFormData.city}
                    onChange={(e) => setAddressFormData({...addressFormData, city: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    value={addressFormData.state}
                    onChange={(e) => setAddressFormData({...addressFormData, state: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="State"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                  <input
                    type="text"
                    value={addressFormData.postalCode}
                    onChange={(e) => setAddressFormData({...addressFormData, postalCode: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="400001"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    type="text"
                    value={addressFormData.country}
                    onChange={(e) => setAddressFormData({...addressFormData, country: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="India"
                  />
                </div>

                <div className="col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addressFormData.isDefault}
                      onChange={(e) => setAddressFormData({...addressFormData, isDefault: e.target.checked})}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Set as default address</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddressForm(false);
                    resetAddressForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addressLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingAddress ? 'Update Address' : 'Save Address'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Addresses Grid */}
      {addressLoading && !showAddressForm ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
          <p className="text-gray-500 mb-4">Add your first address to make checkout faster</p>
          <button
            onClick={() => {
              resetAddressForm();
              setShowAddressForm(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map(address => (
            <div 
              key={address._id} 
              className={`bg-white rounded-xl border-2 p-4 relative ${address.isDefault ? 'border-blue-500' : 'border-gray-200'} hover:shadow-lg transition-shadow`}
            >
              {address.isDefault && (
                <span className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3" /> Default
                </span>
              )}
              
              <div className="flex items-center gap-2 mb-3">
                <span className={`p-2 rounded-lg ${address.label === 'home' ? 'bg-green-100' : address.label === 'work' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                  {address.label === 'home' ? <Home className="w-4 h-4 text-green-600" /> : 
                   address.label === 'work' ? <Settings className="w-4 h-4 text-blue-600" /> : 
                   <MapPin className="w-4 h-4 text-gray-600" />}
                </span>
                <span className="font-semibold text-gray-900 capitalize">{address.label}</span>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p className="font-medium text-gray-900">{address.fullName}</p>
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>{address.city}, {address.state} {address.postalCode}</p>
                <p>{address.country}</p>
                <p className="flex items-center gap-1 pt-2">
                  <Phone className="w-3 h-3" /> {address.phone}
                </p>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleEditAddress(address)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefaultAddress(address._id!)}
                    className="flex-1 px-3 py-2 border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <Star className="w-4 h-4" /> Set Default
                  </button>
                )}
                <button
                  onClick={() => handleDeleteAddress(address._id!)}
                  className="px-3 py-2 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors flex items-center justify-center gap-1 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAccountDetails = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Account Details</h2>
      
      <form onSubmit={handleAccountUpdate} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={accountFormData.name}
              onChange={(e) => setAccountFormData({...accountFormData, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={accountFormData.email}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={accountFormData.phone}
              onChange={(e) => setAccountFormData({...accountFormData, phone: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        <hr className="my-6" />

        <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={accountFormData.currentPassword}
              onChange={(e) => setAccountFormData({...accountFormData, currentPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={accountFormData.newPassword}
              onChange={(e) => setAccountFormData({...accountFormData, newPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={accountFormData.confirmPassword}
              onChange={(e) => setAccountFormData({...accountFormData, confirmPassword: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );

  const renderWishlist = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
      
      {wishlist.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
          <p className="text-gray-500 mb-4">Save items you love to your wishlist</p>
          <Link to="/products" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Explore Products <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlist.map(item => (
            <div key={item._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img 
                  src={item.productImage || '/images/placeholder.svg'} 
                  alt={item.productName}
                  className="w-full h-48 object-cover"
                />
                <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 mb-2">{item.productName}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{formatPrice(item.price)}</span>
                  {item.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">{formatPrice(item.originalPrice)}</span>
                  )}
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'orders':
        return renderOrders();
      case 'addresses':
        return renderAddresses();
      case 'account-details':
        return renderAccountDetails();
      case 'wishlist':
        return renderWishlist();
      default:
        return renderDashboard();
    }
  };

  // Order Details Modal
  const OrderDetailsModal = () => {
    if (!selectedOrder) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
              <p className="text-sm text-gray-500">{selectedOrder.orderNumber}</p>
            </div>
            <button
              onClick={() => {
                setShowOrderModal(false);
                setSelectedOrder(null);
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 space-y-6">
            {/* Order Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Order Status</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium mt-1 ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>

            {/* Tracking Info */}
            {selectedOrder.trackingNumber && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 font-medium">Tracking Number</p>
                <p className="text-blue-900 font-mono">{selectedOrder.trackingNumber}</p>
                {selectedOrder.estimatedDelivery && (
                  <p className="text-sm text-blue-700 mt-2">
                    Estimated Delivery: <span className="font-medium">{formatDate(selectedOrder.estimatedDelivery)}</span>
                  </p>
                )}
              </div>
            )}

            {/* Order Items */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Items Ordered</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <img 
                      src={item.productImage || '/images/placeholder.svg'} 
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.productName}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">{formatPrice(item.quantity * item.price)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.fullName}</p>
                <p className="text-gray-600">{selectedOrder.shippingAddress.addressLine1}</p>
                {selectedOrder.shippingAddress.addressLine2 && (
                  <p className="text-gray-600">{selectedOrder.shippingAddress.addressLine2}</p>
                )}
                <p className="text-gray-600">
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                </p>
                <p className="text-gray-600">{selectedOrder.shippingAddress.country}</p>
                <p className="text-gray-600 mt-2 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {selectedOrder.shippingAddress.phone}
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">{formatPrice(selectedOrder.totalAmount)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                <button
                  onClick={() => {
                    setShowOrderModal(false);
                    handleTrackOrder(selectedOrder._id);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  Track Order
                </button>
              )}
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setSelectedOrder(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">My Account</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* User Info */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-white font-semibold text-center">{user?.name || 'User'}</h3>
                <p className="text-blue-100 text-sm text-center truncate">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'logout') {
                        handleLogout();
                      } else {
                        setActiveTab(item.id as TabType);
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id 
                        ? 'bg-blue-50 text-blue-600' 
                        : item.id === 'logout' 
                          ? 'text-red-600 hover:bg-red-50' 
                          : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmation
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogout}
      />

      {/* Order Details Modal */}
      {showOrderModal && <OrderDetailsModal />}
    </div>
  );
};

export default AccountPage;

import React, { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

interface Order {
  _id: string;
  items: Array<{
    product: {
      _id: string;
      name: string;
      images?: string[];
    };
    name: string;
    price: number;
    quantity: number;
    itemTotal: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  shippingAddress?: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
    country: string;
  };
  createdAt: string;
}

const OrderConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get order and email from navigation state
  const { order, email } = location.state || {};
  
  // Get user data from localStorage for fallback
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    // Redirect if no order data
    if (!order) {
      navigate('/products');
    }
  }, [order, navigate]);

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    if (!price && price !== 0) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Determine payment method from order data
  const getPaymentMethod = () => {
    if (order.paymentInfo?.method === 'manual_upi') return 'UPI Payment';
    if (order.paymentInfo?.method === 'razorpay') return 'Online Payment';
    if (order.paymentMethod === 'cod' || order.paymentInfo?.method === 'cod') return 'Cash on Delivery';
    return 'Cash on Delivery'; // Default
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Page Header - Same gradient style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center flex items-center justify-center" style={{
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(254, 240, 239, 1) 50%, rgba(243, 251, 251, 1) 76%, rgba(254, 255, 255, 1) 98%)',
          height: 'clamp(140px, 15vw, 194px)'
        }}>
          <h1 className="text-black text-2xl sm:text-3xl lg:text-4xl xl:text-[42px]" style={{ fontWeight: 'normal', fontFamily: "'Albert Sans', sans-serif" }}>
            Payment confirmation
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Payment Confirmation Card */}
        <div className="bg-gray-50 rounded-lg lg:rounded-xl p-8 lg:p-10">
          <h2 className="text-xl lg:text-2xl font-semibold text-black mb-6 lg:mb-8">
            Payment confirmation
          </h2>
          
          {/* Details Table */}
          <div className="space-y-4 lg:space-y-5">
            {/* Date */}
            <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-200">
              <span className="text-gray-600 text-base lg:text-lg">Date</span>
              <span className="text-gray-900 text-base lg:text-lg">{formatDate(order.createdAt)}</span>
            </div>
            
            {/* Payment method */}
            <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-200">
              <span className="text-gray-600 text-base lg:text-lg">Payment method</span>
              <span className="text-gray-900 text-base lg:text-lg">{getPaymentMethod()}</span>
            </div>
            
            {/* Order ID as Card number replacement */}
            <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-200">
              <span className="text-gray-600 text-base lg:text-lg">Order number</span>
              <span className="text-gray-900 text-base lg:text-lg">#{order._id?.slice(-8).toUpperCase() || 'N/A'}</span>
            </div>
            
            {/* Cardholder name / Customer name */}
            <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-200">
              <span className="text-gray-600 text-base lg:text-lg">Customer name</span>
              <span className="text-gray-900 text-base lg:text-lg">{order.shippingAddress?.fullName || user?.name || 'N/A'}</span>
            </div>
            
            {/* Email */}
            <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-200">
              <span className="text-gray-600 text-base lg:text-lg">Email</span>
              <span className="text-gray-900 text-base lg:text-lg">{email || user?.email || 'N/A'}</span>
            </div>
            
            {/* Phone */}
            <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-200">
              <span className="text-gray-600 text-base lg:text-lg">Phone</span>
              <span className="text-gray-900 text-base lg:text-lg">{order.shippingAddress?.phone || 'N/A'}</span>
            </div>
            
            {/* Subtotal */}
            <div className="flex justify-between items-center py-2 lg:py-3 pt-4">
              <span className="text-gray-900 font-semibold text-base lg:text-lg">Subtotal</span>
              <span className="text-gray-900 font-semibold text-base lg:text-lg">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 lg:gap-5 mt-8 lg:mt-10">
            <Link
              to="/products"
              className="flex-1 inline-flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 border border-gray-300 rounded-lg lg:rounded-xl bg-white text-gray-700 hover:bg-gray-50 font-medium transition-colors text-base lg:text-lg"
            >
              Continue Shopping
            </Link>
            <Link
              to="/account?tab=orders"
              className="flex-1 inline-flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 border border-transparent rounded-lg lg:rounded-xl bg-black text-white hover:bg-gray-800 font-medium transition-colors text-base lg:text-lg"
            >
              View Orders
            </Link>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center mt-8 lg:mt-12">
          <p className="text-gray-600 text-base lg:text-lg">
            Have a question?
            <Link to="/contact" className="text-red-500 hover:text-red-600 ml-1">
              Contact Support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;

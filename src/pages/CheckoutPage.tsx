import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cartService from '../services/cartService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  itemTotal: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface Cart {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  totalItems: number;
}

interface BillingDetails {
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
  address: string;
  phone: string;
  email: string;
  orderNotes: string;
}

interface OrderSuccessData {
  order: any;
  email: string;
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [paymentMode, setPaymentMode] = useState<'razorpay' | 'manual_upi'>('manual_upi');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<OrderSuccessData | null>(null);
  const [upiSettings, setUpiSettings] = useState<{ upiId: string; merchantName: string } | null>(null);
  
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    firstName: '',
    lastName: '',
    country: '',
    city: '',
    state: '',
    postalCode: '',
    address: '',
    phone: '',
    email: '',
    orderNotes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load cart and payment settings in parallel
      const [cartResponse, paymentSettingsResponse] = await Promise.all([
        cartService.getCart(),
        fetch(`${API_BASE_URL}/payment-settings/mode`).then(r => r.json()).catch(() => ({ success: false }))
      ]);
      
      if (cartResponse.success && cartResponse.data) {
        if (!cartResponse.data.items || cartResponse.data.items.length === 0) {
          navigate('/cart');
          return;
        }
        setCart(cartResponse.data);
      } else {
        navigate('/cart');
        return;
      }
      
      // Set payment mode from backend settings
      if (paymentSettingsResponse.success && paymentSettingsResponse.data?.paymentMode) {
        setPaymentMode(paymentSettingsResponse.data.paymentMode);
        if (paymentSettingsResponse.data.upiSettings) {
          setUpiSettings(paymentSettingsResponse.data.upiSettings);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof BillingDetails, value: string) => {
    setBillingDetails(prev => ({ ...prev, [field]: value }));
  };



  const validateForm = (): boolean => {
    if (!billingDetails.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!billingDetails.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!billingDetails.address.trim()) {
      setError('Address is required');
      return false;
    }
    if (!billingDetails.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!billingDetails.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!agreeTerms) {
      setError('Please agree to the terms and conditions');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    setError('');
    
    if (!validateForm()) {
      return;
    }

    if (!cart) {
      setError('Cart is empty');
      return;
    }

    // Block manual UPI/QR payment for orders above ₹2000
    if (paymentMethod === 'upi' && cart.total > 2000) {
      setError(`UPI/QR payment is only available for orders up to ₹2,000. Try reducing your cart total to proceed.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setSubmitting(true);

      const fallbackCity = billingDetails.city.trim() || 'NA';
      const fallbackState = billingDetails.state.trim() || 'NA';
      const fallbackPostalCode = billingDetails.postalCode.trim() || '000000';
      const fallbackCountry = billingDetails.country.trim() || 'India';
      
      // Build shipping address from billing details
      const shippingAddress = {
        fullName: `${billingDetails.firstName} ${billingDetails.lastName}`.trim(),
        addressLine1: billingDetails.address,
        addressLine2: '',
        city: fallbackCity,
        state: fallbackState,
        postalCode: fallbackPostalCode,
        phone: billingDetails.phone,
        country: fallbackCountry
      };
      
      // Get cart items for guest order
      const rawItems = cartService.getRawItems();
      const items = rawItems.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
        selectedColor: item.selectedColor || '',
        selectedSize: item.selectedSize || ''
      }));

      // Create guest order
      const response = await fetch(`${API_BASE_URL}/orders/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          items,
          shippingAddress,
          customerEmail: billingDetails.email,
          customerName: `${billingDetails.firstName} ${billingDetails.lastName}`.trim(),
          customerPhone: billingDetails.phone,
          orderNotes: billingDetails.orderNotes,
          paymentMethod
        })
      });
      
      const data = await response.json();
      if (!data.success || !data.data?._id) {
        throw new Error(data.message || 'Failed to place order');
      }

      const createdOrder = data.data;

      // COD flow: confirm order without online payment
      if (paymentMethod === 'cod') {
        const codResponse = await fetch(`${API_BASE_URL}/payments/cod`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ orderId: createdOrder._id })
        });

        const codResult = await codResponse.json();
        if (!codResult.success) {
          throw new Error(codResult.message || 'Failed to confirm COD order');
        }

        // Clear cart after successful order
        cartService.clearCart();
        window.dispatchEvent(new Event('cart:changed'));

        // Navigate directly to order confirmation page
        navigate('/order-confirmation', {
          state: { order: createdOrder, email: billingDetails.email }
        });
        setSubmitting(false);
        return;
      }

      // UPI payment flow: navigate to UPI payment page (QR scanner + GPay/PhonePe deep-link)
      if (paymentMethod === 'upi') {
        cartService.clearCart();
        window.dispatchEvent(new Event('cart:changed'));

        navigate('/upi-payment', {
          state: { order: createdOrder, billingEmail: billingDetails.email }
        });
        setSubmitting(false);
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Page Header - Same style as ContactUs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center flex items-center justify-center rounded-lg lg:rounded-xl xl:rounded-2xl" style={{
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(254, 240, 239, 1) 50%, rgba(243, 251, 251, 1) 76%, rgba(254, 255, 255, 1) 98%)',
          height: 'clamp(100px, 15vw, 194px)'
        }}>
          <h1 className="text-black text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-normal" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
            Check Out
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 xl:py-12">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" aria-live="polite">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 xl:gap-12">
          {/* Left Column - Billing Details */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-5 xl:space-y-6">
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-black mb-3 sm:mb-4 lg:mb-6">
                Billing details
              </h2>
              
              <div className="space-y-4">
                {/* Name Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      First Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={billingDetails.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="Themesflat"
                      className="w-full h-11 px-3 lg:px-4 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      Last Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={billingDetails.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full h-11 px-3 lg:px-4 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Phone + Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={billingDetails.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full h-11 px-3 lg:px-4 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                      Email<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={billingDetails.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full h-11 px-3 lg:px-4 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Address (additional field) */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Address<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={billingDetails.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full h-11 px-3 lg:px-4 text-sm lg:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400"
                  />
                </div>

                {/* Order Notes */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    Order notes (optional)
                  </label>
                  <textarea
                    value={billingDetails.orderNotes}
                    onChange={(e) => handleInputChange('orderNotes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 resize-none text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-5 xl:space-y-6">
            <div>
              <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-black mb-3 sm:mb-4 lg:mb-6">
                Your order
              </h2>
              
              {/* Order Items */}
              <div className="space-y-2 sm:space-y-3 lg:space-y-4 mb-3 sm:mb-4 lg:mb-6">
                {cart?.items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-3 sm:space-x-4">
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                      <img
                        src={item.product.images?.[0] || '/images/placeholder.svg'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-gray-500 text-white text-xs lg:text-sm rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm lg:text-base font-medium text-black truncate">{item.product.name}</p>
                      {(item.selectedColor || item.selectedSize) && (
                        <p className="text-xs text-gray-500">
                          {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                          {item.selectedColor && item.selectedSize && <span> • </span>}
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                        </p>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm lg:text-base font-medium text-black">{formatPrice(item.itemTotal)}</p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center py-3 sm:py-4 lg:py-5 border-t border-gray-200">
                <span className="text-base sm:text-lg lg:text-xl font-semibold text-black">Total</span>
                <span className="text-base sm:text-lg lg:text-xl font-bold text-black">{formatPrice(cart?.total || 0)}</span>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3 mt-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-red-500 border-gray-300 focus:ring-red-500"
                  />
                  <span className="text-gray-700">UPI (Scan & Pay)</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Recommended</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-red-500 border-gray-300 focus:ring-red-500"
                  />
                  <span className="text-gray-700">Cash on delivery</span>
                </label>
              </div>

              {/* Privacy Notice */}
              <p className="text-sm lg:text-base text-gray-600 mt-6 lg:mt-8">
                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our
                <a href="/privacy-policy" className="underline hover:text-black">privacy policy</a>.
              </p>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-3 mt-4 lg:mt-6">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 lg:w-5 lg:h-5 mt-1 text-black border-gray-300 rounded focus:ring-black"
                />
                <label htmlFor="agreeTerms" className="text-sm lg:text-base text-gray-700">
                  I have read and agree to the website
                  <a href="/policies#terms" className="underline hover:text-black">terms and conditions</a>
                </label>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className={`w-full mt-4 sm:mt-6 lg:mt-8 py-2.5 sm:py-3 lg:py-4 px-6 sm:px-8 rounded-lg font-medium text-base sm:text-lg lg:text-xl transition-colors duration-200 ${
                  submitting
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {submitting ? 'Processing...' : 'Place order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup Modal */}
      {showSuccessPopup && orderSuccessData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Success Icon */}
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
              <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
              Order Placed Successfully!
            </h2>
            
            {/* Message */}
            <p className="text-gray-600 mb-2">
              Thank you for your purchase.
            </p>
            <p className="text-gray-600 mb-6">
              A confirmation email has been sent to:
              <br />
              <span className="font-semibold text-black">{orderSuccessData.email}</span>
            </p>

            {/* Email Icon */}
            <div className="flex items-center justify-center space-x-2 text-green-600 mb-6">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Check your email inbox</span>
            </div>

            {/* Order ID */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-mono font-bold text-gray-900">
                #{orderSuccessData.order._id?.slice(-8).toUpperCase() || 'N/A'}
              </p>
            </div>

            {/* Auto redirect - no buttons needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;

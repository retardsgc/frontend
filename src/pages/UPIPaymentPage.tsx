import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const UPIPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { order, billingEmail } = location.state || {};
  
  const [upiSettings, setUpiSettings] = useState<{
    qrCodeImage: string;
    upiId: string;
    merchantName: string;
    instructions: string;
  } | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!order) {
      navigate('/checkout');
      return;
    }
    loadPaymentSettings();
  }, [order, navigate]);

  const loadPaymentSettings = async () => {
    try {
      const response = await fetch('/api/payment-settings/mode');
      const data = await response.json();
      
      if (data.success && data.data.paymentMode === 'manual_upi') {
        setUpiSettings(data.data.upiSettings);
      } else {
        setError('UPI payment is not available at the moment');
      }
    } catch (err) {
      setError('Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  // Auto-open UPI payment app when settings are loaded
  useEffect(() => {
    if (upiSettings?.upiId && order?.total && !loading) {
      const upiLink = `upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(upiSettings.merchantName || 'Store')}&am=${order.total}&cu=INR&tn=Donation`;
      window.location.href = upiLink;
    }
  }, [upiSettings, order, loading]);

  const copyUpiId = () => {
    if (upiSettings?.upiId) {
      navigator.clipboard.writeText(upiSettings.upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmitTransaction = async () => {
    const trimmedId = transactionId.trim();
    
    // Validation
    if (!trimmedId) {
      setError('Please enter your UPI Transaction ID');
      return;
    }

    if (trimmedId.length < 10) {
      setError('Transaction ID must be at least 10 characters long');
      return;
    }

    if (trimmedId.length > 35) {
      setError('Transaction ID is too long. Please check and re-enter.');
      return;
    }

    // Only allow alphanumeric characters
    if (!/^[a-zA-Z0-9]+$/.test(trimmedId)) {
      setError('Transaction ID should only contain letters and numbers');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await fetch('/api/payment-settings/submit-upi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order._id,
          upiTransactionId: transactionId.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to submit transaction ID');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
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

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading payment details...</p>
        </div>
      </div>
    );
  }

  // Success State
  if (submitted) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        <div className="max-w-lg mx-auto px-4 py-16">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Verification Pending
            </h1>
            <p className="text-gray-500">
              Your payment is being verified by our team
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Order ID</span>
                <span className="font-mono font-medium text-gray-900">#{order._id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Transaction ID</span>
                <span className="font-mono text-gray-900">{transactionId}</span>
              </div>
              <div className="h-px bg-gray-100" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Amount Paid</span>
                <span className="font-semibold text-gray-900">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 rounded-xl p-4 mb-8">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-800">
                You'll receive a confirmation email at <strong>{billingEmail}</strong> once verified.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/account')}
              className="w-full h-12 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full h-12 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Payment Page
  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 sm:gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-xs sm:text-sm font-medium">Back</span>
            </button>
            <div className="text-center">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900">Complete Payment</h1>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Order #{order?._id?.slice(-8).toUpperCase()}</p>
            </div>
            <div className="w-12 sm:w-16" />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Left Column - QR Code */}
          <div className="lg:col-span-3 order-1">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden">
              {/* Amount Banner */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 sm:px-6 py-4 sm:py-5">
                <p className="text-emerald-100 text-xs sm:text-sm mb-1">Amount to Pay</p>
                <p className="text-white text-2xl sm:text-3xl font-bold">
                  ₹{Number(order?.total || 0).toFixed(2)}
                </p>
              </div>

              {/* QR Section */}
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col items-center">
                  {/* QR Code */}
                  <div className="bg-white p-3 sm:p-4 rounded-2xl border-2 border-gray-200 shadow-md mb-4 sm:mb-6">
                    {upiSettings?.qrCodeImage ? (
                      <img
                        src={upiSettings.qrCodeImage}
                        alt="UPI QR Code"
                        className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 object-contain"
                      />
                    ) : (
                      <div className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 bg-gray-100 rounded-xl flex items-center justify-center">
                        <svg className="w-20 h-20 sm:w-24 sm:h-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  

                  {/* UPI ID */}
                  {upiSettings?.upiId && (
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-gray-50 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 mb-4 sm:mb-6">
                      <span className="text-gray-500 text-xs sm:text-sm">UPI ID:</span>
                      <code className="font-mono text-xs sm:text-sm text-gray-900 break-all">{upiSettings.upiId}</code>
                      <button
                        onClick={copyUpiId}
                        className="ml-1 p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Copy UPI ID"
                      >
                        {copied ? (
                          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Pay with UPI App button - opens GPay/PhonePe/Paytm with pre-filled amount */}
                  {upiSettings?.upiId && order?.total && (
                    <button
                      onClick={() => {
                        const upiLink = `upi://pay?pa=${upiSettings.upiId}&pn=${encodeURIComponent(upiSettings.merchantName || 'Store')}&am=${order.total}&cu=INR&tn=Donation`;
                        window.location.href = upiLink;
                      }}
                      className="w-full max-w-xs h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium text-sm sm:text-base hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      Pay ₹{Number(order.total).toFixed(2)} with UPI App
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order & Transaction */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2">
            {/* Order Summary */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900">Order Summary</h3>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                  {order?.items?.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-xs sm:text-sm gap-2">
                      <span className="text-gray-600 truncate flex-1">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                      <span className="text-gray-900 flex-shrink-0">{formatPrice(item.itemTotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="h-px bg-gray-100 my-3 sm:my-4" />
                <div className="flex justify-between">
                  <span className="font-medium text-sm sm:text-base text-gray-900">Total</span>
                  <span className="font-bold text-sm sm:text-base text-gray-900">{formatPrice(order?.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Transaction ID Input */}
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900">Confirm Payment</h3>
              </div>
              <div className="p-4 sm:p-6">
                <label className="block text-xs sm:text-sm text-gray-600 mb-2">
                  UPI Transaction ID (UTR)
                </label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => {
                    setTransactionId(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. 412345678901"
                  className="w-full h-10 sm:h-12 px-3 sm:px-4 border border-gray-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-mono text-xs sm:text-sm placeholder:text-gray-400"
                />
                <p className="text-[10px] sm:text-xs text-gray-400 mt-2">
                  Find this in your UPI app → Transaction History → Details
                </p>

                <button
                  onClick={handleSubmitTransaction}
                  disabled={submitting || !transactionId.trim()}
                  className={`w-full h-10 sm:h-12 mt-4 rounded-lg sm:rounded-xl font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
                    submitting || !transactionId.trim()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Payment</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UPIPaymentPage;

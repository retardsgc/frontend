import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import orderService from '../services/orderService';

interface TrackingStep {
  status: string;
  title: string;
  description: string;
  date?: string;
  completed: boolean;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

interface OrderTrackingData {
  order: {
    _id: string;
    status: string;
    total: number;
    createdAt: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      image?: string;
      selectedColor?: string;
      selectedSize?: string;
    }>;
    shippingAddress: {
      fullName: string;
      addressLine1: string;
      city: string;
      state: string;
      postalCode: string;
    };
  };
  tracking: TrackingStep[];
  shippingInfo?: {
    carrier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
  };
}

const OrderTracking: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [trackingData, setTrackingData] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTracking = async () => {
      if (!orderId) return;
      
      try {
        setLoading(true);
        const response = await orderService.getOrderTracking(orderId);
        if (response.success) {
          setTrackingData(response.data);
        } else {
          setError('Order not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load tracking information');
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [orderId]);

  const getStatusColor = (status: string, completed: boolean) => {
    if (!completed) return 'bg-gray-200 text-gray-600';
    
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Pending';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto"></div>
          <p className="mt-3 text-sm text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
        <div className="text-center px-4">
          <h2 className="text-xl font-semibold text-black mb-2">Order Not Found</h2>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Link 
            to="/account?tab=orders" 
            className="inline-block bg-black text-white px-5 py-2 text-sm rounded hover:bg-gray-800 transition-colors"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-4 sm:py-6 lg:py-10" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      <div className="max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="border border-gray-200 rounded-sm lg:rounded-lg p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 lg:mb-4">
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-black">
              Order #{trackingData.order._id.slice(-8)}
            </h1>
            <span className={`px-2.5 lg:px-3 py-1 lg:py-1.5 rounded lg:rounded-md text-xs lg:text-sm font-medium self-start ${getStatusColor(trackingData.order.status, true)}`}>
              {trackingData.order.status.charAt(0).toUpperCase() + trackingData.order.status.slice(1)}
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-6 text-xs sm:text-sm lg:text-base">
            <div>
              <p className="text-gray-500 mb-0.5 lg:mb-1">Order Date</p>
              <p className="font-medium text-black">{formatDate(trackingData.order.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-0.5 lg:mb-1">Total</p>
              <p className="font-medium text-black">₹{trackingData.order.total.toFixed(2)}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-gray-500 mb-0.5 lg:mb-1">Items</p>
              <p className="font-medium text-black">{trackingData.order.items.length} item(s)</p>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="border border-gray-200 rounded-sm lg:rounded-lg p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
          <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-black mb-3 sm:mb-4 lg:mb-6">Order Progress</h2>
          
          <div className="space-y-4 lg:space-y-6">
            {trackingData.tracking.map((step, index) => (
              <div key={step.status} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-9 lg:h-9 rounded-full flex items-center justify-center ${
                    step.completed 
                      ? 'bg-black text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <span className="text-xs lg:text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  {index < trackingData.tracking.length - 1 && (
                    <div className={`w-0.5 h-8 sm:h-10 lg:h-12 mt-1.5 mx-auto ${
                      step.completed ? 'bg-black' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
                
                <div className="ml-3 lg:ml-4 flex-1">
                  <h3 className="text-sm sm:text-base lg:text-lg font-medium text-black">{step.title}</h3>
                  <p className="text-xs sm:text-sm lg:text-base text-gray-600 mt-0.5">{step.description}</p>
                  {step.date && (
                    <p className="text-xs text-gray-400 mt-1">{formatDate(step.date)}</p>
                  )}
                  
                  {step.trackingNumber && (
                    <div className="mt-1.5">
                      <p className="text-xs text-gray-600">
                        Tracking: <span className="font-mono">{step.trackingNumber}</span>
                      </p>
                      {step.trackingUrl && (
                        <a 
                          href={step.trackingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-black hover:text-gray-600 text-xs underline mt-0.5 inline-block"
                        >
                          Track Package →
                        </a>
                      )}
                    </div>
                  )}
                  
                  {step.estimatedDelivery && (
                    <p className="text-xs text-gray-600 mt-1">
                      Est. Delivery: {formatDate(step.estimatedDelivery)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Items */}
        <div className="border border-gray-200 rounded-sm lg:rounded-lg p-3 sm:p-4 lg:p-6 mb-3 sm:mb-4 lg:mb-6">
          <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-black mb-3 sm:mb-4 lg:mb-6">Order Items</h2>
          <div className="divide-y divide-gray-100">
            {trackingData.order.items.map((item, index) => (
              <div key={index} className="flex gap-3 lg:gap-5 py-3 lg:py-4 first:pt-0 last:pb-0">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img
                    src={item.image || '/images/placeholder.jpg'}
                    alt={item.name}
                    className="w-16 h-20 sm:w-20 sm:h-24 lg:w-24 lg:h-28 object-cover rounded lg:rounded-lg border border-gray-100"
                  />
                </div>
                
                {/* Product Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  {/* Top: Name & Price */}
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-medium text-black text-sm sm:text-base lg:text-lg leading-snug">
                      {item.name}
                    </h3>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-semibold text-black text-sm sm:text-base lg:text-lg">
                        ₹{item.price.toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-xs lg:text-sm text-gray-400">
                          ₹{(item.price / item.quantity).toFixed(2)} each
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Bottom: Attributes */}
                  <div className="flex flex-wrap items-center gap-2 lg:gap-3 mt-2 text-xs lg:text-sm">
                    <span className="inline-flex items-center bg-gray-50 px-2 py-1 rounded">
                      <span className="text-gray-500">Qty:</span>
                      <span className="ml-1 font-medium text-black">{item.quantity}</span>
                    </span>
                    
                    {item.selectedColor && (
                      <span className="inline-flex items-center bg-gray-50 px-2 py-1 rounded">
                        <span className="text-gray-500">Color:</span>
                        <span className="ml-1 font-medium text-black">{item.selectedColor}</span>
                      </span>
                    )}
                    
                    {item.selectedSize && (
                      <span className="inline-flex items-center bg-gray-50 px-2 py-1 rounded">
                        <span className="text-gray-500">Size:</span>
                        <span className="ml-1 font-medium text-black">{item.selectedSize}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm lg:text-base text-gray-600">Total ({trackingData.order.items.length} items)</span>
              <span className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-black">₹{trackingData.order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="border border-gray-200 rounded-sm lg:rounded-lg p-3 sm:p-4 lg:p-6">
          <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-black mb-2 sm:mb-3 lg:mb-4">Shipping Address</h2>
          <div className="text-xs sm:text-sm lg:text-base text-gray-600 space-y-0.5 lg:space-y-1">
            <p className="font-medium text-black">{trackingData.order.shippingAddress.fullName}</p>
            <p>{trackingData.order.shippingAddress.addressLine1}</p>
            <p>
              {trackingData.order.shippingAddress.city}, {trackingData.order.shippingAddress.state} {trackingData.order.shippingAddress.postalCode}
            </p>
          </div>
        </div>

        {/* Back to Orders */}
        <div className="mt-4 sm:mt-6 lg:mt-8 text-center">
          <Link 
            to="/account?tab=orders" 
            className="text-black hover:text-gray-600 text-xs sm:text-sm lg:text-base underline inline-flex items-center"
          >
            ← Back to All Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

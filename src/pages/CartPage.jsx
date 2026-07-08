import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import cartService from '../services/cartService';
import Toast from '../components/Toast';

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingItem, setUpdatingItem] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setError('');
    try {
      setLoading(true);
      const response = await cartService.getCart();
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setError('');
    
    try {
      setUpdatingItem(itemId);
      const response = await cartService.updateCartItem(itemId, newQuantity);
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to update quantity');
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setError('');
    try {
      const response = await cartService.removeFromCart(itemId);
      if (response.success) {
        setCart(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    setShowClearConfirm(false);
    setError('');
    try {
      const response = await cartService.clearCart();
      if (response.success) {
        setCart(response.data);
        showToast('Cart cleared successfully!', 'success');
      }
    } catch (err) {
      setError(err.message || 'Failed to clear cart');
      showToast(err.message || 'Failed to clear cart', 'error');
    }
  };

  const handleCheckout = () => {
    // Navigate to checkout page
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Albert Sans', sans-serif" }}>
      {/* Gradient Banner (reuse from ContactUs) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className="text-center flex items-center justify-center h-24 md:h-32 lg:h-[160px] xl:h-[194px] rounded-lg md:rounded-xl lg:rounded-2xl"
          style={{
            background:
              'linear-gradient(90deg, rgba(255, 255, 255, 1) 0%, rgba(254, 240, 239, 1) 50%, rgba(243, 251, 251, 1) 76%, rgba(254, 255, 255, 1) 98%)'
          }}
        >
          <h1 className="text-black text-2xl md:text-3xl lg:text-4xl xl:text-[42px] font-normal">Shopping Cart</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 xl:py-12">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded" aria-live="polite">
            {error}
          </div>
        )}

        {!cart || cart.items.length === 0 ? (
          <div className="bg-white rounded-lg lg:rounded-xl border border-gray-200 p-6 lg:p-10 text-center">
            <h3 className="text-lg md:text-xl lg:text-2xl text-black mb-2">Your cart is empty</h3>
            <p className="text-gray-500 text-sm lg:text-base mb-4 lg:mb-6">Start shopping to add items to your cart.</p>
            <Link
              to="/products"
              className="inline-flex items-center px-5 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-medium rounded-lg text-white bg-black hover:bg-gray-800"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 xl:gap-8">
            {/* Left: Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-3 lg:space-y-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 lg:p-5">
                    {/* Mobile Layout */}
                    <div className="sm:hidden">
                      <div className="flex gap-3">
                        {/* Image */}
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                          <img
                            src={(item.product.images && item.product.images[0]) || '/images/placeholder.jpg'}
                            alt={item.product.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm text-black font-medium line-clamp-2 leading-snug">{item.product.name}</h3>
                          <p className="text-gray-600 text-xs mt-1">₹{item.product.price}</p>
                          {(item.selectedColor || item.selectedSize) && (
                            <p className="text-gray-500 text-xs mt-1">
                              {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                              {item.selectedColor && item.selectedSize && <span> • </span>}
                              {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Controls row for mobile */}
                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={updatingItem === item._id}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 rounded-l-lg text-sm"
                            aria-label={`Decrease quantity of ${item.product.name}`}
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-xs font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={updatingItem === item._id}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 rounded-r-lg text-sm"
                            aria-label={`Increase quantity of ${item.product.name}`}
                          >
                            +
                          </button>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex items-center">
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-red-500 hover:text-red-600 text-xs font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                      <div className="grid grid-cols-[80px_1fr_auto] lg:grid-cols-[96px_1fr_auto] items-center gap-4 lg:gap-5">
                        {/* Image */}
                        <div className="relative w-20 h-20 lg:w-24 lg:h-24 rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={(item.product.images && item.product.images[0]) || '/images/placeholder.jpg'}
                            alt={item.product.name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        </div>

                        {/* Title + unit price + color/size */}
                        <div className="min-w-0">
                          <h3 className="text-base lg:text-lg xl:text-xl text-black font-medium truncate">{item.product.name}</h3>
                          <p className="text-gray-600 text-sm lg:text-base mt-0.5">₹{item.product.price}</p>
                          {(item.selectedColor || item.selectedSize) && (
                            <p className="text-gray-500 text-xs mt-0.5">
                              {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                              {item.selectedColor && item.selectedSize && <span> • </span>}
                              {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                            </p>
                          )}
                        </div>

                        {/* Item total */}
                        <p className="text-base lg:text-lg font-medium text-black whitespace-nowrap">₹{item.itemTotal.toFixed(2)}</p>
                      </div>

                      {/* Controls row */}
                      <div className="mt-3 lg:mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                            disabled={updatingItem === item._id}
                            className="w-7 h-7 lg:w-9 lg:h-9 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 text-sm lg:text-base"
                            aria-label={`Decrease quantity of ${item.product.name}`}
                          >
                            –
                          </button>
                          <span className="w-6 lg:w-8 text-center text-sm lg:text-base">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            disabled={updatingItem === item._id}
                            className="w-7 h-7 lg:w-9 lg:h-9 rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 text-sm lg:text-base"
                            aria-label={`Increase quantity of ${item.product.name}`}
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item._id)}
                          className="text-red-600 hover:text-red-700 text-xs lg:text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer actions and order note */}
              <div className="mt-4">
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full sm:w-auto px-4 py-2 text-sm text-red-600 hover:text-white hover:bg-red-600 border border-red-600 rounded-lg font-medium transition-colors"
                >
                  Clear Cart
                </button>
              </div>

              <div className="mt-4">
                <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-2">Add Order Note</h4>
                <textarea
                  rows={3}
                  placeholder="How can we help you?"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-400 resize-none"
                />
              </div>
            </div>

            {/* Right: Summary */}
            <div className="lg:col-span-1 lg:sticky lg:top-24 self-start">
              {/* Order Summary */}
              <div className="bg-white border border-gray-200 rounded-lg lg:rounded-xl p-4 lg:p-6">
                <h2 className="text-base lg:text-lg font-semibold mb-3 lg:mb-4">Estimate Shipping</h2>
                <div className="space-y-2 lg:space-y-3">
                  <div className="flex justify-between text-xs sm:text-sm lg:text-base">
                    <span className="text-gray-700">Subtotal ({cart.totalItems} items)</span>
                    <span className="text-black">₹{cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm lg:text-base">
                    <span className="text-gray-700">Shipping</span>
                    <span className="text-black">{cart.shipping === 0 ? 'Free' : `₹${cart.shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t pt-2 lg:pt-3">
                    <div className="flex justify-between font-semibold text-sm lg:text-base">
                      <span className="text-black">Total</span>
                      <span className="text-black">₹{cart.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 lg:mt-4 flex items-start gap-2 text-xs lg:text-sm text-gray-600">
                  <input id="agree" type="checkbox" className="mt-0.5 w-3.5 h-3.5 lg:w-4 lg:h-4 rounded border-gray-300" defaultChecked />
                  <label htmlFor="agree" className="select-none">
                    I agree with the <Link to="/policies#terms" className="underline hover:text-black">terms and conditions</Link>
                  </label>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-4 lg:mt-6 bg-black text-white py-2.5 lg:py-3 px-4 text-sm lg:text-base rounded-lg hover:bg-gray-900 font-medium"
                >
                  Check out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 max-w-md w-full mx-4">
            <h3 className="text-base font-semibold mb-3">Clear Cart?</h3>
            <p className="text-gray-600 text-sm mb-4">
              Are you sure you want to clear your cart? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleClearCart}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

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

export default CartPage;


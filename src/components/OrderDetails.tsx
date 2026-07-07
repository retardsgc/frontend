import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';

interface OrderItem {
  _id?: string;
  product?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  itemTotal: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

const OrderDetails: React.FC = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orderId = new URLSearchParams(window.location.search).get('id');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      try {
        setLoading(true);
        const response = await orderService.getOrderById(orderId);
        if (response.success) setOrder(response.data);
        else setError('Order not found');
      } catch (err: any) {
        setError(err.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const clearSelection = () => {
    const params = new URLSearchParams(window.location.search);
    params.delete('id');
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (!orderId) return null;

  if (loading) {
    return <div className="py-12 text-center text-gray-600">Loading order...</div>;
  }

  if (error) {
    return (
      <div className="py-4">
        <div className="text-red-600 mb-4">{error}</div>
        <button onClick={clearSelection} className="text-indigo-600 hover:text-indigo-800 font-medium">Back to orders</button>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Order #{order._id.slice(-6)}</h3>
        <button onClick={clearSelection} className="text-indigo-600 hover:text-indigo-800 font-medium">Back to orders</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {order.items.map((item) => (
            <div key={item._id || item.product} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <img
                src={item.image || '/images/placeholder.jpg'}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                <div className="text-gray-600 text-sm">Qty: {item.quantity}</div>
                {(item.selectedColor || item.selectedSize) && (
                  <div className="text-gray-500 text-sm">
                    {item.selectedColor && <span>Color: {item.selectedColor}</span>}
                    {item.selectedColor && item.selectedSize && <span> • </span>}
                    {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-gray-900 font-medium">₹{item.price.toFixed(2)}</div>
                <div className="text-gray-600 text-sm">Item total: ₹{item.itemTotal.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-6 rounded-lg space-y-3">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{order.shipping === 0 ? 'Free' : `₹${order.shipping.toFixed(2)}`}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
            <div className="pt-3 text-sm text-gray-700">
              <div>Status: <span className="capitalize">{order.status}</span></div>
              <div>Payment: <span className="capitalize">{order.paymentStatus}</span></div>
              <div>Placed: {new Date(order.createdAt).toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;


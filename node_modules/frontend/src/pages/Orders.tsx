// src/pages/Orders.tsx
import React, { useEffect, useState } from 'react';
import { orderAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import './Orders.css';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number | null;
  createdAt: string;
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<{id: number, number: string} | null>(null);
  const toast = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await orderAPI.getAll();
      setOrders(response.data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = (orderId: number, orderNumber: string) => {
    setOrderToCancel({ id: orderId, number: orderNumber });
    setShowCancelModal(true);
  };

  const confirmCancelOrder = async () => {
    if (!orderToCancel) return;
    
    setCancellingId(orderToCancel.id);
    setShowCancelModal(false);
    
    try {
      await orderAPI.cancel(orderToCancel.id);
      toast.addToast('Order cancelled successfully!', 'success');
      // Refresh orders list
      fetchOrders();
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      toast.addToast(err.response?.data?.message || 'Failed to cancel order. Please try again.', 'error');
    } finally {
      setCancellingId(null);
      setOrderToCancel(null);
    }
  };

  const getStatusClass = (status: string) => {
    return `order-status status-${status.toLowerCase().replace(' ', '-')}`;
  };

  const canCancelOrder = (status: string) => {
    const cancellableStatuses = ['PENDING', 'CONFIRMED'];
    return cancellableStatuses.includes(status.toUpperCase());
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="loading">Loading your orders...</div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }
  
  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="orders-container">
          <div className="orders-empty">
            <h2>No Orders Yet</h2>
            <p>Start shopping to see your orders here!</p>
            <Link to="/products" className="shop-now-btn">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1>My Orders</h1>
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>Order #{order.orderNumber}</h3>
                  <p className="order-date">Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={getStatusClass(order.status)}>{order.status}</span>
              </div>
              
              <div className="order-footer">
                <div className="order-total">
                  <span>Total Amount:</span>
                  <strong>${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</strong>
                </div>
                <div className="order-actions">
                  {canCancelOrder(order.status) && (
                    <button 
                      className="cancel-order-btn" 
                      onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                      disabled={cancellingId === order.id}
                    >
                      {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                    </button>
                  )}
                  <Link to={`/track-order/${order.orderNumber}`} className="track-order-btn">
                    Track Order
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Order?"
        message={`Are you sure you want to cancel order #${orderToCancel?.number}? This action cannot be undone.`}
        confirmText="Yes, Cancel"
        cancelText="No, Keep"
        type="danger"
        onConfirm={confirmCancelOrder}
        onCancel={() => {
          setShowCancelModal(false);
          setOrderToCancel(null);
        }}
      />
    </div>
  );
};
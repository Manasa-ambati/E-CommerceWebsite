import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import './OrderTracking.css';

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  tax: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    productName: string;
    productPrice: number;
    quantity: number;
    subtotal: number;
  }>;
}

const OrderTracking: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderAPI.track(orderNumber!);
        setOrder(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const getStatusStep = (status: string) => {
    const steps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    return steps.indexOf(status);
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="order-tracking-page">
        <div className="error-container">
          <h2>Error</h2>
          <p>{error || 'Order not found'}</p>
          <Link to="/orders" className="btn-primary">Back to Orders</Link>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status);

  return (
    <div className="order-tracking-page">
      <div className="tracking-container">
        <div className="tracking-header">
          <h1>Order #{order.orderNumber}</h1>
          <span className={`status-badge status-${order.status.toLowerCase()}`}>
            {order.status}
          </span>
        </div>

        {/* Progress Tracker */}
        <div className="progress-tracker">
          {['Order Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered'].map((step, index) => (
            <div
              key={step}
              className={`progress-step ${index <= currentStep ? 'completed' : ''} ${index === currentStep ? 'current' : ''}`}
            >
              <div className="step-icon">{index <= currentStep ? '✓' : index + 1}</div>
              <span>{step}</span>
            </div>
          ))}
        </div>

        <div className="tracking-content">
          {/* Order Details */}
          <div className="tracking-section">
            <h2>Order Details</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <span>Order Date</span>
                <strong>{new Date(order.createdAt).toLocaleDateString()}</strong>
              </div>
              <div className="detail-item">
                <span>Payment Method</span>
                <strong>{order.paymentMethod}</strong>
              </div>
              <div className="detail-item">
                <span>Payment Status</span>
                <strong>{order.paymentStatus}</strong>
              </div>
              {order.paidAt && (
                <div className="detail-item">
                  <span>Paid On</span>
                  <strong>{new Date(order.paidAt).toLocaleDateString()}</strong>
                </div>
              )}
              {order.shippedAt && (
                <div className="detail-item">
                  <span>Shipped On</span>
                  <strong>{new Date(order.shippedAt).toLocaleDateString()}</strong>
                </div>
              )}
              {order.deliveredAt && (
                <div className="detail-item">
                  <span>Delivered On</span>
                  <strong>{new Date(order.deliveredAt).toLocaleDateString()}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="tracking-section">
            <h2>Shipping Address</h2>
            <div className="address-box">
              <p><strong>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</strong></p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="tracking-section">
            <h2>Order Items</h2>
            <div className="order-items-list">
              {order.items.map((item, index) => (
                <div key={index} className="order-item-detail">
                  <div className="item-info">
                    <span className="item-name">{item.productName}</span>
                    <span className="item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="item-price">₹{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="order-totals">
              <div className="total-row grand-total">
                <span>Order Total</span>
                <span>₹{order.total.toFixed(2)}</span>
              </div>
              <div className="free-delivery-note">
                ✓ Free Delivery Applied
              </div>
            </div>
          </div>
        </div>

        <div className="tracking-footer">
          <Link to="/orders" className="btn-secondary">Back to Orders</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;

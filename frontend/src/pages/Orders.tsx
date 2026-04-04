// src/pages/Orders.tsx
import React, { useEffect, useState } from 'react';
import { orderAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import './Orders.css';

interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price?: number;        // Fallback field name
  productPrice?: number; // Backend field name (primary)
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount?: number;     // Legacy/alias field
  subtotal?: number;        // Backend field name
  tax?: number;             // Backend field name
  shippingCost?: number;    // Backend field name
  total?: number;           // Backend field name (primary)
  createdAt: string;
  items?: OrderItem[];
  shippingAddress?: {
    firstName: string;
    lastName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentStatus?: string;
  paymentMethod?: string;
  deliveredAt?: string;
  shippedAt?: string;
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<{id: number, number: string} | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const toast = useToast();
  const navigate = useNavigate();

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

  const canCancelOrder = (status: string) => {
    const cancellableStatuses = ['PENDING', 'CONFIRMED'];
    return cancellableStatuses.includes(status.toUpperCase());
  };

  const getFilteredOrders = () => {
    if (filterStatus === 'ALL') return orders;
    return orders.filter(order => order.status.toUpperCase() === filterStatus);
  };

  const getStatusIcon = (status: string) => {
    const icons: {[key: string]: string} = {
      'PENDING': '📦',
      'CONFIRMED': '✅',
      'PROCESSING': '⚙️',
      'SHIPPED': '🚚',
      'DELIVERED': '✓',
      'CANCELLED': '❌',
      'REFUNDED': '💰'
    };
    return icons[status.toUpperCase()] || '📦';
  };

  const getEstimatedDelivery = (order: Order) => {
    const placedDate = new Date(order.createdAt);
    const estimatedDate = new Date(placedDate);
    estimatedDate.setDate(estimatedDate.getDate() + 7); // 7 days delivery
    return estimatedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  return (
    <div className="orders-page">
      <div className="orders-container">
        {/* Header */}
        <div className="orders-header">
          <h1>My Orders</h1>
          <div className="orders-stats">
            <span className="total-orders">{orders.length} orders</span>
          </div>
        </div>

        {/* Filter Tabs - Like Amazon/Meesho */}
        <div className="orders-filter-tabs">
          <button 
            className={`filter-tab ${filterStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterStatus('ALL')}
          >
            All Orders
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilterStatus('PENDING')}
          >
            Pending
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'PROCESSING' ? 'active' : ''}`}
            onClick={() => setFilterStatus('PROCESSING')}
          >
            Processing
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'SHIPPED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('SHIPPED')}
          >
            Shipped
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'DELIVERED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('DELIVERED')}
          >
            Delivered
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'CANCELLED' ? 'active' : ''}`}
            onClick={() => setFilterStatus('CANCELLED')}
          >
            Cancelled
          </button>
        </div>
        
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner-large"></div>
            <p>Loading your orders...</p>
          </div>
        )}
        
        {error && (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-message">{error}</p>
            <button onClick={fetchOrders} className="retry-btn">Retry</button>
          </div>
        )}
        
        {!loading && !error && getFilteredOrders().length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🛒</div>
            <h2>No {filterStatus !== 'ALL' ? filterStatus : ''} Orders Yet</h2>
            <p>Start shopping to see your orders here!</p>
            <Link to="/products" className="shop-now-btn">Start Shopping</Link>
          </div>
        )}

        {/* Orders List - Enhanced Cards */}
        {!loading && !error && getFilteredOrders().length > 0 && (
          <div className="orders-list">
            {getFilteredOrders().map((order) => (
              <div key={order.id} className="order-card-enhanced">
                {/* Card is clickable to view details */}
                <div className="card-click-overlay" onClick={() => viewOrderDetails(order)}></div>
                
                <div className="order-card-header">
                  <div className="order-number-section">
                    <h3>Order #{order.orderNumber}</h3>
                    <span className="order-count-badge">{order.items?.length || 0} item(s)</span>
                  </div>
                  <span className={`order-status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}>
                    {getStatusIcon(order.status)} {order.status}
                  </span>
                </div>

                {/* Order Items Preview */}
                <div className="order-items-preview">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="mini-item">
                      <img 
                        src={item.productImage || 'https://via.placeholder.com/80x80?text=Product'} 
                        alt={item.productName} 
                        className="mini-item-image" 
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/80x80?text=Product';
                        }}
                      />
                      <div className="mini-item-details">
                        <p className="mini-item-name">{item.productName}</p>
                        <p className="mini-item-qty">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  {order.items && order.items.length > 3 && (
                    <div className="more-items-badge">
                      +{order.items.length - 3} more
                    </div>
                  )}
                </div>
                
                <div className="order-card-body">
                  <div className="order-date-section">
                    <p className="order-placed-date">
                      Ordered on {new Date(order.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </p>
                    {order.status === 'DELIVERED' && order.deliveredAt && (
                      <p className="delivered-date">
                        Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                      <p className="estimated-delivery">
                        Est. delivery by {getEstimatedDelivery(order)}
                      </p>
                    )}
                  </div>
                  
                  <div className="order-price-section">
                    <span className="price-label">Total:</span>
                    <strong className="price-value">
                      ₹{(order.total || order.totalAmount || 0).toFixed(2)}
                    </strong>
                  </div>
                </div>
                
                <div className="order-card-footer">
                  <button 
                    className="view-details-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewOrderDetails(order);
                    }}
                  >
                    View Details
                  </button>
                  <div className="order-action-buttons">
                    {canCancelOrder(order.status) && (
                      <button 
                        className="cancel-order-btn-small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelOrder(order.id, order.orderNumber);
                        }}
                        disabled={cancellingId === order.id}
                      >
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                    {order.status === 'DELIVERED' && (
                      <button 
                        className="reorder-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Implement reorder functionality
                          toast.addToast('Reorder feature coming soon!', 'info');
                        }}
                      >
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Order Details Modal - Like Amazon */}
      {selectedOrder && (
        <div className={`modal-overlay ${showDetailsModal ? 'show' : ''}`} onClick={() => setShowDetailsModal(false)}>
          <div className="order-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            
            <div className="modal-header">
              <h2>Order Details</h2>
              <span className={`modal-status-badge status-${selectedOrder.status.toLowerCase().replace(' ', '-')}`}>
                {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
              </span>
            </div>

            <div className="modal-body">
              {/* Order Info Grid */}
              <div className="order-info-grid">
                <div className="info-card">
                  <h4>📦 Order Information</h4>
                  <p><strong>Order #:</strong> {selectedOrder.orderNumber}</p>
                  <p><strong>Placed on:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                  {selectedOrder.paymentMethod && (
                    <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
                  )}
                </div>

                <div className="info-card">
                  <h4>🚚 Shipping Address</h4>
                  {selectedOrder.shippingAddress ? (
                    <address>
                      {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}<br />
                      {selectedOrder.shippingAddress.street}<br />
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                      {selectedOrder.shippingAddress.country}<br />
                      Phone: {selectedOrder.shippingAddress.phone}
                    </address>
                  ) : (
                    <p>No shipping address</p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="order-items-full">
                <h4>📦 Order Items ({selectedOrder.items?.length || 0})</h4>
                <div className="items-list-full">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <img 
                        src={item.productImage || 'https://via.placeholder.com/100x100?text=Product'} 
                        alt={item.productName} 
                        className="item-image"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/100x100?text=Product';
                        }}
                      />
                      <div className="item-details">
                        <h5>{item.productName}</h5>
                        <p>Quantity: {item.quantity}</p>
                        <p className="item-price">₹{(item.productPrice || item.price || 0).toFixed(2)}</p>
                      </div>
                      <div className="item-total">
                        ₹{((item.productPrice || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary - Simplified (No Tax/Shipping) */}
              <div className="order-summary-box">
                <div className="summary-row total">
                  <span>Order Total:</span>
                  <span>₹{(selectedOrder.total || selectedOrder.subtotal || selectedOrder.totalAmount || 0).toFixed(2)}</span>
                </div>
                <div className="free-delivery-badge">
                  ✓ Free Delivery
                </div>
              </div>
            </div>

            <div className="modal-footer">
              {canCancelOrder(selectedOrder.status) && (
                <button 
                  className="cancel-order-btn-full"
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleCancelOrder(selectedOrder.id, selectedOrder.orderNumber);
                  }}
                  disabled={cancellingId === selectedOrder.id}
                >
                  {cancellingId === selectedOrder.id ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
              <button 
                className="track-order-btn-full"
                onClick={() => {
                  setShowDetailsModal(false);
                  navigate(`/track-order/${selectedOrder.orderNumber}`);
                }}
              >
                Track Order
              </button>
            </div>
          </div>
        </div>
      )}
      
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
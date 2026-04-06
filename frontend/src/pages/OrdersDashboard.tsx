import React, { useEffect, useState } from 'react';
import { orderAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import './OrdersDashboard.css';

interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price?: number;
  productPrice?: number;
}

interface Order {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount?: number;
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  total?: number;
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

type ActiveTab = 'dashboard' | 'orders' | 'customers';

const OrdersDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<{id: number, number: string} | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');
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
      fetchOrders();
    } catch (err: any) {
      console.error('Failed to cancel order:', err);
      toast.addToast(err.response?.data?.message || 'Failed to cancel order. Please try again.', 'error');
    } finally {
      setCancellingId(null);
      setOrderToCancel(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'status-badge delivered';
      case 'SHIPPED':
        return 'status-badge shipped';
      case 'PROCESSING':
        return 'status-badge processing';
      case 'CANCELLED':
        return 'status-badge cancelled';
      default:
        return 'status-badge pending';
    }
  };

  const filteredOrders = filterStatus === 'ALL' 
    ? orders 
    : orders.filter(order => order.status.toUpperCase() === filterStatus.toUpperCase());

  // Dashboard stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || order.subtotal || 0), 0);
  const pendingOrders = orders.filter(o => o.status.toUpperCase() === 'PENDING' || o.status.toUpperCase() === 'PROCESSING').length;
  const deliveredOrders = orders.filter(o => o.status.toUpperCase() === 'DELIVERED').length;

  const renderSidebar = () => (
    <div className="dashboard-sidebar">
      <div className="sidebar-header">
        <h2>📦 ShopEase</h2>
        <p>Admin Panel</p>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Dashboard</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <span className="nav-icon">🛒</span>
          <span className="nav-label">Orders</span>
          <span className="nav-badge">{totalOrders}</span>
        </button>
        
        <button 
          className={`nav-item ${activeTab === 'customers' ? 'active' : ''}`}
          onClick={() => setActiveTab('customers')}
        >
          <span className="nav-icon">👥</span>
          <span className="nav-label">Customers</span>
        </button>
      </nav>
      
      <div className="sidebar-footer">
        <Link to="/" className="back-link">← Back to Store</Link>
      </div>
    </div>
  );

  const renderDashboardStats = () => (
    <div className="stats-grid">
      <div className="stat-card purple">
        <div className="stat-icon">📦</div>
        <div className="stat-content">
          <h3>{totalOrders}</h3>
          <p>Total Orders</p>
        </div>
      </div>
      
      <div className="stat-card green">
        <div className="stat-icon">💰</div>
        <div className="stat-content">
          <h3>₹{totalRevenue.toFixed(2)}</h3>
          <p>Total Revenue</p>
        </div>
      </div>
      
      <div className="stat-card orange">
        <div className="stat-icon">⏳</div>
        <div className="stat-content">
          <h3>{pendingOrders}</h3>
          <p>Pending Orders</p>
        </div>
      </div>
      
      <div className="stat-card blue">
        <div className="stat-icon">✅</div>
        <div className="stat-content">
          <h3>{deliveredOrders}</h3>
          <p>Delivered</p>
        </div>
      </div>
    </div>
  );

  const renderOrdersTable = () => (
    <div className="orders-table-container">
      <div className="table-header">
        <h2>Orders</h2>
        <div className="filter-controls">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="status-filter"
          >
            <option value="ALL">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={fetchOrders} className="retry-btn">Retry</button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No orders found</h3>
          <p>Start shopping to see your orders here!</p>
          <Link to="/products" className="shop-btn">Browse Products</Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <span className="order-number">{order.orderNumber}</span>
                  </td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td>
                    <div className="customer-info">
                      <span className="customer-name">
                        {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                      </span>
                      <span className="customer-phone">{order.shippingAddress?.phone}</span>
                    </div>
                  </td>
                  <td>
                    <span className="items-count">{order.items?.length || 0} item(s)</span>
                  </td>
                  <td>
                    <span className="order-amount">₹{(order.total || order.subtotal || 0).toFixed(2)}</span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-view"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailsModal(true);
                        }}
                      >
                        View
                      </button>
                      {(order.status.toUpperCase() === 'PENDING' || order.status.toUpperCase() === 'PROCESSING') && (
                        <button 
                          className="btn-cancel"
                          onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                          disabled={cancellingId === order.id}
                        >
                          {cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    return (
      <div className="order-details-modal">
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}></div>
        <div className="modal-content">
          <div className="modal-header">
            <h2>Order Details</h2>
            <button className="close-btn" onClick={() => setShowDetailsModal(false)}>✕</button>
          </div>
          
          <div className="modal-body">
            <div className="detail-section">
              <h3>Order Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Order Number:</label>
                  <span>{selectedOrder.orderNumber}</span>
                </div>
                <div className="detail-item">
                  <label>Order Date:</label>
                  <span>{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={getStatusBadgeClass(selectedOrder.status)}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Payment:</label>
                  <span>{selectedOrder.paymentStatus || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Shipping Address</h3>
              {selectedOrder.shippingAddress ? (
                <div className="address-box">
                  <p><strong>{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</strong></p>
                  <p>{selectedOrder.shippingAddress.street}</p>
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}</p>
                  <p>{selectedOrder.shippingAddress.country}</p>
                  <p>📞 {selectedOrder.shippingAddress.phone}</p>
                </div>
              ) : (
                <p className="no-data">No address information available</p>
              )}
            </div>

            <div className="detail-section">
              <h3>Order Items</h3>
              <div className="items-list">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="order-item-row">
                    <img 
                      src={item.productImage || 'https://via.placeholder.com/60x60'} 
                      alt={item.productName}
                      className="item-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x60';
                      }}
                    />
                    <div className="item-details">
                      <h4>{item.productName}</h4>
                      <p>Qty: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      ₹{(item.productPrice || item.price || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-summary-box">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>₹{(selectedOrder.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Order Total:</span>
                <span>₹{(selectedOrder.total || selectedOrder.subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="free-delivery-badge">
                ✓ Free Delivery
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="orders-dashboard">
      {renderSidebar()}
      
      <div className="dashboard-main">
        {activeTab === 'dashboard' && (
          <>
            <div className="page-header">
              <h1>Dashboard Overview</h1>
            </div>
            {renderDashboardStats()}
          </>
        )}
        
        {activeTab === 'orders' && (
          <>
            <div className="page-header">
              <h1>Manage Orders</h1>
            </div>
            {renderOrdersTable()}
          </>
        )}
        
        {activeTab === 'customers' && (
          <>
            <div className="page-header">
              <h1>Customers</h1>
            </div>
            <div className="coming-soon">
              <div className="coming-soon-icon">🚧</div>
              <h2>Coming Soon</h2>
              <p>Customer management features are under development.</p>
            </div>
          </>
        )}
      </div>

      {showDetailsModal && renderOrderDetails()}

      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Order"
        message={`Are you sure you want to cancel order ${orderToCancel?.number}?`}
        onConfirm={confirmCancelOrder}
        onCancel={() => {
          setShowCancelModal(false);
          setOrderToCancel(null);
        }}
        confirmText="Yes, Cancel"
        cancelText="Keep Order"
        type="warning"
      />
    </div>
  );
};

export default OrdersDashboard;

import React, { useEffect, useState } from 'react';
import { adminAPI } from '../services/api';
import './AdminDashboard.css';

interface Order {
  id: number;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchOrders = async () => {
    try {
      const response = await adminAPI.getAllOrders();
      setOrders(response.data.data.content || response.data.data);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED': return 'status-delivered';
      case 'SHIPPED': return 'status-shipped';
      case 'PROCESSING': return 'status-processing';
      case 'PENDING': return 'status-pending';
      case 'CANCELLED': return 'status-cancelled';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-container">
        <h1>Admin Dashboard</h1>
        
        <div className="dashboard-section">
          <h2>All Orders</h2>
          
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderNumber}</td>
                    <td>
                      {order.user?.firstName} {order.user?.lastName}
                      <br />
                      <small>{order.user?.email}</small>
                    </td>
                    <td>${order.total?.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.paymentStatus}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span>Page {page + 1} of {totalPages}</span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Shield, LogOut, Search, Check, X, Trash2, 
  TrendingUp, ShoppingBag, Clock, CheckCircle, AlertTriangle, Loader2 
} from 'lucide-react';
import { Order } from '@/lib/db';
import styles from './dashboard.module.css';

export default function AdminDashboardClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Controls
  const [activeFilter, setActiveFilter] = useState<'all' | 'Pending' | 'Confirmed' | 'Rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders.');
      }

      setOrders(data.orders || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while loading order records.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Update order status (Confirm / Reject)
  const handleUpdateStatus = async (orderId: string, newStatus: 'Confirmed' | 'Rejected') => {
    if (!confirm(`Are you sure you want to change order ${orderId} status to ${newStatus}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status.');
      }

      // Update state locally
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      alert(err.message || 'Error occurred while updating status.');
    }
  };

  // Delete an order
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`WARNING: Are you sure you want to delete order ${orderId}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/orders?orderId=${orderId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete order.');
      }

      // Remove from local state
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err: any) {
      alert(err.message || 'Error occurred while deleting order.');
    }
  };

  // Logout action
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin';
    } catch (err) {
      console.error('Logout failed:', err);
      window.location.href = '/admin';
    }
  };

  // Computed Business Metrics (Stats)
  const stats = useMemo(() => {
    const totalCount = orders.length;
    const confirmedCount = orders.filter(o => o.status === 'Confirmed').length;
    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const rejectedCount = orders.filter(o => o.status === 'Rejected').length;

    // Total sales matches sum of CONFIRMED orders only
    const totalSales = orders
      .filter(o => o.status === 'Confirmed')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      totalSales,
      totalCount,
      confirmedCount,
      pendingCount,
      rejectedCount
    };
  }, [orders]);

  // Filter & Search computation
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // 1. Status Filter
      const matchesFilter = activeFilter === 'all' || o.status === activeFilter;

      // 2. Search Query (ID, Name, Phone, Email)
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        o.id.toLowerCase().includes(query) ||
        o.customer.name.toLowerCase().includes(query) ||
        o.customer.phone.includes(query) ||
        o.customer.email.toLowerCase().includes(query) ||
        o.customer.city.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [orders, activeFilter, searchQuery]);

  return (
    <div className={styles.dashboardContainer}>
      {/* Top Navbar */}
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <Shield size={22} style={{ color: '#fff' }} />
          <span className={styles.logo}>VOLEEE</span>
          <span className={styles.badge}>Security Shield Active</span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={14} />
            Logout
          </div>
        </button>
      </header>

      {/* Main Container */}
      <main className={styles.mainContent}>
        {/* Business Metrics Grid */}
        <section className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <TrendingUp size={20} style={{ color: '#10b981' }} />
            </div>
            <div>
              <p className={styles.statCardTitle}>Total Sales</p>
              <h3 className={styles.statValue}>Rs {stats.totalSales.toLocaleString()}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <ShoppingBag size={20} style={{ color: '#fff' }} />
            </div>
            <div>
              <p className={styles.statCardTitle}>Total Orders</p>
              <h3 className={styles.statValue}>{stats.totalCount}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <Clock size={20} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p className={styles.statCardTitle}>Pending Review</p>
              <h3 className={styles.statValue}>{stats.pendingCount}</h3>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrapper}>
              <CheckCircle size={20} style={{ color: '#10b981' }} />
            </div>
            <div>
              <p className={styles.statCardTitle}>Confirmed Orders</p>
              <h3 className={styles.statValue}>{stats.confirmedCount}</h3>
            </div>
          </div>
        </section>

        {/* Filters and Controls */}
        <section className={styles.controlsRow}>
          <div className={styles.filterTabs}>
            <button
              className={`${styles.filterTab} ${activeFilter === 'all' ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({stats.totalCount})
            </button>
            <button
              className={`${styles.filterTab} ${activeFilter === 'Pending' ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter('Pending')}
              style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
            >
              Pending ({stats.pendingCount})
            </button>
            <button
              className={`${styles.filterTab} ${activeFilter === 'Confirmed' ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter('Confirmed')}
              style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
            >
              Confirmed ({stats.confirmedCount})
            </button>
            <button
              className={`${styles.filterTab} ${activeFilter === 'Rejected' ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter('Rejected')}
              style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
            >
              Rejected ({stats.rejectedCount})
            </button>
          </div>

          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={16} />
            <input
              type="text"
              placeholder="Search ID, customer name, phone, city..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </section>

        {/* Data Loading States */}
        {isLoading ? (
          <div className={styles.loadingScreen}>
            <Loader2 size={36} className={styles.spinner} />
            <p>Loading database records...</p>
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <AlertTriangle size={36} style={{ color: '#ef4444', marginBottom: '16px' }} />
            <p className={styles.emptyTitle}>Error loading records</p>
            <p>{error}</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className={styles.emptyState}>
            <ShoppingBag size={36} style={{ marginBottom: '16px', opacity: 0.5 }} />
            <p className={styles.emptyTitle}>No Orders Found</p>
            <p>We couldn't find any orders matching the search/filter parameters.</p>
          </div>
        ) : (
          /* Orders Table Card */
          <div className={styles.tableContainer}>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>Order Info</th>
                  <th>Customer Details</th>
                  <th>Ordered Items</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    {/* Order ID & Date */}
                    <td>
                      <span className={styles.orderIdRow}>{order.id}</span>
                      <div className={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        <br />
                        {new Date(order.createdAt).toLocaleTimeString(undefined, {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Customer details */}
                    <td>
                      <div className={styles.customerName}>{order.customer.name}</div>
                      <div className={styles.customerContact}>
                        <span>📞 {order.customer.phone}</span>
                        <span>✉️ {order.customer.email}</span>
                        <span style={{ color: '#bbb', marginTop: '4px' }}>
                          📍 {order.customer.address}, {order.customer.city} ({order.customer.postalCode})
                        </span>
                      </div>
                    </td>

                    {/* Cart Items */}
                    <td>
                      <div className={styles.itemList}>
                        {order.items.map((item, idx) => (
                          <div key={idx} className={styles.itemSummary}>
                            {item.image && (
                              <div className={styles.itemThumb}>
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  sizes="32px"
                                />
                              </div>
                            )}
                            <div>
                              <div className={styles.itemName}>
                                {item.name} <span style={{ color: '#fff', fontWeight: 600 }}>x{item.quantity}</span>
                              </div>
                              <div className={styles.itemDetails}>
                                {item.color} / {item.size} • Rs {item.price.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Subtotal / Grand Total */}
                    <td>
                      <div className={styles.totalAmount}>Rs {order.total.toLocaleString()}</div>
                      <div className={styles.paymentLabel}>{order.paymentMethod}</div>
                      <div style={{ fontSize: '0.7rem', color: '#666' }}>
                        Subtotal: Rs {order.subtotal.toLocaleString()}
                        <br />
                        Shipping: Rs {order.shipping.toLocaleString()}
                      </div>
                    </td>

                    {/* Order Status Badge */}
                    <td>
                      <span className={`
                        ${styles.statusBadge} 
                        ${order.status === 'Pending' ? styles.statusPending : ''} 
                        ${order.status === 'Confirmed' ? styles.statusConfirmed : ''} 
                        ${order.status === 'Rejected' ? styles.statusRejected : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>

                    {/* Order Actions */}
                    <td>
                      <div className={styles.actionsCell}>
                        {order.status === 'Pending' && (
                          <>
                            <button
                              className={`${styles.actionBtn} ${styles.btnConfirm}`}
                              onClick={() => handleUpdateStatus(order.id, 'Confirmed')}
                              title="Confirm Order"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.btnReject}`}
                              onClick={() => handleUpdateStatus(order.id, 'Rejected')}
                              title="Reject Order"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                        <button
                          className={`${styles.actionBtn} ${styles.btnDelete}`}
                          onClick={() => handleDeleteOrder(order.id)}
                          title="Delete Order Log"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

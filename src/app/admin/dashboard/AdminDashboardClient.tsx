'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Shield, LogOut, Search, Check, X, Trash2, 
  TrendingUp, ShoppingBag, Clock, CheckCircle, AlertTriangle, Loader2,
  Package, Save, RefreshCw, Plus, Edit2, MessageSquare
} from 'lucide-react';
import { Order, StockRecord, ProductComment } from '@/lib/db';
import { Product } from '@/data/products';
import styles from './dashboard.module.css';

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE', '28', '30', '32', '34', '36'];
const PRESET_COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Navy', hex: '#1d2a44' },
  { name: 'Beige', hex: '#d9d2c9' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Light Blue', hex: '#8fb4d9' },
  { name: 'Olive', hex: '#556b2f' },
  { name: 'Cream', hex: '#F5F0E1' }
];

export default function AdminDashboardClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stockList, setStockList] = useState<StockRecord[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [reviewsList, setReviewsList] = useState<ProductComment[]>([]);
  
  // Loading & View states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'orders' | 'inventory' | 'products' | 'reviews'>('orders');

  // Search & Filter controls (Orders)
  const [activeFilter, setActiveFilter] = useState<'all' | 'Pending' | 'Confirmed' | 'Rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Search & Filter controls (Inventory)
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'empty'>('all');
  const [stockSearchQuery, setStockSearchQuery] = useState('');

  // Search & Filter controls (Products)
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Search & Filter controls (Reviews)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('all');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  
  // Editing states (Inventory)
  const [editingQty, setEditingQty] = useState<{ [key: string]: number }>({});
  const [isSavingStock, setIsSavingStock] = useState<{ [key: string]: boolean }>({});

  // Product Creation States
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  // Add Form fields
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newOriginalPrice, setNewOriginalPrice] = useState('');
  const [newCategory, setNewCategory] = useState('tees');
  const [newDescription, setNewDescription] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [selectedColors, setSelectedColors] = useState<string[]>(['Black', 'White']);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while loading order records.');
    }
  };

  // Fetch stock levels
  const fetchStock = async () => {
    try {
      const response = await fetch('/api/stock');
      const data = await response.json();
      if (data.success) {
        setStockList(data.stock || []);
      }
    } catch (err) {
      console.error('Error fetching stock:', err);
    }
  };

  // Fetch product catalog
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/admin/products');
      const data = await response.json();
      if (data.success) {
        setProductsList(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching catalog:', err);
    }
  };

  // Fetch reviews for moderation
  const fetchReviews = async () => {
    try {
      const response = await fetch('/api/admin/comments');
      const data = await response.json();
      if (data.success) {
        setReviewsList(data.comments || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // Load all initial data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    await Promise.all([fetchOrders(), fetchStock(), fetchProducts(), fetchReviews()]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();

    // AUTO UPDATE SYSTEM: Poll orders, stock and reviews every 10 seconds dynamically
    const interval = setInterval(() => {
      fetchOrders();
      fetchStock();
      fetchReviews();
    }, 10000);

    return () => clearInterval(interval);
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

      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      fetchStock(); // Refresh stock
    } catch (err: any) {
      alert(err.message || 'Error occurred while updating status.');
    }
  };

  // Delete an order log
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

      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err: any) {
      alert(err.message || 'Error occurred while deleting order.');
    }
  };

  // Save updated stock quantity
  const handleSaveStock = async (productId: string, color: string, size: string) => {
    const key = `${productId}-${color}-${size}`;
    const newQty = editingQty[key];
    if (newQty === undefined || newQty < 0) return;

    setIsSavingStock(prev => ({ ...prev, [key]: true }));

    try {
      const response = await fetch('/api/admin/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, color, size, quantity: newQty }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update stock count.');
      }

      setStockList(prev => prev.map(s => 
        (s.productId === productId && s.color === color && s.size === size) 
          ? { ...s, quantity: newQty } 
          : s
      ));

      setEditingQty(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } catch (err: any) {
      alert(err.message || 'Error occurred while saving stock.');
    } finally {
      setIsSavingStock(prev => ({ ...prev, [key]: false }));
    }
  };

  // Add a new product to catalog
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice.trim()) {
      alert('Product name and price are required.');
      return;
    }

    setIsAddingProduct(true);
    
    // Resolve swatches
    const colorsObjList = selectedColors.map(name => {
      const preset = PRESET_COLORS.find(c => c.name === name);
      return { name, hex: preset ? preset.hex : '#111111' };
    });

    try {
      const payload = {
        name: newName.trim(),
        price: Number(newPrice),
        originalPrice: newOriginalPrice ? Number(newOriginalPrice) : undefined,
        category: newCategory,
        description: newDescription.trim(),
        sizes: selectedSizes,
        colors: colorsObjList,
        images: ['/images/product-tee-1.png']
      };

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product.');
      }

      alert('Product created successfully and stock database seeded!');
      
      setNewName('');
      setNewPrice('');
      setNewOriginalPrice('');
      setNewDescription('');
      setShowAddForm(false);

      await Promise.all([fetchProducts(), fetchStock()]);
    } catch (err: any) {
      alert(err.message || 'Error occurred while creating product.');
    } finally {
      setIsAddingProduct(false);
    }
  };

  // Delete product from catalog
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This will remove it from the store catalog and delete all its associated inventory stock.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete product.');
      }

      setProductsList(prev => prev.filter(p => p.id !== productId));
      fetchStock();
    } catch (err: any) {
      alert(err.message || 'Error deleting product.');
    }
  };

  // Update comment/review status
  const handleUpdateReviewStatus = async (commentId: string, newStatus: 'Approved' | 'Rejected') => {
    try {
      const response = await fetch('/api/admin/comments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update review status.');
      }

      setReviewsList(prev => prev.map(r => r.id === commentId ? { ...r, status: newStatus } : r));
    } catch (err: any) {
      alert(err.message || 'Error updating review status.');
    }
  };

  // Delete a review record
  const handleDeleteReview = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this customer review?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete review.');
      }

      setReviewsList(prev => prev.filter(r => r.id !== commentId));
    } catch (err: any) {
      alert(err.message || 'Error deleting review.');
    }
  };

  // Logout action
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin';
    } catch (err) {
      window.location.href = '/admin';
    }
  };

  // Computed Business Metrics (Orders)
  const orderStats = useMemo(() => {
    const totalCount = orders.length;
    const confirmedCount = orders.filter(o => o.status === 'Confirmed').length;
    const pendingCount = orders.filter(o => o.status === 'Pending').length;
    const rejectedCount = orders.filter(o => o.status === 'Rejected').length;
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

  // Computed Business Metrics (Inventory)
  const inventoryStats = useMemo(() => {
    const totalVariants = stockList.length;
    const outOfStockCount = stockList.filter(s => s.quantity === 0).length;
    const lowStockCount = stockList.filter(s => s.quantity > 0 && s.quantity <= 2).length;

    return {
      totalVariants,
      outOfStockCount,
      lowStockCount
    };
  }, [stockList]);

  // Computed Reviews Metrics
  const reviewsStats = useMemo(() => {
    const total = reviewsList.length;
    const pending = reviewsList.filter(r => r.status === 'Pending').length;
    const approved = reviewsList.filter(r => r.status === 'Approved').length;
    const rejected = reviewsList.filter(r => r.status === 'Rejected').length;

    return { total, pending, approved, rejected };
  }, [reviewsList]);

  // Filter & Search computation (Orders)
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesFilter = activeFilter === 'all' || o.status === activeFilter;
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

  // Filter & Search computation (Inventory)
  const filteredStock = useMemo(() => {
    return stockList.filter(s => {
      const catalogProduct = productsList.find(p => p.id === s.productId);
      const name = catalogProduct?.name || '';

      const query = stockSearchQuery.toLowerCase().trim();
      const matchesSearch = !query ||
        name.toLowerCase().includes(query) ||
        s.productId.toLowerCase().includes(query) ||
        s.color.toLowerCase().includes(query) ||
        s.size.toLowerCase().includes(query);

      let matchesFilter = true;
      if (stockFilter === 'empty') matchesFilter = s.quantity === 0;
      if (stockFilter === 'low') matchesFilter = s.quantity > 0 && s.quantity <= 2;

      return matchesSearch && matchesFilter;
    });
  }, [stockList, productsList, stockSearchQuery, stockFilter]);

  // Filter & Search computation (Products)
  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      const query = productSearchQuery.toLowerCase().trim();
      return !query ||
        p.name.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query);
    });
  }, [productsList, productSearchQuery]);

  // Filter & Search computation (Reviews)
  const filteredReviews = useMemo(() => {
    return reviewsList.filter(r => {
      const matchesFilter = reviewFilter === 'all' || r.status === reviewFilter;
      const query = reviewSearchQuery.toLowerCase().trim();
      
      const productObj = productsList.find(p => p.id === r.productId);
      const productName = productObj?.name || '';

      const matchesSearch = !query ||
        r.id.toLowerCase().includes(query) ||
        r.customerName.toLowerCase().includes(query) ||
        r.email.toLowerCase().includes(query) ||
        r.content.toLowerCase().includes(query) ||
        productName.toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [reviewsList, productsList, reviewFilter, reviewSearchQuery]);

  const toggleSizeCheckbox = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleColorCheckbox = (color: string) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Top Navbar */}
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <Shield size={22} style={{ color: '#fff' }} />
          <span className={styles.logo}>DRAVEN</span>
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
        
        {/* Section Tabs (Orders vs Inventory vs Products vs Reviews) */}
        <div className={styles.sectionTabs}>
          <button
            className={`${styles.sectionTab} ${activeSection === 'orders' ? styles.sectionTabActive : ''}`}
            onClick={() => setActiveSection('orders')}
          >
            Orders Log ({orderStats.totalCount})
          </button>
          <button
            className={`${styles.sectionTab} ${activeSection === 'inventory' ? styles.sectionTabActive : ''}`}
            onClick={() => setActiveSection('inventory')}
          >
            Inventory Stock ({inventoryStats.totalVariants})
          </button>
          <button
            className={`${styles.sectionTab} ${activeSection === 'products' ? styles.sectionTabActive : ''}`}
            onClick={() => setActiveSection('products')}
          >
            Product Catalog ({productsList.length})
          </button>
          <button
            className={`${styles.sectionTab} ${activeSection === 'reviews' ? styles.sectionTabActive : ''}`}
            onClick={() => setActiveSection('reviews')}
          >
            Reviews Moderation ({reviewsStats.pending})
          </button>
        </div>

        {/* 1. ORDERS LOG SECTION */}
        {activeSection === 'orders' && (
          <>
            {/* Stats Grid */}
            <section className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <TrendingUp size={20} style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p className={styles.statCardTitle}>Total Sales</p>
                  <h3 className={styles.statValue}>Rs {orderStats.totalSales.toLocaleString()}</h3>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <ShoppingBag size={20} style={{ color: '#fff' }} />
                </div>
                <div>
                  <p className={styles.statCardTitle}>Total Orders</p>
                  <h3 className={styles.statValue}>{orderStats.totalCount}</h3>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <Clock size={20} style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <p className={styles.statCardTitle}>Pending Review</p>
                  <h3 className={styles.statValue}>{orderStats.pendingCount}</h3>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <CheckCircle size={20} style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p className={styles.statCardTitle}>Confirmed Orders</p>
                  <h3 className={styles.statValue}>{orderStats.confirmedCount}</h3>
                </div>
              </div>
            </section>

            {/* Filter controls */}
            <section className={styles.controlsRow}>
              <div className={styles.filterTabs}>
                <button
                  className={`${styles.filterTab} ${activeFilter === 'all' ? styles.filterTabActive : ''}`}
                  onClick={() => setActiveFilter('all')}
                >
                  All ({orderStats.totalCount})
                </button>
                <button
                  className={`${styles.filterTab} ${activeFilter === 'Pending' ? styles.filterTabActive : ''}`}
                  onClick={() => setActiveFilter('Pending')}
                  style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
                >
                  Pending ({orderStats.pendingCount})
                </button>
                <button
                  className={`${styles.filterTab} ${activeFilter === 'Confirmed' ? styles.filterTabActive : ''}`}
                  onClick={() => setActiveFilter('Confirmed')}
                  style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
                >
                  Confirmed ({orderStats.confirmedCount})
                </button>
                <button
                  className={`${styles.filterTab} ${activeFilter === 'Rejected' ? styles.filterTabActive : ''}`}
                  onClick={() => setActiveFilter('Rejected')}
                  style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
                >
                  Rejected ({orderStats.rejectedCount})
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

            {/* Orders Table */}
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
                <p>We couldn't find any orders matching the parameters.</p>
              </div>
            ) : (
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

                        <td>
                          <div className={styles.customerName}>{order.customer.name}</div>
                          <div className={styles.customerContact}>
                            <span>📞 {order.customer.phone}</span>
                            <span>✉️ {order.customer.email}</span>
                            <span style={{ color: '#bbb', marginTop: '4px' }}>
                              📍 {order.customer.address}, {order.customer.city}
                            </span>
                          </div>
                        </td>

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

                        <td>
                          <div className={styles.totalAmount}>Rs {order.total.toLocaleString()}</div>
                          <div className={styles.paymentLabel}>{order.paymentMethod}</div>
                          <div style={{ fontSize: '0.7rem', color: '#666' }}>
                            Subtotal: Rs {order.subtotal.toLocaleString()}
                            <br />
                            Shipping: Rs {order.shipping.toLocaleString()}
                          </div>
                        </td>

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
          </>
        )}

        {/* 2. INVENTORY STOCK SECTION */}
        {activeSection === 'inventory' && (
          <>
            {/* Stock Stats Grid */}
            <section className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <Package size={20} style={{ color: '#fff' }} />
                </div>
                <div>
                  <p className={styles.statCardTitle}>Catalog Variations</p>
                  <h3 className={styles.statValue}>{inventoryStats.totalVariants}</h3>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <AlertTriangle size={20} style={{ color: '#ef4444' }} />
                </div>
                <div>
                  <p className={styles.statCardTitle}>Out of Stock</p>
                  <h3 className={styles.statValue} style={{ color: '#ef4444' }}>
                    {inventoryStats.outOfStockCount}
                  </h3>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <Clock size={20} style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <p className={styles.statCardTitle}>Low Stock Variations</p>
                  <h3 className={styles.statValue} style={{ color: '#f59e0b' }}>
                    {inventoryStats.lowStockCount}
                  </h3>
                </div>
              </div>
            </section>

            {/* Filter controls */}
            <section className={styles.controlsRow}>
              <div className={styles.filterTabs}>
                <button
                  className={`${styles.filterTab} ${stockFilter === 'all' ? styles.filterTabActive : ''}`}
                  onClick={() => setStockFilter('all')}
                >
                  All ({inventoryStats.totalVariants})
                </button>
                <button
                  className={`${styles.filterTab} ${stockFilter === 'low' ? styles.filterTabActive : ''}`}
                  onClick={() => setStockFilter('low')}
                  style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
                >
                  Low Stock ({inventoryStats.lowStockCount})
                </button>
                <button
                  className={`${styles.filterTab} ${stockFilter === 'empty' ? styles.filterTabActive : ''}`}
                  onClick={() => setStockFilter('empty')}
                  style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
                >
                  Out of Stock ({inventoryStats.outOfStockCount})
                </button>
              </div>

              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={16} />
                <input
                  type="text"
                  placeholder="Search garment, color, size, ID..."
                  className={styles.searchInput}
                  value={stockSearchQuery}
                  onChange={(e) => setStockSearchQuery(e.target.value)}
                />
              </div>
            </section>

            {/* Inventory table */}
            {isLoading ? (
              <div className={styles.loadingScreen}>
                <Loader2 size={36} className={styles.spinner} />
                <p>Loading database inventory...</p>
              </div>
            ) : filteredStock.length === 0 ? (
              <div className={styles.emptyState}>
                <Package size={36} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p className={styles.emptyTitle}>No Stock Records Found</p>
                <p>We couldn't find any inventory rows matching these parameters.</p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.ordersTable}>
                  <thead>
                    <tr>
                      <th>Product Info</th>
                      <th>Color & Size</th>
                      <th>Current Quantity</th>
                      <th>Inventory Status</th>
                      <th style={{ textAlign: 'right' }}>Quick Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStock.map((stock) => {
                      const productObj = productsList.find(p => p.id === stock.productId);
                      const key = `${stock.productId}-${stock.color}-${stock.size}`;
                      const currentVal = editingQty[key] !== undefined ? editingQty[key] : stock.quantity;
                      const isModified = editingQty[key] !== undefined && editingQty[key] !== stock.quantity;
                      const isSaving = isSavingStock[key] || false;

                      return (
                        <tr key={key}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              {productObj?.images[0] && (
                                <div className={styles.itemThumb} style={{ width: '40px', height: '50px' }}>
                                  <Image
                                    src={productObj.images[0]}
                                    alt={productObj.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    sizes="40px"
                                  />
                                </div>
                              )}
                              <div>
                                <div className={styles.customerName}>{productObj?.name || 'Unknown Product'}</div>
                                <div className={styles.orderDate}>ID: {stock.productId}</div>
                              </div>
                            </div>
                          </td>

                          <td style={{ textTransform: 'uppercase', fontWeight: 600 }}>
                            <span style={{ color: '#fff' }}>{stock.size}</span>
                            <div style={{ fontSize: '0.75rem', color: '#888', fontWeight: 400, marginTop: '2px' }}>
                              Color: {stock.color}
                            </div>
                          </td>

                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <input
                                type="number"
                                min={0}
                                className={styles.stockInput}
                                value={currentVal}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  setEditingQty(prev => ({
                                    ...prev,
                                    [key]: isNaN(val) ? 0 : val
                                  }));
                                }}
                                disabled={isSaving}
                              />
                              {isModified && (
                                <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>
                                  Unsaved
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            {stock.quantity === 0 ? (
                              <span className={`${styles.statusBadge} ${styles.statusRejected}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                ❌ Out of Stock
                              </span>
                            ) : stock.quantity <= 2 ? (
                              <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                                ⚠️ Low Stock ({stock.quantity})
                              </span>
                            ) : (
                              <span className={`${styles.statusBadge} ${styles.statusConfirmed}`}>
                                ✓ In Stock
                              </span>
                            )}
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <button
                              className={styles.btnSave}
                              disabled={!isModified || isSaving}
                              onClick={() => handleSaveStock(stock.productId, stock.color, stock.size)}
                              title="Save Stock Count"
                            >
                              {isSaving ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Save size={14} />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* 3. PRODUCT CATALOG MANAGEMENT SECTION */}
        {activeSection === 'products' && (
          <>
            <div className={styles.catalogHeader}>
              <button 
                className={styles.submitBtn} 
                style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#fff', color: '#000' }}
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? <X size={16} /> : <Plus size={16} />}
                {showAddForm ? 'Cancel Creation' : 'Add New Garment'}
              </button>

              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={16} />
                <input
                  type="text"
                  placeholder="Search catalog by name, category..."
                  className={styles.searchInput}
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddProduct} className={styles.productFormCard}>
                <h3 className={styles.customerName} style={{ fontSize: '1.15rem', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
                  Create New Product Profile
                </h3>

                <div className={styles.formRow}>
                  <div className={styles.formCol}>
                    <label className={styles.formLabel}>Garment Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Heavyweight Cotton Oversized Tee" 
                      className={styles.formInput}
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className={styles.formCol}>
                    <label className={styles.formLabel}>Retail Price (Rs)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 3850" 
                      className={styles.formInput} 
                      value={newPrice} 
                      onChange={(e) => setNewPrice(e.target.value)}
                      required 
                    />
                  </div>

                  <div className={styles.formCol}>
                    <label className={styles.formLabel}>Original Price (Rs, Optional)</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 4500" 
                      className={styles.formInput} 
                      value={newOriginalPrice} 
                      onChange={(e) => setNewOriginalPrice(e.target.value)}
                    />
                  </div>

                  <div className={styles.formCol}>
                    <label className={styles.formLabel}>Category</label>
                    <select 
                      className={styles.formInput}
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      style={{ background: '#111', color: '#fff' }}
                    >
                      <option value="tees">Tees</option>
                      <option value="denim">Denim</option>
                      <option value="hoodies">Hoodies</option>
                      <option value="shirts">Shirts</option>
                      <option value="shorts">Shorts</option>
                      <option value="joggers">Joggers</option>
                      <option value="accessories">Accessories</option>
                      <option value="footwear">Footwear</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formCol} style={{ marginBottom: '20px' }}>
                  <label className={styles.formLabel}>Description</label>
                  <textarea 
                    placeholder="Describe the material, fit guidelines, and styling instructions..." 
                    className={styles.formTextarea} 
                    value={newDescription} 
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className={styles.formLabel}>Available Sizes</label>
                  <div className={styles.formCheckboxGroup}>
                    {DEFAULT_SIZES.map(size => (
                      <label key={size} className={styles.formCheckbox}>
                        <input 
                          type="checkbox" 
                          checked={selectedSizes.includes(size)} 
                          onChange={() => toggleSizeCheckbox(size)} 
                        />
                        {size}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <label className={styles.formLabel}>Available Colors</label>
                  <div className={styles.formCheckboxGroup}>
                    {PRESET_COLORS.map(col => (
                      <label key={col.name} className={styles.formCheckbox}>
                        <input 
                          type="checkbox" 
                          checked={selectedColors.includes(col.name)} 
                          onChange={() => toggleColorCheckbox(col.name)} 
                        />
                        <span style={{ display: 'inline-block', width: '12px', height: '12px', background: col.hex, border: '1px solid rgba(255,255,255,0.1)' }} />
                        {col.name}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button type="submit" className={styles.btnSubmit} disabled={isAddingProduct}>
                    {isAddingProduct ? <Loader2 size={14} className="animate-spin" /> : 'Seed Product & Stock'}
                  </button>
                  <button type="button" className={styles.btnCancel} onClick={() => setShowAddForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Catalog Table */}
            {isLoading ? (
              <div className={styles.loadingScreen}>
                <Loader2 size={36} className={styles.spinner} />
                <p>Loading database catalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className={styles.emptyState}>
                <Package size={36} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p className={styles.emptyTitle}>No Products Found</p>
                <p>No products exist in your catalog matching the search query.</p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.ordersTable}>
                  <thead>
                    <tr>
                      <th>Garment Details</th>
                      <th>Category</th>
                      <th>Colors</th>
                      <th>Sizes</th>
                      <th>Price</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {p.images[0] && (
                              <div className={styles.itemThumb} style={{ width: '40px', height: '50px' }}>
                                <Image
                                  src={p.images[0]}
                                  alt={p.name}
                                  fill
                                  style={{ objectFit: 'cover' }}
                                  sizes="40px"
                                />
                              </div>
                            )}
                            <div>
                              <div className={styles.customerName}>{p.name}</div>
                              <div className={styles.orderDate}>Product ID: {p.id}</div>
                            </div>
                          </div>
                        </td>

                        <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600 }}>
                          {p.category}
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {p.colors.map(col => (
                              <span 
                                key={col.name} 
                                title={col.name} 
                                style={{ display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', background: col.hex, border: '1px solid rgba(255,255,255,0.2)' }} 
                              />
                            ))}
                          </div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '200px' }}>
                            {p.sizes.map(sz => (
                              <span key={sz} style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px' }}>
                                {sz}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, color: '#fff' }}>Rs {p.price.toLocaleString()}</div>
                          {p.originalPrice && (
                            <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: '#666' }}>
                              Rs {p.originalPrice.toLocaleString()}
                            </div>
                          )}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            className={`${styles.actionBtn} ${styles.btnReject}`}
                            onClick={() => handleDeleteProduct(p.id)}
                            title="Delete Product Profile"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* 4. REVIEWS MODERATION SECTION */}
        {activeSection === 'reviews' && (
          <>
            {/* Reviews Moderation Stats */}
            <section className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <MessageSquare size={20} style={{ color: '#fff' }} />
                </div>
                <div>
                  <p className={styles.statCardTitle}>Total Reviews Submitted</p>
                  <h3 className={styles.statValue}>{reviewsStats.total}</h3>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <Clock size={20} style={{ color: '#f59e0b' }} />
                </div>
                <div>
                  <p className={styles.statCardTitle}>Pending Review (Needs Action)</p>
                  <h3 className={styles.statValue} style={{ color: '#f59e0b' }}>
                    {reviewsStats.pending}
                  </h3>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statIconWrapper}>
                  <CheckCircle size={20} style={{ color: '#10b981' }} />
                </div>
                <div>
                  <p className={styles.statCardTitle}>Approved & Storefront Live</p>
                  <h3 className={styles.statValue} style={{ color: '#10b981' }}>
                    {reviewsStats.approved}
                  </h3>
                </div>
              </div>
            </section>

            {/* Filter controls */}
            <section className={styles.controlsRow}>
              <div className={styles.filterTabs}>
                <button
                  className={`${styles.filterTab} ${reviewFilter === 'all' ? styles.filterTabActive : ''}`}
                  onClick={() => setReviewFilter('all')}
                >
                  All ({reviewsStats.total})
                </button>
                <button
                  className={`${styles.filterTab} ${reviewFilter === 'Pending' ? styles.filterTabActive : ''}`}
                  onClick={() => setReviewFilter('Pending')}
                  style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
                >
                  Pending ({reviewsStats.pending})
                </button>
                <button
                  className={`${styles.filterTab} ${reviewFilter === 'Approved' ? styles.filterTabActive : ''}`}
                  onClick={() => setReviewFilter('Approved')}
                  style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
                >
                  Approved ({reviewsStats.approved})
                </button>
                <button
                  className={`${styles.filterTab} ${reviewFilter === 'Rejected' ? styles.filterTabActive : ''}`}
                  onClick={() => setReviewFilter('Rejected')}
                  style={{ borderLeft: '1px solid rgba(255,255,255,0.05)' }}
                >
                  Rejected ({reviewsStats.rejected})
                </button>
              </div>

              <div className={styles.searchWrapper}>
                <Search className={styles.searchIcon} size={16} />
                <input
                  type="text"
                  placeholder="Search reviews, names, contents..."
                  className={styles.searchInput}
                  value={reviewSearchQuery}
                  onChange={(e) => setReviewSearchQuery(e.target.value)}
                />
              </div>
            </section>

            {/* Reviews Table */}
            {isLoading ? (
              <div className={styles.loadingScreen}>
                <Loader2 size={36} className={styles.spinner} />
                <p>Loading database reviews...</p>
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className={styles.emptyState}>
                <MessageSquare size={36} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p className={styles.emptyTitle}>No Reviews Found</p>
                <p>We couldn't find any reviews matching these moderation filters.</p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.ordersTable}>
                  <thead>
                    <tr>
                      <th>Garment Details</th>
                      <th>Customer Details</th>
                      <th>Stars</th>
                      <th style={{ width: '35%' }}>Comment Message</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((rev) => {
                      const productObj = productsList.find(p => p.id === rev.productId);

                      return (
                        <tr key={rev.id}>
                          {/* Product info */}
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              {productObj?.images[0] && (
                                <div className={styles.itemThumb} style={{ width: '40px', height: '50px' }}>
                                  <Image
                                    src={productObj.images[0]}
                                    alt={productObj.name}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    sizes="40px"
                                  />
                                </div>
                              )}
                              <div>
                                <div className={styles.customerName}>{productObj?.name || 'Unknown Garment'}</div>
                                <div className={styles.orderDate}>Product ID: {rev.productId}</div>
                              </div>
                            </div>
                          </td>

                          {/* Customer */}
                          <td>
                            <div className={styles.customerName}>{rev.customerName}</div>
                            <div className={styles.customerContact}>
                              <span>✉️ {rev.email}</span>
                              <span style={{ fontSize: '0.7rem', color: '#666', marginTop: '4px' }}>
                                Date: {new Date(rev.createdAt).toLocaleString()}
                              </span>
                            </div>
                          </td>

                          {/* Star rating */}
                          <td>
                            <div className="stars" style={{ display: 'flex', gap: '2px' }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= rev.rating ? '#c5a880' : 'none'} stroke="#c5a880" strokeWidth="1.5">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                              ))}
                            </div>
                          </td>

                          {/* Review Content */}
                          <td style={{ fontSize: '0.82rem', lineHeight: '1.5', color: '#ccc' }}>
                            "{rev.content}"
                          </td>

                          {/* Status Badge */}
                          <td>
                            <span className={`
                              ${styles.statusBadge} 
                              ${rev.status === 'Pending' ? styles.statusPending : ''} 
                              ${rev.status === 'Approved' ? styles.statusConfirmed : ''} 
                              ${rev.status === 'Rejected' ? styles.statusRejected : ''}
                            `}>
                              {rev.status}
                            </span>
                          </td>

                          {/* Action update */}
                          <td>
                            <div className={styles.actionsCell}>
                              {rev.status === 'Pending' && (
                                <>
                                  <button
                                    className={`${styles.actionBtn} ${styles.btnConfirm}`}
                                    onClick={() => handleUpdateReviewStatus(rev.id, 'Approved')}
                                    title="Approve Review"
                                  >
                                    <Check size={14} />
                                  </button>
                                  <button
                                    className={`${styles.actionBtn} ${styles.btnReject}`}
                                    onClick={() => handleUpdateReviewStatus(rev.id, 'Rejected')}
                                    title="Reject Review"
                                  >
                                    <X size={14} />
                                  </button>
                                </>
                              )}
                              {rev.status === 'Approved' && (
                                <button
                                  className={`${styles.actionBtn} ${styles.btnReject}`}
                                  onClick={() => handleUpdateReviewStatus(rev.id, 'Rejected')}
                                  title="Revoke / Reject Review"
                                >
                                  <X size={14} />
                                </button>
                              )}
                              {rev.status === 'Rejected' && (
                                <button
                                  className={`${styles.actionBtn} ${styles.btnConfirm}`}
                                  onClick={() => handleUpdateReviewStatus(rev.id, 'Approved')}
                                  title="Approve Review"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              <button
                                className={`${styles.actionBtn} ${styles.btnDelete}`}
                                onClick={() => handleDeleteReview(rev.id)}
                                title="Delete Review Log"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { products } from '@/data/products';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    totalPrice,
    isCartOpen,
    setIsCartOpen,
    freeShippingThreshold,
    amountToFreeShipping,
  } = useCart();

  const progressPercent = Math.min(100, ((freeShippingThreshold - amountToFreeShipping) / freeShippingThreshold) * 100);

  // recommendations - pick products not in cart
  const cartProductIds = items.map((i) => i.product.id);
  const recommendations = products
    .filter((p) => !cartProductIds.includes(p.id))
    .slice(0, 3);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overlay active"
            onClick={() => setIsCartOpen(false)}
            style={{ zIndex: 998 }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={styles.drawer}
          >
            {/* Header */}
            <div className={styles.header}>
              <h2 className={styles.title}>SHOPPING BAG</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Free Shipping Bar */}
            <div className={styles.shippingBar}>
              {amountToFreeShipping > 0 ? (
                <p className={styles.shippingText}>
                  Spend <strong>Rs {amountToFreeShipping.toLocaleString()}.00</strong> more for <strong>FREE SHIPPING</strong>
                </p>
              ) : (
                <p className={styles.shippingText}>🎉 You qualify for <strong>FREE SHIPPING!</strong></p>
              )}
              <div className={styles.progressTrack}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={styles.progressFill}
                />
              </div>
            </div>

            {/* Cart Content Area */}
            <div className={styles.itemsContainer}>
              {items.length === 0 ? (
                <div className={styles.empty}>
                  <p className={styles.emptyText}>Your shopping bag is empty.</p>
                  <Link
                    href="/collections/new-arrivals"
                    className="btn btn-primary btn-full"
                    onClick={() => setIsCartOpen(false)}
                    style={{ fontSize: '11px', letterSpacing: '0.15em' }}
                  >
                    CONTINUE SHOPPING
                  </Link>
                </div>
              ) : (
                <div className={styles.items}>
                  {items.map((item) => {
                    const itemKey = `${item.product.id}_${item.selectedColor}_${item.selectedSize}`;
                    return (
                      <div key={itemKey} className={styles.item}>
                        <div className={styles.itemImage}>
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            width={80}
                            height={100}
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className={styles.itemInfo}>
                          <h4 className={styles.itemName}>{item.product.name}</h4>
                          <p className={styles.itemVariant}>
                            {item.selectedColor} / {item.selectedSize}
                          </p>
                          <p className={styles.itemPrice}>Rs {item.product.price.toLocaleString()}.00</p>
                          <div className={styles.itemActions}>
                            <div className={styles.quantityStepper}>
                              <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>−</button>
                              <span>{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>+</button>
                            </div>
                            <button
                              className={styles.removeBtn}
                              onClick={() => removeItem(item.product.id)}
                              aria-label="Remove item"
                            >
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <div className={styles.recommendations}>
                  <h3 className={styles.recTitle}>COMPLETE THE LOOK</h3>
                  <div className={styles.recGrid}>
                    {recommendations.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        className={styles.recItem}
                        onClick={() => setIsCartOpen(false)}
                      >
                        <div className={styles.recImage}>
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            width={65}
                            height={80}
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                        <div className={styles.recInfo}>
                          <p className={styles.recName}>{product.name}</p>
                          <p className={styles.recPrice}>Rs {product.price.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Checkout Summary */}
            {items.length > 0 && (
              <div className={styles.footer}>
                <div className={styles.subtotalRow}>
                  <span>SUBTOTAL</span>
                  <span className={styles.subtotalPrice}>Rs {totalPrice.toLocaleString()}.00</span>
                </div>
                <p className={styles.footerNote}>Taxes, shipping, and discounts calculated at checkout.</p>
                <Link 
                  href="/checkout" 
                  className={styles.checkoutBtn}
                  onClick={() => setIsCartOpen(false)}
                >
                  CHECKOUT
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

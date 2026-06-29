'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { CheckCircle, CreditCard, Truck, Lock, ArrowRight, Loader } from 'lucide-react';
import styles from './page.module.css';

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  
  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Simulated Card States
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Flow states
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Constants
  const SHIPPING_COST = totalPrice >= 9999 ? 0 : 350;
  const GRAND_TOTAL = totalPrice + SHIPPING_COST;

  // Form Validations
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{9,15}$/.test(phone.trim())) {
      newErrors.phone = 'Enter a valid phone number (9-15 digits)';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!address.trim()) newErrors.address = 'Delivery address is required';
    if (!city.trim()) newErrors.city = 'City is required';
    if (!postalCode.trim()) newErrors.postalCode = 'Postal code is required';

    if (paymentMethod === 'card') {
      if (!cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = 'Enter a valid 16-digit card number';
      }

      if (!cardExpiry.trim()) {
        newErrors.cardExpiry = 'Expiry date is required';
      } else if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        newErrors.cardExpiry = 'Use MM/YY format';
      }

      if (!cardCvv.trim()) {
        newErrors.cardCvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(cardCvv)) {
        newErrors.cardCvv = 'Enter 3 or 4 digit CVV';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const orderData = {
        customer: {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
        },
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          color: item.selectedColor,
          size: item.selectedSize,
        })),
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card',
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to place order. Please try again.');
      }

      // Successful order
      setCreatedOrder(resData.order);
      clearCart();
    } catch (err: any) {
      setSubmitError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If order was successfully created, show Order Success Page
  if (createdOrder) {
    return (
      <div className={styles.successContainer}>
        <CheckCircle className={styles.successIcon} size={64} />
        <h1 className={styles.successTitle}>Thank You!</h1>
        <p className={styles.successText}>
          Your order has been placed successfully. A confirmation email has been sent to{' '}
          <strong>{createdOrder.customer.email}</strong>.
        </p>

        <div className={styles.orderCard}>
          <h2 className={styles.orderCardTitle}>Order Details</h2>
          <div className={styles.orderDetailRow}>
            <span className={styles.orderDetailLabel}>Order ID</span>
            <span className={styles.orderDetailValue}>{createdOrder.id}</span>
          </div>
          <div className={styles.orderDetailRow}>
            <span className={styles.orderDetailLabel}>Status</span>
            <span className={styles.orderDetailValue} style={{ color: '#d97706' }}>
              {createdOrder.status}
            </span>
          </div>
          <div className={styles.orderDetailRow}>
            <span className={styles.orderDetailLabel}>Delivery Address</span>
            <span className={styles.orderDetailValue} style={{ textAlign: 'right', maxWidth: '280px' }}>
              {createdOrder.customer.address}, {createdOrder.customer.city}
            </span>
          </div>
          <div className={styles.orderDetailRow}>
            <span className={styles.orderDetailLabel}>Payment Method</span>
            <span className={styles.orderDetailValue}>{createdOrder.paymentMethod}</span>
          </div>
          <div className={styles.orderDetailRow} style={{ borderTop: '1px solid #eaeaea', paddingTop: '12px', marginTop: '12px' }}>
            <span className={styles.orderDetailLabel} style={{ fontWeight: '700', color: '#111' }}>Total Amount</span>
            <span className={styles.orderDetailValue} style={{ fontWeight: '700', color: '#111', fontSize: '1.1rem' }}>
              Rs {createdOrder.total.toLocaleString()}.00
            </span>
          </div>
        </div>

        <div className={styles.successButtons}>
          <Link href="/" className={styles.homeBtn}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // If cart is empty, show Empty State
  if (items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <h1 className={styles.emptyTitle}>Your Cart is Empty</h1>
        <p className={styles.emptyText}>Add some items from our collections before checking out.</p>
        <Link href="/" className={styles.shopBtn}>
          Back to Store
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Secure Checkout</h1>

      <form onSubmit={handlePlaceOrder} className={styles.checkoutLayout}>
        {/* Left Column: Form Info */}
        <div>
          {/* Section 1: Customer Details */}
          <div style={{ marginBottom: '40px' }}>
            <h2 className={styles.sectionTitle}>1. Delivery Details</h2>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.name && <p className={styles.errorText}>{errors.name}</p>}
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. 0771234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.email && <p className={styles.errorText}>{errors.email}</p>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Delivery Address</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Street address, Apartment, Suite, etc."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.address && <p className={styles.errorText}>{errors.address}</p>}
            </div>

            <div className={styles.row}>
              <div className={styles.formGroup}>
                <label className={styles.label}>City</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Colombo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.city && <p className={styles.errorText}>{errors.city}</p>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Postal Code</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. 00100"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  disabled={isSubmitting}
                />
                {errors.postalCode && <p className={styles.errorText}>{errors.postalCode}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div>
            <h2 className={styles.sectionTitle}>2. Payment Method</h2>
            
            <div className={styles.paymentSelector}>
              <div
                className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.paymentOptionActive : ''}`}
                onClick={() => !isSubmitting && setPaymentMethod('cod')}
              >
                <Truck className={styles.paymentIcon} size={24} />
                <span className={styles.paymentLabel}>Cash on Delivery</span>
                <span className={styles.paymentDesc}>Pay with cash when order is delivered</span>
              </div>

              <div
                className={`${styles.paymentOption} ${paymentMethod === 'card' ? styles.paymentOptionActive : ''}`}
                onClick={() => !isSubmitting && setPaymentMethod('card')}
              >
                <CreditCard className={styles.paymentIcon} size={24} />
                <span className={styles.paymentLabel}>Card Payment</span>
                <span className={styles.paymentDesc}>Simulated secure online transaction</span>
              </div>
            </div>

            {/* Simulated Card Fields */}
            {paymentMethod === 'card' && (
              <div className={styles.cardForm}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', fontSize: '0.8rem', color: '#666' }}>
                  <Lock size={14} />
                  <span>Your payment details are encrypted securely (Mock environment)</span>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Card Number</label>
                  <input
                    type="text"
                    maxLength={19}
                    className={styles.input}
                    placeholder="1234 5678 1234 5678"
                    value={cardNumber}
                    onChange={(e) => {
                      // auto space formatting
                      const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                      const matches = val.match(/\d{4,16}/g);
                      const match = (matches && matches[0]) || '';
                      const parts = [];
                      for (let i = 0, len = match.length; i < len; i += 4) {
                        parts.push(match.substring(i, i + 4));
                      }
                      setCardNumber(parts.length > 0 ? parts.join(' ') : val);
                    }}
                    disabled={isSubmitting}
                  />
                  {errors.cardNumber && <p className={styles.errorText}>{errors.cardNumber}</p>}
                </div>

                <div className={styles.row}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Expiry Date</label>
                    <input
                      type="text"
                      maxLength={5}
                      className={styles.input}
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length > 2) {
                          val = val.substring(0, 2) + '/' + val.substring(2, 4);
                        }
                        setCardExpiry(val);
                      }}
                      disabled={isSubmitting}
                    />
                    {errors.cardExpiry && <p className={styles.errorText}>{errors.cardExpiry}</p>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      className={styles.input}
                      placeholder="***"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                      disabled={isSubmitting}
                    />
                    {errors.cardCvv && <p className={styles.errorText}>{errors.cardCvv}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sticky Summary */}
        <div>
          <div className={styles.summaryContainer}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            
            <div className={styles.summaryItemsList}>
              {items.map((item) => (
                <div key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`} className={styles.summaryItem}>
                  <div className={styles.itemImage}>
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="64px"
                    />
                  </div>
                  <div className={styles.itemInfo}>
                    <h3 className={styles.itemName}>{item.product.name}</h3>
                    <p className={styles.itemMeta}>
                      Size: {item.selectedSize} | Color: {item.selectedColor}
                    </p>
                    <p className={styles.itemQty}>Qty: {item.quantity}</p>
                  </div>
                  <div className={styles.itemPrice}>
                    Rs {(item.product.price * item.quantity).toLocaleString()}.00
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.costBlock}>
              <div className={styles.costRow}>
                <span>Subtotal</span>
                <span>Rs {totalPrice.toLocaleString()}.00</span>
              </div>
              <div className={styles.costRow}>
                <span>Shipping</span>
                <span>{SHIPPING_COST === 0 ? 'FREE' : `Rs ${SHIPPING_COST.toLocaleString()}.00`}</span>
              </div>
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>Rs {GRAND_TOTAL.toLocaleString()}.00</span>
              </div>
            </div>

            {submitError && (
              <div style={{ color: '#d93838', fontSize: '0.9rem', marginBottom: '16px', background: '#fdf2f2', padding: '12px', border: '1px solid #fde8e8' }}>
                {submitError}
              </div>
            )}

            <button
              type="submit"
              className={styles.placeOrderBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader size={18} className="animate-spin" style={{ marginRight: '8px' }} />
                  Processing...
                </>
              ) : (
                <>
                  Place Order
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center', marginTop: '20px', fontSize: '0.75rem', color: '#666' }}>
              <Lock size={12} />
              <span>Secure Server Checkout Enforced</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import styles from './SubscribePopup.module.css';

export default function SubscribePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={() => setIsOpen(false)} aria-label="Close popup">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        <div className={styles.imageSection}>
          <div className={styles.imagePlaceholder}>
            <div className={styles.logoOverlayContainer}>
              <span className={styles.logoOverlay}>DRAVEN</span>
              <span className={styles.logoOverlaySubtitle}>NEVER BACK DOWN</span>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>SUBSCRIBE NOW</h2>
          <p className={styles.subtitle}>
            DON&apos;T MISS OUT ON THE LATEST DROP AND OFFERS.
          </p>
          <p className={styles.note}>Be the first to get notified.</p>

          <div className={styles.divider} />

          <form className={styles.form} onSubmit={(e) => { e.preventDefault(); setIsOpen(false); }}>
            <div className={styles.inputGroup}>
              <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <span className={styles.flag}>🇱🇰</span>
              <input
                type="tel"
                placeholder="+94 Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={styles.input}
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              SUBSCRIBE
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './Header.module.css';

const navLinks = [
  { label: 'NEW IN', href: '/collections/new-arrivals', hasDropdown: false },
  { label: 'MENS', href: '/collections/mens', hasDropdown: false },
  { label: 'WOMENS', href: '/collections/womens', hasDropdown: false },
  { label: 'ACCESSORIES', href: '/collections/accessories', hasDropdown: false },
  { label: 'SALE', href: '/collections/sale', hasDropdown: false, isSale: true },
];

export default function Header() {
  const { totalItems, setIsCartOpen, setIsSearchOpen, setIsMobileMenuOpen } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>
        {/* Left: Hamburger + Nav */}
        <div className={styles.left}>
          <button
            className={styles.hamburger}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={styles.nav}>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`${styles.navLink} ${link.isSale ? styles.saleLink : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Center: Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoText}>DRAVEN</span>
          <span className={styles.logoSubtitle}>NEVER BACK DOWN</span>
        </Link>

        {/* Right: Actions */}
        <div className={styles.right}>
          <Link href="/admin" className={styles.loginLink}>LOG IN</Link>
          <button
            className={styles.iconBtn}
            onClick={() => setIsSearchOpen(true)}
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </button>
          <button
            className={styles.cartBtn}
            onClick={() => setIsCartOpen(true)}
            aria-label="Cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {totalItems > 0 && (
              <span className={styles.cartBadge}>{totalItems}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

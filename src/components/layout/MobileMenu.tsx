'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './MobileMenu.module.css';

const menuItems = [
  {
    label: 'MENS',
    href: '/collections/mens',
    subItems: [
      { label: 'All Mens', href: '/collections/mens' },
      { label: 'Tees', href: '/collections/printed-tees' },
      { label: 'Denim', href: '/collections/mens' },
      { label: 'Hoodies', href: '/collections/mens' },
    ],
  },
  {
    label: 'WOMENS',
    href: '/collections/womens',
    subItems: [
      { label: 'All Womens', href: '/collections/womens' },
      { label: 'Tops', href: '/collections/womens' },
      { label: 'Hoodies', href: '/collections/womens' },
    ],
  },
  {
    label: 'ACCESSORIES',
    href: '/collections/accessories',
    subItems: [
      { label: 'All Accessories', href: '/collections/accessories' },
      { label: 'Bags', href: '/collections/accessories' },
      { label: 'Caps', href: '/collections/accessories' },
      { label: 'Bottles', href: '/collections/accessories' },
    ],
  },
  {
    label: 'FOOTWEAR',
    href: '/collections/footwear',
    subItems: [
      { label: 'All Footwear', href: '/collections/footwear' },
    ],
  },
  { label: 'E-VOUCHER', href: '#' },
  { label: 'SALE', href: '/collections/sale', isSale: true },
];

export default function MobileMenu() {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useCart();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  return (
    <>
      <div
        className={`overlay ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <div className={`${styles.menu} ${isMobileMenuOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <button
            className={styles.closeBtn}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <div key={item.label} className={styles.navItem}>
              {item.subItems ? (
                <>
                  <button
                    className={`${styles.navLink} ${item.isSale ? styles.saleLink : ''}`}
                    onClick={() => toggleSubmenu(item.label)}
                  >
                    {item.label}
                    <svg
                      className={`${styles.chevron} ${openSubmenu === item.label ? styles.chevronOpen : ''}`}
                      width="12" height="8" viewBox="0 0 12 8" fill="none"
                    >
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </button>
                  <div className={`${styles.submenu} ${openSubmenu === item.label ? styles.submenuOpen : ''}`}>
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className={styles.subLink}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${item.isSale ? styles.saleLink : ''}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className={styles.footer}>
          <Link href="/admin" className={styles.footerLink}>LOG IN</Link>
        </div>
      </div>
    </>
  );
}

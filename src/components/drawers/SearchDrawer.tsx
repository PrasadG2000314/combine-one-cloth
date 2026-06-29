'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { products } from '@/data/products';
import styles from './SearchDrawer.module.css';

const popularSearches = ['Tees', 'Denim', 'Bags', 'Hoodies', 'Sneakers', 'Caps', 'Sale'];

export default function SearchDrawer() {
  const { isSearchOpen, setIsSearchOpen } = useCart();
  const [query, setQuery] = useState('');

  const trending = products.slice(0, 4);

  const results = query.length > 1
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overlay active"
            onClick={() => setIsSearchOpen(false)}
            style={{ zIndex: 998 }}
          />

          {/* Search Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={styles.drawer}
          >
            <div className={styles.header}>
              <h2 className={styles.title}>SEARCH PRODUCTS</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search catalog..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={styles.searchInput}
                autoFocus
              />
              {query && (
                <button className={styles.clearBtn} onClick={() => setQuery('')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className={styles.content}>
              {results.length > 0 ? (
                <div className={styles.results}>
                  <h3 className={styles.sectionTitle}>RESULTS ({results.length})</h3>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      className={styles.resultItem}
                      onClick={() => { setIsSearchOpen(false); setQuery(''); }}
                    >
                      <div className={styles.resultImage}>
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          width={60}
                          height={75}
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div className={styles.resultInfo}>
                        <p className={styles.resultName}>{product.name}</p>
                        <p className={styles.resultPrice}>Rs {product.price.toLocaleString()}.00</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <>
                  {/* Popular Searches */}
                  <div className={styles.popular}>
                    <h3 className={styles.sectionTitle}>POPULAR SEARCHES</h3>
                    <div className={styles.tags}>
                      {popularSearches.map((search) => (
                        <button
                          key={search}
                          className={styles.tag}
                          onClick={() => setQuery(search)}
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Trending Now */}
                  <div className={styles.trending}>
                    <h3 className={styles.sectionTitle}>TRENDING NOW</h3>
                    <div className={styles.trendingGrid}>
                      {trending.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          className={styles.trendingItem}
                          onClick={() => { setIsSearchOpen(false); setQuery(''); }}
                        >
                          <div className={styles.trendingImage}>
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              width={70}
                              height={88}
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div className={styles.trendingInfo}>
                            <p className={styles.trendingName}>{product.name}</p>
                            <p className={styles.trendingPrice}>Rs {product.price.toLocaleString()}.00</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

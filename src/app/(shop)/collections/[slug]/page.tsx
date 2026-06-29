'use client';

import { use, useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { getCollectionBySlug } from '@/data/collections';
import { getProductsByCollection, products, Product } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';
import styles from './page.module.css';

// Predefined filter options based on product dataset
const FILTER_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'ONE SIZE', '28', '30', '32', '34', '36'];
const FILTER_COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Navy', hex: '#1d2a44' },
  { name: 'Beige', hex: '#d9d2c9' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Olive', hex: '#556b2f' },
  { name: 'Sage', hex: '#9CAF88' },
  { name: 'Cream', hex: '#F5F0E1' }
];

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const collection = getCollectionBySlug(slug);

  // Active filters and settings
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>('featured');
  const [gridCols, setGridCols] = useState<number>(4);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Get base products in this collection
  const baseProducts = useMemo(() => {
    if (slug === 'all' || slug === 'shop-all') {
      return products;
    }
    const filtered = getProductsByCollection(slug);
    // If no matching collection slug, return all as fallback
    return filtered.length > 0 ? filtered : products;
  }, [slug]);

  // Derived filter category options in this collection
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    baseProducts.forEach(p => cats.add(p.category));
    return Array.from(cats);
  }, [baseProducts]);

  // Filter and Sort calculations
  const displayProducts = useMemo(() => {
    let list = [...baseProducts];

    // Filter by color
    if (selectedColor) {
      list = list.filter(p => p.colors.some(c => c.name.toLowerCase() === selectedColor.toLowerCase()));
    }

    // Filter by size
    if (selectedSize) {
      list = list.filter(p => p.sizes.includes(selectedSize));
    }

    // Filter by category
    if (selectedCategory) {
      list = list.filter(p => p.category === selectedCategory);
    }

    // Sort order
    if (sortOrder === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOrder === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortOrder === 'newest') {
      // Prioritize items marked isNew
      list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return list;
  }, [baseProducts, selectedColor, selectedSize, selectedCategory, sortOrder]);

  const displayName = collection?.name || slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  const handleResetFilters = () => {
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedCategory(null);
    setSortOrder('featured');
  };

  return (
    <div className={styles.page}>
      {/* Hero Banner */}
      <div className={styles.hero}>
        <Image
          src={collection?.heroImage || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80'}
          alt={displayName}
          fill
          className={styles.heroImage}
          sizes="100vw"
          priority
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <p className={styles.heroLabel}>VOLEEE SIGNATURE</p>
          <h1 className={styles.heroTitle}>{displayName}</h1>
          <p className={styles.heroDesc}>{collection?.description || 'Curated minimalist streetwear fits.'}</p>
        </div>
      </div>

      <div className="container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/collections/all">Shop</Link>
          <span>/</span>
          <span>{displayName}</span>
        </div>

        {/* Toolbar */}
        <div className={styles.toolbar}>
          <button 
            className={`${styles.filterBtn} ${showFilters ? styles.filterBtnActive : ''}`} 
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="4" y1="21" x2="4" y2="14" />
              <line x1="4" y1="10" x2="4" y2="3" />
              <line x1="12" y1="21" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12" y2="3" />
              <line x1="20" y1="21" x2="20" y2="16" />
              <line x1="20" y1="12" x2="20" y2="3" />
            </svg>
            <span>{showFilters ? 'HIDE FILTERS' : 'FILTERS'}</span>
          </button>

          <div className={styles.toolbarRight}>
            {/* Grid layout selector */}
            <div className={styles.layoutSelector}>
              <button 
                className={`${styles.layoutBtn} ${gridCols === 2 ? styles.layoutBtnActive : ''}`}
                onClick={() => setGridCols(2)}
                aria-label="2 column grid"
              >
                <span></span><span></span>
              </button>
              <button 
                className={`${styles.layoutBtn} ${gridCols === 3 ? styles.layoutBtnActive : ''}`}
                onClick={() => setGridCols(3)}
                aria-label="3 column grid"
              >
                <span></span><span></span><span></span>
              </button>
              <button 
                className={`${styles.layoutBtn} ${gridCols === 4 ? styles.layoutBtnActive : ''}`}
                onClick={() => setGridCols(4)}
                aria-label="4 column grid"
              >
                <span></span><span></span><span></span><span></span>
              </button>
            </div>

            <select 
              className={styles.sortSelect} 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="featured">FEATURED</option>
              <option value="price-low">PRICE: LOW TO HIGH</option>
              <option value="price-high">PRICE: HIGH TO LOW</option>
              <option value="rating">AVG RATING</option>
              <option value="newest">NEW ARRIVALS</option>
            </select>
            
            <span className={styles.count}>{displayProducts.length} ARTICLES</span>
          </div>
        </div>

        {/* Collapsible Filters Container */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className={styles.filtersWrapper}
            >
              <div className={styles.filtersInner}>
                {/* Color swatches */}
                <div className={styles.filterGroup}>
                  <h4 className={styles.filterGroupTitle}>COLOR</h4>
                  <div className={styles.colorOptions}>
                    {FILTER_COLORS.map(color => (
                      <button
                        key={color.name}
                        className={`${styles.colorCircle} ${selectedColor === color.name ? styles.colorCircleActive : ''}`}
                        style={{ backgroundColor: color.hex }}
                        onClick={() => setSelectedColor(selectedColor === color.name ? null : color.name)}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Size buttons */}
                <div className={styles.filterGroup}>
                  <h4 className={styles.filterGroupTitle}>SIZE</h4>
                  <div className={styles.sizeOptions}>
                    {FILTER_SIZES.map(size => (
                      <button
                        key={size}
                        className={`${styles.sizeTag} ${selectedSize === size ? styles.sizeTagActive : ''}`}
                        onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category toggles */}
                {availableCategories.length > 1 && (
                  <div className={styles.filterGroup}>
                    <h4 className={styles.filterGroupTitle}>CATEGORY</h4>
                    <div className={styles.catOptions}>
                      {availableCategories.map(cat => (
                        <button
                          key={cat}
                          className={`${styles.catTag} ${selectedCategory === cat ? styles.catTagActive : ''}`}
                          onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active selectors list */}
                {(selectedColor || selectedSize || selectedCategory) && (
                  <div className={styles.resetSection}>
                    <button className={styles.resetBtn} onClick={handleResetFilters}>
                      <Trash2 size={13} style={{ marginRight: '4px' }} />
                      RESET FILTERS
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <AnimatePresence mode="wait">
          {displayProducts.length > 0 ? (
            <motion.div
              layout
              key={`${gridCols}_${selectedColor}_${selectedSize}_${selectedCategory}`}
              className={`${styles.grid} ${
                gridCols === 2 ? styles.grid2 : gridCols === 3 ? styles.grid3 : styles.grid4
              }`}
            >
              {displayProducts.map((product, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  key={product.id}
                >
                  <ProductCard product={product} index={i} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.noResults}
            >
              <h3>NO ARTICLES FOUND</h3>
              <p>Try clearing active filters to view the complete catalog.</p>
              <button className="btn btn-outline-dark" onClick={handleResetFilters}>
                CLEAR ALL FILTERS
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

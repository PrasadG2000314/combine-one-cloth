'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsRevealed(true), index * 100);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.colors[0]?.name || '', product.sizes[0] || '');
  };

  const installmentPrice = Math.round(product.price / 3);

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${isRevealed ? styles.revealed : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className={styles.imageWrapper}>
        <div className={styles.imageContainer}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className={`${styles.image} ${isHovered && product.images[1] ? styles.imageHidden : ''}`}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {product.images[1] && (
            <Image
              src={product.images[1]}
              alt={product.name}
              fill
              className={`${styles.image} ${styles.imageHover} ${isHovered ? styles.imageVisible : ''}`}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          )}
        </div>

        {/* Badges */}
        {product.isSale && (
          <span className={`${styles.badge} ${styles.badgeSale}`}>SALE</span>
        )}
        {product.isNew && !product.isSale && (
          <span className={`${styles.badge} ${styles.badgeNew}`}>NEW</span>
        )}

        {/* Wishlist */}
        <button className={styles.wishlist} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} aria-label="Add to wishlist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>

        {/* Quick Add */}
        <div className={`${styles.quickAdd} ${isHovered ? styles.quickAddVisible : ''}`}>
          <button className={styles.quickAddBtn} onClick={handleQuickAdd}>
            ADD TO CART
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.name}>{product.name}</h3>
        <div className={styles.pricing}>
          <span className={styles.price}>Rs {product.price.toLocaleString()}.00</span>
          {product.originalPrice && (
            <span className={styles.originalPrice}>Rs {product.originalPrice.toLocaleString()}.00</span>
          )}
        </div>
        <p className={styles.installment}>
          3 X Rs {installmentPrice.toLocaleString()} or 4.5% Cashback
        </p>

        {/* Color Swatches */}
        {product.colors.length > 1 && (
          <div className={styles.swatches}>
            {product.colors.map((color) => (
              <span
                key={color.name}
                className={styles.swatch}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

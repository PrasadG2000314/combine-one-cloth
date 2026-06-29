'use client';

import { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { getProductBySlug, products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/product/ProductCard';
import styles from './page.module.css';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const product = getProductBySlug(slug);
  const { addItem } = useCart();

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>('specs');
  const [activeImage, setActiveImage] = useState(0);

  // Set default swatches when product loads
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]?.name || '');
      setSelectedSize(product.sizes[0] || '');
      setActiveImage(0);
    }
  }, [product]);

  // Calculate stock status dynamically
  const stockStatus = useMemo(() => {
    if (!selectedSize) return 'Select size';
    // Simple deterministic mock stock checking
    if (selectedSize === 'XXL' || selectedSize === '36' || selectedSize === 'XL') {
      return '⚠️ LOW STOCK - Only 2 articles remaining';
    }
    if (selectedSize === 'S' || selectedSize === '28') {
      return '⚠️ LIMITED STOCK - 4 articles remaining';
    }
    return '✓ IN STOCK - Ready for dispatch';
  }, [selectedSize]);

  if (!product) {
    return (
      <div className={styles.notFound}>
        <h1 className="heading-lg">PRODUCT NOT FOUND</h1>
        <p>The garment you are looking for does not exist in our catalog.</p>
        <Link href="/collections/all" className="btn btn-primary">SHOP ALL CATALOG</Link>
      </div>
    );
  }

  const mintpayKokoPrice = Math.round(product.price / 3);
  const payzyPrice = Math.round(product.price / 4);

  const handleAddToCart = () => {
    addItem(product, selectedColor, selectedSize, quantity);
  };

  // Related products logic
  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 4);
  const relatedFallback = related.length >= 4 ? related : products.filter((p) => p.id !== product.id).slice(0, 4);

  const toggleAccordion = (key: string) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/collections/all">Shop</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        {/* Product Layout Grid */}
        <div className={styles.layout}>
          {/* Gallery Column */}
          <div className={styles.gallery}>
            <div className={styles.mainImage}>
              <Image
                src={product.images[activeImage] || product.images[0]}
                alt={product.name}
                fill
                className={styles.productImage}
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`${styles.thumbnail} ${i === activeImage ? styles.thumbnailActive : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} view ${i + 1}`}
                      width={80}
                      height={100}
                      style={{ objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Specifications Column */}
          <div className={styles.info}>
            <span className={styles.categoryLabel}>{product.category.toUpperCase()}</span>
            <h1 className={styles.name}>{product.name}</h1>
            
            <div className={styles.pricing}>
              <span className={styles.price}>Rs {product.price.toLocaleString()}.00</span>
              {product.originalPrice && (
                <span className={styles.originalPrice}>Rs {product.originalPrice.toLocaleString()}.00</span>
              )}
            </div>

            {/* Rating Stars */}
            <div className={styles.rating}>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= Math.round(product.rating) ? '#c5a880' : 'none'} stroke="#c5a880" strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span className={styles.reviewCount}>({product.reviews} customer reviews)</span>
            </div>

            <p className={styles.descriptionText}>{product.description}</p>

            {/* Swatch Selection Form */}
            <div className={styles.swatchSection}>
              {/* Color Swatches */}
              <div className={styles.optionGroup}>
                <label className={styles.optionLabel}>COLOR: <span className={styles.activeOptionVal}>{selectedColor}</span></label>
                <div className="color-swatches">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      className={`color-swatch ${selectedColor === color.name ? 'active' : ''}`}
                      style={{ backgroundColor: color.hex }}
                      data-color={color.hex}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size Buttons */}
              <div className={styles.optionGroup}>
                <div className={styles.sizeHeader}>
                  <label className={styles.optionLabel}>SIZE: <span className={styles.activeOptionVal}>{selectedSize}</span></label>
                  <button className={styles.sizeChartLink} onClick={() => alert('Size Guideline:\nStandard streetwear sizing fits. For oversized silhouette, take your normal size. For regular fit, size down.')}>
                    SIZE CHART
                  </button>
                </div>
                <div className="size-buttons">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live stock notification */}
              {selectedSize && (
                <div className={styles.stockNotice}>
                  <span>{stockStatus}</span>
                </div>
              )}
            </div>

            {/* Add to Cart Controls */}
            <div className={styles.addToCartSection}>
              <div className="quantity-stepper">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <span className="qty-value">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              <button className={styles.addToCartBtn} onClick={handleAddToCart}>
                ADD TO SHOPPING BAG
              </button>
            </div>

            <button className={styles.wishlistBtn} onClick={() => alert('Added to wishlist')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              ADD TO WISHLIST
            </button>

            {/* BNPL Payments Calculator Widget */}
            <div className={styles.bnplContainer}>
              <h4 className={styles.bnplTitle}>INTEREST-FREE INSTALLMENTS AVAILABLE</h4>
              <div className={styles.bnplList}>
                <div className={styles.bnplRow}>
                  <span className={styles.bnplPartner}>Mintpay</span>
                  <span className={styles.bnplScheme}>Rs {mintpayKokoPrice.toLocaleString()}.00 x 3 months</span>
                </div>
                <div className={styles.bnplRow}>
                  <span className={styles.bnplPartner}>Koko</span>
                  <span className={styles.bnplScheme}>Rs {mintpayKokoPrice.toLocaleString()}.00 x 3 months</span>
                </div>
                <div className={styles.bnplRow}>
                  <span className={styles.bnplPartner}>Payzy</span>
                  <span className={styles.bnplScheme}>Rs {payzyPrice.toLocaleString()}.00 x 4 months</span>
                </div>
              </div>
            </div>

            {/* Specifications & Shipping Accordions */}
            <div className={styles.accordions}>
              <div className={`accordion-item ${openAccordion === 'specs' ? 'open' : ''}`}>
                <button className="accordion-header" onClick={() => toggleAccordion('specs')}>
                  PRODUCT SPECIFICATIONS
                  <span className="accordion-icon">+</span>
                </button>
                <div className="accordion-content">
                  <div className="accordion-content-inner">
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
                      Constructed from organic heavyweight combed cotton blends (240GSM to 450GSM). Soft-washed, pre-shrunk fabrics featuring flat-lock seam finishes. Cut in a luxury comfort profile that keeps its structure over time.
                    </p>
                  </div>
                </div>
              </div>

              <div className={`accordion-item ${openAccordion === 'shipping' ? 'open' : ''}`}>
                <button className="accordion-header" onClick={() => toggleAccordion('shipping')}>
                  DELIVERY & RETURN POLICY
                  <span className="accordion-icon">+</span>
                </button>
                <div className="accordion-content">
                  <div className="accordion-content-inner">
                    <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: '1.7' }}>
                      Islandwide courier delivery takes 3 to 5 business days. Standard shipping fee is Rs. 400.00, or FREE for orders exceeding Rs. 9999.00. We accept unused returns with original tags attached within 14 days of delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Share social links */}
            <div className={styles.share}>
              <span className={styles.shareLabel}>SHARE:</span>
              <button className={styles.shareBtn} aria-label="Share on Facebook" onClick={() => alert('Link copied for Facebook')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
              </button>
              <button className={styles.shareBtn} aria-label="Share on WhatsApp" onClick={() => alert('Link copied for WhatsApp')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        <div className={styles.related}>
          <h2 className={styles.relatedTitle}>YOU MAY ALSO LIKE</h2>
          <div className={styles.relatedGrid}>
            {relatedFallback.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

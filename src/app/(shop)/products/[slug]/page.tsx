'use client';

import { use, useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { products, Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/product/ProductCard';
import styles from './page.module.css';
import { Loader2 } from 'lucide-react';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string | null>('specs');
  const [activeImage, setActiveImage] = useState(0);
  const [stockList, setStockList] = useState<{ size: string; color: string; quantity: number }[]>([]);

  // Reviews States
  const [comments, setComments] = useState<any[]>([]);
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  // Fetch reviews for the product
  const fetchComments = () => {
    if (!product) return;
    fetch(`/api/comments?productId=${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setComments(data.comments || []);
        }
      })
      .catch((err) => console.error('Error fetching comments:', err));
  };

  useEffect(() => {
    fetchComments();
  }, [product]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);
    setCommentSuccess(false);

    if (!product) {
      setCommentError('Garment details not loaded.');
      return;
    }

    if (!commentName.trim() || !commentEmail.trim() || !commentContent.trim()) {
      setCommentError('Please fill in all review fields.');
      return;
    }

    setSubmittingComment(true);

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: commentName.trim(),
          email: commentEmail.trim(),
          rating: commentRating,
          content: commentContent.trim()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review.');
      }

      setCommentSuccess(true);
      setCommentName('');
      setCommentEmail('');
      setCommentRating(5);
      setCommentContent('');
      fetchComments();
    } catch (err: any) {
      setCommentError(err.message || 'Failed to submit review.');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Load product details dynamically from database
  useEffect(() => {
    setLoadingProduct(true);
    fetch(`/api/storefront/products?slug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProduct(data.product);
        } else {
          setProduct(null);
        }
      })
      .catch((err) => {
        console.error('Error fetching product:', err);
        setProduct(null);
      })
      .finally(() => setLoadingProduct(false));
  }, [slug]);

  // Set default swatches when product loads
  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]?.name || '');
      setSelectedSize(product.sizes[0] || '');
      setActiveImage(0);
    }
  }, [product]);

  // Load live stock levels from API
  useEffect(() => {
    if (!product) return;
    fetch(`/api/stock?productId=${product.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStockList(data.stock || []);
        }
      })
      .catch((err) => console.error('Error fetching stock:', err));
  }, [product]);

  // Calculate stock status dynamically based on real data
  const stockStatus = useMemo(() => {
    if (!selectedSize || !selectedColor) return 'Select color & size';
    const record = stockList.find(s => s.size === selectedSize && s.color === selectedColor);
    if (!record) return '✓ IN STOCK - Ready for dispatch';
    
    const qty = record.quantity;
    if (qty === 0) {
      return '❌ OUT OF STOCK - Sold out';
    }
    if (qty <= 2) {
      return `⚠️ LOW STOCK - Only ${qty} articles remaining`;
    }
    return `✓ IN STOCK - ${qty} articles available`;
  }, [selectedSize, selectedColor, stockList]);

  // Helper to check if a size is out of stock in the currently selected color
  const isSizeOutOfStock = (size: string) => {
    const record = stockList.find(s => s.size === size && s.color === selectedColor);
    return record ? record.quantity <= 0 : false;
  };

  const currentVariantOutOfStock = useMemo(() => {
    if (!selectedSize || !selectedColor) return false;
    const record = stockList.find(s => s.size === selectedSize && s.color === selectedColor);
    return record ? record.quantity <= 0 : false;
  }, [selectedSize, selectedColor, stockList]);

  if (loadingProduct) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', fontFamily: 'var(--font-sans)' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: '#111', marginBottom: '12px' }} />
        <p style={{ fontSize: '0.9rem', color: '#666' }}>Loading garment details...</p>
      </div>
    );
  }

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
                  {product.sizes.map((size) => {
                    const isSoldOut = isSizeOutOfStock(size);
                    return (
                      <button
                        key={size}
                        className={`size-btn ${selectedSize === size ? 'active' : ''} ${isSoldOut ? 'out-of-stock' : ''}`}
                        onClick={() => setSelectedSize(size)}
                        title={isSoldOut ? `${size} is sold out` : undefined}
                      >
                        {size}
                      </button>
                    );
                  })}
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
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={currentVariantOutOfStock}
                >−</button>
                <span className="qty-value">{currentVariantOutOfStock ? 0 : quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={currentVariantOutOfStock}
                >+</button>
              </div>
              <button 
                className={styles.addToCartBtn} 
                onClick={handleAddToCart}
                disabled={currentVariantOutOfStock}
                style={currentVariantOutOfStock ? { backgroundColor: '#777', cursor: 'not-allowed', opacity: 0.6 } : undefined}
              >
                {currentVariantOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
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

        {/* Customer Reviews Section */}
        <section className={styles.reviewsSection}>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', color: '#666' }}>
              <div className="stars" style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= Math.round(comments.reduce((acc, c) => acc + c.rating, 0) / (comments.length || 1)) ? '#c5a880' : 'none'} stroke="#c5a880" strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span>Based on {comments.length} approved reviews</span>
            </div>
          </div>

          <div className={styles.reviewsContainer}>
            {/* Left: Review List */}
            <div className={styles.reviewsList}>
              {comments.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--color-border)', color: '#666', fontSize: '0.9rem', borderRadius: '4px' }}>
                  No reviews yet. Be the first to share your thoughts on this garment!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className={styles.reviewCard}>
                    <div className={styles.reviewCardHeader}>
                      <div>
                        <div className={styles.reviewAuthor}>{comment.customerName}</div>
                        <div className={styles.reviewDate}>
                          {new Date(comment.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                      <div className="stars" style={{ display: 'flex', gap: '2px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= comment.rating ? '#c5a880' : 'none'} stroke="#c5a880" strokeWidth="1.5">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className={styles.reviewContent}>{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Right: Review Form */}
            <div className={styles.reviewFormCard}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px', color: '#111' }}>
                Write a Review
              </h3>

              {commentSuccess && (
                <div className={styles.reviewSuccess}>
                  ✓ Thank you! Your review has been submitted for admin moderation.
                </div>
              )}

              {commentError && (
                <div className={styles.reviewError}>
                  {commentError}
                </div>
              )}

              <form onSubmit={handleCommentSubmit}>
                <div className={styles.formCol}>
                  <label className={styles.formLabel}>Rating</label>
                  <div className={styles.starsSelector}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={styles.starBtn}
                        onClick={() => setCommentRating(star)}
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill={star <= commentRating ? '#c5a880' : 'none'} stroke="#c5a880" strokeWidth="1.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formCol} style={{ marginBottom: 0 }}>
                    <label className={styles.formLabel}>Your Name</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="e.g. John Doe"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      disabled={submittingComment}
                      required
                    />
                  </div>
                  <div className={styles.formCol} style={{ marginBottom: 0 }}>
                    <label className={styles.formLabel}>Email Address</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      placeholder="e.g. john@example.com"
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      disabled={submittingComment}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formCol}>
                  <label className={styles.formLabel}>Review Content</label>
                  <textarea
                    className={styles.formTextarea}
                    placeholder="Share your thoughts about the fabric, sizing, comfort, and general quality..."
                    rows={4}
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    disabled={submittingComment}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={styles.addToCartBtn}
                  style={{ width: '100%', marginTop: '8px' }}
                  disabled={submittingComment}
                >
                  {submittingComment ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>
        </section>

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

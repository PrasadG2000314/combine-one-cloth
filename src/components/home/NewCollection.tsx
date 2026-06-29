'use client';

import { getNewArrivals } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';
import styles from './NewCollection.module.css';
import Link from 'next/link';

export default function NewCollection() {
  const newProducts = getNewArrivals().slice(0, 4);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <Link href="/collections/new-arrivals" className={styles.title}>
            NEW ARRIVALS
          </Link>
          <p className={styles.subtitle}>Curated drop of premium oversized knits and relaxed silhouettes.</p>
        </div>
        <div className={styles.grid}>
          {newProducts.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

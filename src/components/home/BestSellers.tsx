'use client';

import { useState, useRef, useEffect } from 'react';
import { getBestSellers } from '@/data/products';
import ProductCard from '@/components/product/ProductCard';
import styles from './BestSellers.module.css';

const tabs = ['All', 'Tees', 'Denim', 'Bags', 'Accessories'];

export default function BestSellers() {
  const [activeTab, setActiveTab] = useState('All');
  const [isRevealed, setIsRevealed] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const bestSellers = getBestSellers();

  const filtered = activeTab === 'All'
    ? bestSellers
    : bestSellers.filter((p) => p.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <section ref={sectionRef} className={`${styles.section} ${isRevealed ? styles.revealed : ''}`}>
      <div className="container">
        <div className={styles.header}>
          <p className={styles.subheading}>Core 24/7 collection</p>
          <h2 className={styles.title}>BEST SELLERS</h2>
          <p className={styles.description}>Shop some of our hottest products</p>
        </div>

        <div className={styles.tabs}>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {filtered.slice(0, 4).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

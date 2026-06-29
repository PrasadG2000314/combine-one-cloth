'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './CategoryGrid.module.css';

const categories = [
  {
    name: 'Mens',
    href: '/collections/mens',
    image: '/images/category-mens.png',
  },
  {
    name: 'Womens',
    href: '/collections/womens',
    image: '/images/product-womens-tee-1.png',
  },
  {
    name: 'Accessories',
    href: '/collections/accessories',
    image: '/images/product-bag-1.png',
  },
];

export default function CategoryGrid() {
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
      { threshold: 0.15 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          {categories.map((cat, i) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`${styles.tile} ${isRevealed ? styles.revealed : ''}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className={styles.tileImage}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className={styles.tileOverlay} />
              <div className={styles.tileContent}>
                <h3 className={styles.tileName}>{cat.name}</h3>
                <span className={styles.tileLink}>Shop Now</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

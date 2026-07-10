'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './PromoBanner.module.css';

export default function PromoBanner() {
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
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className={`${styles.section} ${isRevealed ? styles.revealed : ''}`}>
      <div className={styles.imageWrapper}>
        <Image
          src="/images/hero-slide-1.png"
          alt="Iron Island Promo"
          fill
          className={styles.image}
          sizes="100vw"
        />
        <div className={styles.overlay} />
      </div>
      <div className={styles.content}>
        <div className={styles.marquee}>
          <div className={styles.marqueeTrack}>
            {Array(6).fill(null).map((_, i) => (
              <span key={i} className={styles.marqueeText}>DRAVEN APPAREL&nbsp;&nbsp;•&nbsp;&nbsp;</span>
            ))}
          </div>
        </div>
        <div className={styles.info}>
          <h2 className={styles.title}>DRAVEN SIGNATURE ARCHIVE</h2>
          <p className={styles.description}>
            Engineered for comfort, structured for style. Discover our heavyweight cotton drops, relaxed fits, and everyday streetwear essentials.
          </p>
          <Link href="/collections/all" className={styles.cta}>Shop the Archive</Link>
        </div>
      </div>
    </section>
  );
}

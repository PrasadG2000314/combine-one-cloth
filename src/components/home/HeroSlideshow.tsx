'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './HeroSlideshow.module.css';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1600&q=80',
    title: 'THE BUBBLE KNIT\nSERIES',
    subtitle: 'Voleee Core Collections',
    description: 'Crafted in heavy-weight 240GSM cotton, our signature bubble knit tees present a relaxed drop-shoulder silhouette.',
    cta: 'Discover Tees',
    href: '/collections/new-arrivals',
  },
  {
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80',
    title: 'TERRAIN LOUNGE\n& JACKETS',
    subtitle: 'New Season Drops',
    description: 'Sophisticated textures and organic color stories designed to capture an effortless premium lifestyle.',
    cta: 'Explore Outerwear',
    href: '/collections/mens',
  },
  {
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=1600&q=80',
    title: 'THE LINEAR SHIRT\nCOLLECTION',
    subtitle: 'Linen & Brushed Cotton',
    description: 'Button-downs built for transitional ease, going seamlessly from daytime business to late-evening lounge contexts.',
    cta: 'Shop Shirts',
    href: '/collections/sale',
  },
];

export default function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 850);
  }, [isTransitioning]);

  useEffect(() => {
    const timer = setInterval(() => {
      goToSlide((current + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [current, goToSlide]);

  return (
    <section className={styles.hero}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.85, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={styles.slide}
        >
          <motion.div
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: 'easeOut' }}
            className={styles.imageContainer}
          >
            <Image
              src={slides[current].image}
              alt={slides[current].title}
              fill
              priority
              className={styles.slideImage}
              sizes="100vw"
            />
          </motion.div>
          
          <div className={styles.overlay} />
          
          <div className={styles.content}>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className={styles.subtitle}
            >
              {slides[current].subtitle}
            </motion.p>
            
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.35 }}
              className={styles.title}
            >
              {slides[current].title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className={styles.description}
            >
              {slides[current].description}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className={styles.ctaWrapper}
            >
              <Link href={slides[current].href} className={styles.cta}>
                {slides[current].cta}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className={styles.dots}>
        {slides.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => goToSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

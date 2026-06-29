export interface Collection {
  name: string;
  slug: string;
  description: string;
  heroImage: string;
}

export const collections: Collection[] = [
  {
    name: 'Mens',
    slug: 'mens',
    description: 'Explore our complete range of menswear essentials.',
    heroImage: '/images/category-mens.png',
  },
  {
    name: 'Womens',
    slug: 'womens',
    description: 'Shop the latest womens collection.',
    heroImage: '/images/product-womens-tee-1.png',
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Complete your look with our range of accessories.',
    heroImage: '/images/product-bag-1.png',
  },
  {
    name: 'Footwear',
    slug: 'footwear',
    description: 'Step up your game with our footwear collection.',
    heroImage: '/images/product-sneakers-1.png',
  },
  {
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Be the first to shop our newest drops.',
    heroImage: '/images/hero-slide-3.png',
  },
  {
    name: 'Sale',
    slug: 'sale',
    description: 'Shop our latest markdowns and deals.',
    heroImage: '/images/product-tee-2.png',
  },
  {
    name: 'Printed Tees',
    slug: 'printed-tees',
    description: 'Express yourself with our range of printed tees.',
    heroImage: '/images/product-tee-1.png',
  },
];

export function getCollectionBySlug(slug: string): Collection | undefined {
  return collections.find((c) => c.slug === slug);
}

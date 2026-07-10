import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { readProductsCatalog, writeProductsCatalog, readStock, writeStock, StockRecord } from '@/lib/db';
import { Product } from '@/data/products';

function isAuthenticated(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenMatch = cookieHeader.match(/admin_session=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;
  return validateSession(token);
}

// GET - Retrieve all products for admin
export async function GET(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const products = readProductsCatalog();
    return NextResponse.json({ success: true, products }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// POST - Add a new product (and auto-seed stock)
export async function POST(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const productData = await request.json() as Product;
    
    if (!productData.name || !productData.price || !productData.category) {
      return NextResponse.json({ success: false, message: 'Name, price and category are required.' }, { status: 400 });
    }

    const catalog = readProductsCatalog();

    // Check slug uniqueness
    const slug = productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const exists = catalog.some(p => p.slug === slug || p.id === productData.id);
    if (exists) {
      return NextResponse.json({ success: false, message: 'Product ID or Slug already exists.' }, { status: 400 });
    }

    const newId = productData.id || String(catalog.length + 1);

    const newProduct: Product = {
      id: newId,
      name: productData.name,
      slug: slug,
      price: Number(productData.price),
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
      images: productData.images && productData.images.length > 0 ? productData.images : ['/images/product-tee-1.png'],
      colors: productData.colors || [{ name: 'Black', hex: '#111111' }],
      sizes: productData.sizes || ['S', 'M', 'L', 'XL'],
      category: productData.category,
      collection: productData.collection || ['new-arrivals'],
      description: productData.description || '',
      reviews: 0,
      rating: 5.0,
      isNew: true
    };

    // Save to products catalog
    catalog.push(newProduct);
    writeProductsCatalog(catalog);

    // Auto-seed stock levels for new color/size variations
    const stockList = readStock();
    for (const color of newProduct.colors) {
      for (const size of newProduct.sizes) {
        stockList.push({
          productId: newProduct.id,
          color: color.name,
          size: size,
          quantity: 10 // Default starting stock
        });
      }
    }
    writeStock(stockList);

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    console.error('Error adding product:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// PATCH - Edit product details
export async function PATCH(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const editData = await request.json();
    const { id, name, price, originalPrice, description, category, collection, colors, sizes } = editData;

    if (!id) {
      return NextResponse.json({ success: false, message: 'Product ID is required.' }, { status: 400 });
    }

    const catalog = readProductsCatalog();
    const idx = catalog.findIndex(p => p.id === id);

    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    const existingProduct = catalog[idx];

    // Update properties
    if (name) existingProduct.name = name;
    if (price !== undefined) existingProduct.price = Number(price);
    if (originalPrice !== undefined) existingProduct.originalPrice = originalPrice ? Number(originalPrice) : undefined;
    if (description) existingProduct.description = description;
    if (category) existingProduct.category = category;
    if (collection) existingProduct.collection = collection;

    // Handle variation updates and adjust stock DB accordingly
    const oldColors = [...existingProduct.colors];
    const oldSizes = [...existingProduct.sizes];

    if (colors) existingProduct.colors = colors;
    if (sizes) existingProduct.sizes = sizes;

    writeProductsCatalog(catalog);

    // Seeding any newly added color/size configurations to the stock database
    if (colors || sizes) {
      const stockList = readStock();
      const updatedProduct = catalog[idx];

      for (const col of updatedProduct.colors) {
        for (const sz of updatedProduct.sizes) {
          const hasRecord = stockList.some(s => s.productId === id && s.color === col.name && s.size === sz);
          if (!hasRecord) {
            stockList.push({
              productId: id,
              color: col.name,
              size: sz,
              quantity: 10 // Starting quantity for new variation
            });
          }
        }
      }
      writeStock(stockList);
    }

    return NextResponse.json({ success: true, product: catalog[idx] }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

// DELETE - Remove product from catalog and delete stock
export async function DELETE(request: Request) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Missing product ID.' }, { status: 400 });
    }

    const catalog = readProductsCatalog();
    const idx = catalog.findIndex(p => p.id === id);

    if (idx === -1) {
      return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    }

    catalog.splice(idx, 1);
    writeProductsCatalog(catalog);

    // Clean up associated stock records
    const stockList = readStock();
    const cleanedStock = stockList.filter(s => s.productId !== id);
    writeStock(cleanedStock);

    return NextResponse.json({ success: true, message: 'Product deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

import fs from 'fs';
import path from 'path';
import { products, Product } from '@/data/products';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
  image: string;
}

export interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
  };
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  status: 'Pending' | 'Confirmed' | 'Rejected';
  createdAt: string;
}

export interface AdminConfig {
  username: string;
  passwordHash: string;
  salt: string;
}

export interface StockRecord {
  productId: string;
  color: string;
  size: string;
  quantity: number;
}

export interface ProductComment {
  id: string;
  productId: string;
  customerName: string;
  email: string;
  rating: number;
  content: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders_db.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin_config.json');
const STOCK_FILE = path.join(DATA_DIR, 'stock_db.json');
const PRODUCTS_CATALOG_FILE = path.join(DATA_DIR, 'products_db.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments_db.json');

// Ensure directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Order Database Operations
export function readOrders(): Order[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
    return JSON.parse(data) as Order[];
  } catch (error) {
    console.error('Error reading orders database:', error);
    return [];
  }
}

export function writeOrders(orders: Order[]): boolean {
  ensureDataDir();
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing orders database:', error);
    return false;
  }
}

// Admin Config Database Operations
export function readAdminConfig(): AdminConfig | null {
  ensureDataDir();
  try {
    if (!fs.existsSync(ADMIN_FILE)) {
      return null;
    }
    const data = fs.readFileSync(ADMIN_FILE, 'utf-8');
    return JSON.parse(data) as AdminConfig;
  } catch (error) {
    console.error('Error reading admin config:', error);
    return null;
  }
}

export function writeAdminConfig(config: AdminConfig): boolean {
  ensureDataDir();
  try {
    fs.writeFileSync(ADMIN_FILE, JSON.stringify(config, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing admin config:', error);
    return false;
  }
}

// Stock Database Operations
export function readStock(): StockRecord[] {
  ensureDataDir();
  try {
    const catalog = readProductsCatalog();
    if (!fs.existsSync(STOCK_FILE)) {
      // Auto-initialize stock database from catalog
      const initialStock: StockRecord[] = [];
      for (const p of catalog) {
        for (const col of p.colors) {
          for (const sz of p.sizes) {
            let quantity = 10;
            // Set XXL, 36, or ONE SIZE to 0 (Out of Stock) for demo
            if (sz === 'XXL' || sz === '36' || sz === 'ONE SIZE') {
              quantity = 0;
            } else if (sz === 'S' || sz === '28') {
              quantity = 2; // Low Stock
            }
            initialStock.push({
              productId: p.id,
              color: col.name,
              size: sz,
              quantity
            });
          }
        }
      }
      fs.writeFileSync(STOCK_FILE, JSON.stringify(initialStock, null, 2), 'utf-8');
      return initialStock;
    }
    const data = fs.readFileSync(STOCK_FILE, 'utf-8');
    return JSON.parse(data) as StockRecord[];
  } catch (error) {
    console.error('Error reading stock database:', error);
    return [];
  }
}

export function writeStock(stock: StockRecord[]): boolean {
  ensureDataDir();
  try {
    fs.writeFileSync(STOCK_FILE, JSON.stringify(stock, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing stock database:', error);
    return false;
  }
}

// Products Catalog Database Operations
export function readProductsCatalog(): Product[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(PRODUCTS_CATALOG_FILE)) {
      // Seed from original static list
      fs.writeFileSync(PRODUCTS_CATALOG_FILE, JSON.stringify(products, null, 2), 'utf-8');
      return products;
    }
    const data = fs.readFileSync(PRODUCTS_CATALOG_FILE, 'utf-8');
    return JSON.parse(data) as Product[];
  } catch (error) {
    console.error('Error reading products catalog database:', error);
    return [];
  }
}

export function writeProductsCatalog(items: Product[]): boolean {
  ensureDataDir();
  try {
    fs.writeFileSync(PRODUCTS_CATALOG_FILE, JSON.stringify(items, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing products catalog database:', error);
    return false;
  }
}

// Comments / Review Database Operations
export function readComments(): ProductComment[] {
  ensureDataDir();
  try {
    if (!fs.existsSync(COMMENTS_FILE)) {
      const initialComments: ProductComment[] = [
        {
          id: "cmt-1",
          productId: "1",
          customerName: "Nipuna Perera",
          email: "nipun@example.com",
          rating: 5,
          content: "Absolutely amazing fit and heavy heavyweight material. Exactly the luxury streetwear aesthetic I was looking for! Highly recommended.",
          status: "Approved",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "cmt-2",
          productId: "1",
          customerName: "Dilshan K.",
          email: "dilshan@example.com",
          rating: 4,
          content: "Nice material, color is very rich. Slightly larger than expected so size down if you want a regular fit.",
          status: "Approved",
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "cmt-3",
          productId: "3",
          customerName: "Malith Fernando",
          email: "malith@example.com",
          rating: 5,
          content: "Perfect wide leg denim. Beautiful wash details. Perfect matching with graphic tees.",
          status: "Approved",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      fs.writeFileSync(COMMENTS_FILE, JSON.stringify(initialComments, null, 2), 'utf-8');
      return initialComments;
    }
    const data = fs.readFileSync(COMMENTS_FILE, 'utf-8');
    return JSON.parse(data) as ProductComment[];
  } catch (error) {
    console.error('Error reading comments database:', error);
    return [];
  }
}

export function writeComments(comments: ProductComment[]): boolean {
  ensureDataDir();
  try {
    fs.writeFileSync(COMMENTS_FILE, JSON.stringify(comments, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error writing comments database:', error);
    return false;
  }
}

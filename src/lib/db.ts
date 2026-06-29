import fs from 'fs';
import path from 'path';

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

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders_db.json');
const ADMIN_FILE = path.join(DATA_DIR, 'admin_config.json');

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

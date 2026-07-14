export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  specs: { label: string; value: string }[];
  features: string[];
  badge?: 'new' | 'sale' | 'trending';
  inStock: boolean;
  artisan?: string;
  region?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  paymentMethod: string;
}

export interface WholesaleInquiry {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  products: string[];
  quantity: string;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  date: string;
}

export const CATEGORIES = [
  'Guitars',
  'Traditional Instruments',
  'Keyboards',
  'Percussion',
  'String Instruments',
  'Wind Instruments',
  'Accessories',
  'Wholesale',
  'Deals',
] as const;

export type Category = (typeof CATEGORIES)[number];

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
  stock_quantity: number;
  low_stock_threshold: number;
  variants: { name: string; options: string[] }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface Order {
  id: string;
  user_id?: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  status: 'Placed' | 'Confirmed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  date: string;
  paymentMethod: string;
  coupon_code?: string;
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

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  badge_en?: string;
  badge_ne?: string;
  headline_en?: string;
  headline_ne?: string;
  subcopy_en?: string;
  subcopy_ne?: string;
  discount_percent?: number | null;
  button_text_en?: string;
  button_text_ne?: string;
  button_link?: string;
  image_url?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  enabled: boolean;
  display_order: number;
  created_at?: string;
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


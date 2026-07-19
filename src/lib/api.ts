import { supabase } from './supabase';
import type { Product, Order, WholesaleInquiry, Review } from '../types';

// Helper to map DB Product to Frontend Product
export function mapDbProduct(p: any): Product {
  if (!p) throw new Error('Invalid product data');
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    subcategory: p.subcategory || undefined,
    price: Number(p.price),
    originalPrice: p.original_price ? Number(p.original_price) : undefined,
    rating: Number(p.rating),
    reviewCount: p.review_count || 0,
    images: p.images || [],
    description: p.description,
    specs: Array.isArray(p.specs) ? p.specs : [],
    features: p.features || [],
    badge: p.badge || undefined,
    inStock: p.in_stock,
    artisan: p.artisan || undefined,
    region: p.region || undefined,
    stock_quantity: p.stock_quantity || 0,
    low_stock_threshold: p.low_stock_threshold || 0,
    variants: Array.isArray(p.variants) ? p.variants : [],
  };
}

// Helper to map DB Order to Frontend Order
export function mapDbOrder(o: any): Order {
  return {
    id: o.id,
    user_id: o.user_id || undefined,
    customerName: o.customer_name,
    email: o.email,
    phone: o.phone,
    address: o.address,
    total: Number(o.total),
    status: o.status,
    date: o.created_at || new Date().toISOString(),
    paymentMethod: o.payment_method,
    items: (o.order_items || []).map((item: any) => ({
      product: mapDbProduct(item.products),
      quantity: item.quantity,
      selectedVariant: item.variant || undefined,
    })),
    coupon_code: o.coupon_code || undefined,
  };
}

// Helper to map DB Inquiry to Frontend Inquiry
export function mapDbInquiry(i: any): WholesaleInquiry {
  return {
    id: i.id,
    businessName: i.business_name,
    contactName: i.contact_name,
    email: i.email,
    phone: i.phone,
    city: i.city,
    products: i.products || [],
    quantity: i.quantity,
    message: i.message,
    status: i.status,
    date: i.created_at ? new Date(i.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

// Helper to map DB Review to Frontend Review
export function mapDbReview(r: any): Review {
  return {
    id: r.id,
    product_id: r.product_id,
    user_id: r.user_id,
    user_name: r.user_name,
    rating: r.rating,
    comment: r.comment,
    date: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

// PRODUCTS API
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbProduct);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapDbProduct(data) : null;
}

export async function createProduct(product: Omit<Product, 'id' | 'rating' | 'reviewCount'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: product.name,
      slug: product.slug,
      category: product.category,
      subcategory: product.subcategory || null,
      price: product.price,
      original_price: product.originalPrice || null,
      images: product.images,
      description: product.description,
      specs: product.specs,
      features: product.features,
      badge: product.badge || null,
      in_stock: product.inStock,
      artisan: product.artisan || null,
      region: product.region || null,
      stock_quantity: product.stock_quantity,
      low_stock_threshold: product.low_stock_threshold,
      variants: product.variants,
    }])
    .select()
    .single();

  if (error) throw error;
  return mapDbProduct(data);
}

export async function updateProduct(id: string, product: Partial<Product>): Promise<Product> {
  const updates: any = {};
  if (product.name !== undefined) updates.name = product.name;
  if (product.slug !== undefined) updates.slug = product.slug;
  if (product.category !== undefined) updates.category = product.category;
  if (product.subcategory !== undefined) updates.subcategory = product.subcategory || null;
  if (product.price !== undefined) updates.price = product.price;
  if (product.originalPrice !== undefined) updates.original_price = product.originalPrice || null;
  if (product.images !== undefined) updates.images = product.images;
  if (product.description !== undefined) updates.description = product.description;
  if (product.specs !== undefined) updates.specs = product.specs;
  if (product.features !== undefined) updates.features = product.features;
  if (product.badge !== undefined) updates.badge = product.badge || null;
  if (product.inStock !== undefined) updates.in_stock = product.inStock;
  if (product.artisan !== undefined) updates.artisan = product.artisan || null;
  if (product.region !== undefined) updates.region = product.region || null;
  if (product.stock_quantity !== undefined) updates.stock_quantity = product.stock_quantity;
  if (product.low_stock_threshold !== undefined) updates.low_stock_threshold = product.low_stock_threshold;
  if (product.variants !== undefined) updates.variants = product.variants;

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapDbProduct(data);
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// STORAGE API (IMAGE UPLOAD)
export async function uploadProductImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
  const filePath = `products/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// ORDERS API
export async function fetchOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbOrder);
}

export async function fetchUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbOrder);
}

export async function createOrder(order: Omit<Order, 'id' | 'date'>): Promise<Order> {
  const orderId = `#MCN-${Date.now().toString().slice(-6)}`;

  const { error: orderError } = await supabase
    .from('orders')
    .insert([{
      id: orderId,
      user_id: order.user_id || null,
      customer_name: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      total: order.total,
      status: 'Placed',
      payment_method: order.paymentMethod,
      coupon_code: order.coupon_code || null,
    }]);

  if (orderError) throw orderError;

  const itemsToInsert = order.items.map((item) => ({
    order_id: orderId,
    product_id: item.product.id,
    quantity: item.quantity,
    price_at_time: item.product.price,
    variant: item.selectedVariant || null,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsError) throw itemsError;

  // Fetch fully joined order to return
  const { data: fullOrder, error: fetchError } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('id', orderId)
    .single();

  if (fetchError) throw fetchError;
  return mapDbOrder(fullOrder);
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

// WHOLESALE INQUIRIES API
export async function fetchInquiries(): Promise<WholesaleInquiry[]> {
  const { data, error } = await supabase
    .from('wholesale_inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbInquiry);
}

export async function createInquiry(inquiry: Omit<WholesaleInquiry, 'id' | 'date' | 'status'>): Promise<WholesaleInquiry> {
  const inquiryId = `WI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const { data, error } = await supabase
    .from('wholesale_inquiries')
    .insert([{
      id: inquiryId,
      business_name: inquiry.businessName,
      contact_name: inquiry.contactName,
      email: inquiry.email,
      phone: inquiry.phone,
      city: inquiry.city,
      products: inquiry.products,
      quantity: inquiry.quantity,
      message: inquiry.message,
      status: 'new',
    }])
    .select()
    .single();

  if (error) throw error;
  return mapDbInquiry(data);
}

export async function updateInquiryStatus(id: string, status: WholesaleInquiry['status']): Promise<void> {
  const { error } = await supabase
    .from('wholesale_inquiries')
    .update({ status })
    .eq('id', id);

  if (error) throw error;
}

// REVIEWS API
export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbReview);
}

export async function createReview(review: Omit<Review, 'id' | 'date'>): Promise<Review> {
  const { data, error } = await supabase
    .from('reviews')
    .insert([{
      product_id: review.product_id,
      user_id: review.user_id,
      user_name: review.user_name,
      rating: review.rating,
      comment: review.comment,
    }])
    .select()
    .single();

  if (error) throw error;
  return mapDbReview(data);
}

// SITE CONTENT (CMS-LITE) API
export async function fetchSiteContent(key: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error) throw error;
  return data ? data.value : null;
}

export async function updateSiteContent(key: string, value: any): Promise<void> {
  const { error } = await supabase
    .from('site_content')
    .upsert({ key, value });

  if (error) throw error;
}

// COUPONS API
export async function fetchCoupons(): Promise<any[]> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function createCoupon(coupon: {
  code: string;
  discount_type: 'percent' | 'flat';
  discount_value: number;
  expiry_date: string;
  active: boolean;
  usage_limit?: number;
}): Promise<any> {
  const { data, error } = await supabase
    .from('coupons')
    .insert([{
      code: coupon.code.toUpperCase(),
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      expiry_date: coupon.expiry_date,
      active: coupon.active,
      usage_limit: coupon.usage_limit || null,
      used_count: 0
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCoupon(code: string, coupon: Partial<{
  discount_type: 'percent' | 'flat';
  discount_value: number;
  expiry_date: string;
  active: boolean;
  usage_limit: number | null;
}>): Promise<any> {
  const { data, error } = await supabase
    .from('coupons')
    .update(coupon)
    .eq('code', code.toUpperCase())
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCoupon(code: string): Promise<void> {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('code', code.toUpperCase());

  if (error) throw error;
}

export async function validateCoupon(code: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('active', true)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  // Check expiry
  const expiry = new Date(data.expiry_date);
  const now = new Date();
  // Strip time for clean date-only comparison
  expiry.setHours(23, 59, 59, 999);
  if (now > expiry) return null;

  // Check usage limit
  if (data.usage_limit !== null && data.used_count >= data.usage_limit) return null;

  return data;
}

export async function incrementCouponUsage(code: string): Promise<void> {
  // Directly fetch, increment and update. RLS checks are handled.
  const { data, error: fetchError } = await supabase
    .from('coupons')
    .select('used_count')
    .eq('code', code.toUpperCase())
    .single();
    
  if (fetchError) throw fetchError;
  
  const { error: updateError } = await supabase
    .from('coupons')
    .update({ used_count: (data.used_count || 0) + 1 })
    .eq('code', code.toUpperCase());
    
  if (updateError) throw updateError;
}

// PUSH SUBSCRIPTIONS API
export async function createPushSubscription(userId: string | null, subscriptionJson: any): Promise<void> {
  const { error } = await supabase
    .from('push_subscriptions')
    .insert([{
      user_id: userId,
      subscription_json: subscriptionJson
    }]);

  if (error) throw error;
}

export async function fetchPushSubscriptions(): Promise<any[]> {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('*');

  if (error) throw error;
  return data || [];
}

// SPECIFIC ORDER & CANCEL API
export async function fetchOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapDbOrder(data) : null;
}

export async function cancelOrder(id: string): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'Cancelled' })
    .eq('id', id);

  if (error) throw error;
}


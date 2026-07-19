import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Mail,
  Settings,
  LogOut,
  DollarSign,
  Users,
  Music,
  Menu,
  ChevronRight,
  Trash2,
  Edit,
  X,
  Upload,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchProducts,
  fetchOrders,
  fetchInquiries,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  updateOrderStatus,
  updateInquiryStatus,
} from '../lib/api';
import { CATEGORIES } from '../types';
import type { Product, Order, WholesaleInquiry } from '../types';

type AdminTab = 'overview' | 'products' | 'orders' | 'inquiries' | 'settings';

const STATUS_COLORS: Record<string, string> = {
  // Orders
  Placed: 'bg-yellow-100 text-yellow-700',
  Confirmed: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  'Out for Delivery': 'bg-indigo-100 text-indigo-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  // Wholesale Inquiries
  new: 'bg-mcn-mint/20 text-mcn-mint-dark',
  contacted: 'bg-mcn-blue-light/10 text-mcn-blue',
  closed: 'bg-gray-100 text-gray-600',
};

export default function Admin() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Live Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inquiries, setInquiries] = useState<WholesaleInquiry[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form & CRUD States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [formFields, setFormFields] = useState({
    name: '',
    slug: '',
    category: 'Guitars',
    subcategory: '',
    price: 0,
    originalPrice: 0,
    description: '',
    badge: '' as 'new' | 'sale' | 'trending' | '',
    artisan: '',
    region: '',
    stock_quantity: 0,
    low_stock_threshold: 5,
    specs: [] as { label: string; value: string }[],
    features: [] as string[],
    variants: [] as { name: string; options: string[] }[],
    images: [] as string[],
  });

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [prodData, ordData, inqData] = await Promise.all([
        fetchProducts(),
        fetchOrders(),
        fetchInquiries(),
      ]);
      setProducts(prodData);
      setOrders(ordData);
      setInquiries(inqData);
    } catch (err) {
      console.error('Error fetching admin dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user || !user.isAdmin) {
        navigate('/login');
      } else {
        loadAllData();
      }
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-mcn-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-mcn-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-mcn-gray-500 font-bold">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) return null;

  // Overview calculations
  const totalRevenue = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'Placed' || o.status === 'Confirmed' || o.status === 'Shipped').length;
  const newInquiries = inquiries.filter((i) => i.status === 'new').length;

  // CRUD Operations
  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setFormFields({
      name: '',
      slug: '',
      category: 'Guitars',
      subcategory: '',
      price: 0,
      originalPrice: 0,
      description: '',
      badge: '',
      artisan: '',
      region: '',
      stock_quantity: 10,
      low_stock_threshold: 3,
      specs: [],
      features: [],
      variants: [],
      images: [],
    });
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setFormFields({
      name: prod.name,
      slug: prod.slug,
      category: prod.category,
      subcategory: prod.subcategory || '',
      price: prod.price,
      originalPrice: prod.originalPrice || 0,
      description: prod.description,
      badge: prod.badge || '',
      artisan: prod.artisan || '',
      region: prod.region || '',
      stock_quantity: prod.stock_quantity,
      low_stock_threshold: prod.low_stock_threshold,
      specs: [...prod.specs],
      features: [...prod.features],
      variants: [...prod.variants],
      images: [...prod.images],
    });
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        console.error('Failed to delete product:', err);
        alert('Failed to delete product.');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setImageUploading(true);
    try {
      const urls: string[] = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const url = await uploadProductImage(e.target.files[i]);
        urls.push(url);
      }
      setFormFields((prev) => ({
        ...prev,
        images: [...prev.images, ...urls],
      }));
    } catch (err) {
      console.error('Failed to upload images:', err);
      alert('Failed to upload image(s). Make sure you have created the "product-images" bucket in your storage dashboard.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleMoveImage = (idx: number, direction: 'left' | 'right') => {
    const images = [...formFields.images];
    if (direction === 'left' && idx > 0) {
      const temp = images[idx];
      images[idx] = images[idx - 1];
      images[idx - 1] = temp;
    } else if (direction === 'right' && idx < images.length - 1) {
      const temp = images[idx];
      images[idx] = images[idx + 1];
      images[idx + 1] = temp;
    }
    setFormFields((prev) => ({ ...prev, images }));
  };

  const handleRemoveImage = (idx: number) => {
    setFormFields((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFields.name || !formFields.slug) {
      alert('Product name and slug are required.');
      return;
    }
    if (formFields.images.length === 0) {
      alert('Please upload at least one image.');
      return;
    }

    const cleanedFields = {
      ...formFields,
      price: Number(formFields.price),
      originalPrice: formFields.originalPrice ? Number(formFields.originalPrice) : undefined,
      stock_quantity: Number(formFields.stock_quantity),
      low_stock_threshold: Number(formFields.low_stock_threshold),
      badge: formFields.badge ? (formFields.badge as any) : undefined,
      inStock: Number(formFields.stock_quantity) > 0,
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, cleanedFields);
      } else {
        await createProduct(cleanedFields);
      }
      setIsFormOpen(false);
      loadAllData();
    } catch (err: any) {
      console.error('Error saving product:', err);
      alert(`Error saving product: ${err.message || 'Unknown error'}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Failed to update order status.');
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId: string, status: WholesaleInquiry['status']) => {
    try {
      await updateInquiryStatus(inquiryId, status);
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiryId ? { ...i, status } : i))
      );
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
      alert('Failed to update inquiry status.');
    }
  };

  const NAV_ITEMS = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'products' as AdminTab, label: 'Products', icon: Package },
    { id: 'orders' as AdminTab, label: 'Orders', icon: ShoppingCart },
    { id: 'inquiries' as AdminTab, label: 'Wholesale Inquiries', icon: Mail },
    { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-mcn-blue rounded-lg flex items-center justify-center">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="block text-lg font-extrabold text-white leading-none">Music Craft</span>
            <span className="block text-xs font-semibold text-mcn-blue leading-none mt-0.5">ADMIN PANEL</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSidebarOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-colors ${
              activeTab === item.id
                ? 'bg-mcn-blue text-white'
                : 'text-mcn-gray-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
            {item.id === 'orders' && pendingOrders > 0 && (
              <span className="ml-auto bg-mcn-red text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingOrders}
              </span>
            )}
            {item.id === 'inquiries' && newInquiries > 0 && (
              <span className="ml-auto bg-mcn-mint text-mcn-dark text-xs font-bold px-2 py-0.5 rounded-full">
                {newInquiries}
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4 px-4">
          <div className="w-10 h-10 rounded-full bg-mcn-blue flex items-center justify-center text-white font-bold uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{user.name}</p>
            <p className="text-xs text-mcn-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-mcn-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-mcn-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 bg-mcn-dark fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-mcn-dark">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="bg-white border-b border-mcn-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-mcn-charcoal"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h1 className="text-lg font-extrabold text-mcn-charcoal capitalize">{activeTab}</h1>
            </div>
            <button
              onClick={loadAllData}
              className="text-xs text-mcn-blue font-bold border border-mcn-blue px-3 py-1.5 rounded-lg hover:bg-mcn-blue hover:text-white transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </header>

        {loadingData ? (
          <div className="p-8 text-center py-24">
            <div className="w-10 h-10 border-4 border-mcn-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-bold text-mcn-gray-500">Syncing with database...</p>
          </div>
        ) : (
          <main className="p-4 lg:p-8">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: DollarSign, label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, color: 'bg-mcn-mint/10 text-mcn-mint-dark' },
                    { icon: ShoppingCart, label: 'Pending Orders', value: pendingOrders, color: 'bg-mcn-blue/10 text-mcn-blue' },
                    { icon: Package, label: 'Products Listed', value: products.length, color: 'bg-purple-100 text-purple-600' },
                    { icon: Users, label: 'Wholesale Inquiries', value: inquiries.length, color: 'bg-orange-100 text-orange-600' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl border border-mcn-gray-200 p-5">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                      <p className="text-2xl font-extrabold text-mcn-charcoal">{stat.value}</p>
                      <p className="text-xs text-mcn-gray-500 font-semibold mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent orders */}
                <div className="bg-white rounded-xl border border-mcn-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-mcn-gray-200">
                    <h2 className="text-base font-extrabold text-mcn-charcoal">Recent Orders</h2>
                    <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-mcn-blue hover:underline">
                      View All
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-mcn-gray-50 text-xs font-bold text-mcn-gray-500 uppercase tracking-wide">
                          <th className="text-left px-5 py-3">Order ID</th>
                          <th className="text-left px-5 py-3">Customer</th>
                          <th className="text-left px-5 py-3 hidden md:table-cell">Date</th>
                          <th className="text-left px-5 py-3">Total</th>
                          <th className="text-left px-5 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="border-t border-mcn-gray-100 hover:bg-mcn-gray-50 transition-colors">
                            <td className="px-5 py-3 text-sm font-bold text-mcn-charcoal">{order.id}</td>
                            <td className="px-5 py-3 text-sm text-mcn-gray-600">{order.customerName}</td>
                            <td className="px-5 py-3 text-sm text-mcn-gray-500 hidden md:table-cell">{order.date}</td>
                            <td className="px-5 py-3 text-sm font-bold text-mcn-charcoal">Rs. {order.total.toLocaleString()}</td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent inquiries */}
                <div className="bg-white rounded-xl border border-mcn-gray-200 overflow-hidden">
                  <div className="flex items-center justify-between p-5 border-b border-mcn-gray-200">
                    <h2 className="text-base font-extrabold text-mcn-charcoal">Recent Wholesale Inquiries</h2>
                    <button onClick={() => setActiveTab('inquiries')} className="text-sm font-bold text-mcn-blue hover:underline">
                      View All
                    </button>
                  </div>
                  <div className="divide-y divide-mcn-gray-100">
                    {inquiries.slice(0, 3).map((inquiry) => (
                      <div key={inquiry.id} className="p-5 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-mcn-blue/10 flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5 text-mcn-blue" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-mcn-charcoal">{inquiry.businessName}</p>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${STATUS_COLORS[inquiry.status]}`}>
                              {inquiry.status}
                            </span>
                          </div>
                          <p className="text-xs text-mcn-gray-500">{inquiry.contactName} - {inquiry.city}</p>
                          <p className="text-xs text-mcn-gray-400 mt-1 line-clamp-1">{inquiry.message}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-mcn-gray-300 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Products CRUD Section */}
            {activeTab === 'products' && (
              <div className="bg-white rounded-xl border border-mcn-gray-200 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-mcn-gray-200">
                  <h2 className="text-base font-extrabold text-mcn-charcoal">All Products ({products.length})</h2>
                  <button
                    onClick={handleOpenAddForm}
                    className="px-4 py-2 bg-mcn-blue text-white text-sm font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
                  >
                    + Add Product
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-mcn-gray-50 text-xs font-bold text-mcn-gray-500 uppercase tracking-wide">
                        <th className="text-left px-5 py-3">Product</th>
                        <th className="text-left px-5 py-3 hidden md:table-cell">Category</th>
                        <th className="text-left px-5 py-3">Price</th>
                        <th className="text-left px-5 py-3 hidden lg:table-cell">Stock Level</th>
                        <th className="text-left px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => {
                        const lowStock = product.stock_quantity <= product.low_stock_threshold;
                        return (
                          <tr key={product.id} className="border-t border-mcn-gray-100 hover:bg-mcn-gray-50 transition-colors">
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <img
                                  src={product.images[0] || 'https://via.placeholder.com/40'}
                                  alt={product.name}
                                  className="w-10 h-10 rounded-lg object-cover bg-mcn-gray-100"
                                />
                                <span className="text-sm font-bold text-mcn-charcoal line-clamp-1">{product.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-sm text-mcn-gray-600 hidden md:table-cell">{product.category}</td>
                            <td className="px-5 py-3 text-sm font-bold text-mcn-charcoal">Rs. {product.price.toLocaleString()}</td>
                            <td className="px-5 py-3 hidden lg:table-cell">
                              <div className="flex flex-col">
                                <span className={`text-xs font-extrabold ${lowStock ? 'text-mcn-red' : 'text-mcn-mint-dark'}`}>
                                  {product.stock_quantity} units
                                </span>
                                {lowStock && (
                                  <span className="text-[10px] text-mcn-red font-semibold uppercase">Low Stock Alert</span>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => handleOpenEditForm(product)}
                                  className="text-mcn-blue hover:text-mcn-blue-dark transition-colors"
                                  aria-label="Edit product"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="text-mcn-red hover:text-red-700 transition-colors"
                                  aria-label="Delete product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Orders Section */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl border border-mcn-gray-200 overflow-hidden">
                <div className="p-5 border-b border-mcn-gray-200">
                  <h2 className="text-base font-extrabold text-mcn-charcoal">All Orders ({orders.length})</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-mcn-gray-50 text-xs font-bold text-mcn-gray-500 uppercase tracking-wide">
                        <th className="text-left px-5 py-3">Order ID</th>
                        <th className="text-left px-5 py-3">Customer</th>
                        <th className="text-left px-5 py-3 hidden md:table-cell">Items</th>
                        <th className="text-left px-5 py-3 hidden lg:table-cell">Date</th>
                        <th className="text-left px-5 py-3">Total</th>
                        <th className="text-left px-5 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-t border-mcn-gray-100 hover:bg-mcn-gray-50 transition-colors">
                          <td className="px-5 py-3 text-sm font-bold text-mcn-charcoal">{order.id}</td>
                          <td className="px-5 py-3">
                            <p className="text-sm font-bold text-mcn-charcoal">{order.customerName}</p>
                            <p className="text-xs text-mcn-gray-500">{order.email}</p>
                          </td>
                          <td className="px-5 py-3 text-sm text-mcn-gray-600 hidden md:table-cell">
                            {order.items.length} item(s)
                          </td>
                          <td className="px-5 py-3 text-sm text-mcn-gray-500 hidden lg:table-cell">{order.date}</td>
                          <td className="px-5 py-3 text-sm font-bold text-mcn-charcoal">Rs. {order.total.toLocaleString()}</td>
                          <td className="px-5 py-3">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                              className={`text-xs font-bold px-2 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'} focus:outline-none`}
                            >
                              <option value="Placed">Placed</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Out for Delivery">Out for Delivery</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Wholesale Inquiries Section */}
            {activeTab === 'inquiries' && (
              <div className="space-y-4">
                {inquiries.map((inquiry) => (
                  <div key={inquiry.id} className="bg-white rounded-xl border border-mcn-gray-200 p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-extrabold text-mcn-charcoal">{inquiry.businessName}</h3>
                          <select
                            value={inquiry.status}
                            onChange={(e) => handleUpdateInquiryStatus(inquiry.id, e.target.value as any)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[inquiry.status] || 'bg-gray-100 text-gray-700'} focus:outline-none`}
                          >
                            <option value="new">new</option>
                            <option value="contacted">contacted</option>
                            <option value="closed">closed</option>
                          </select>
                        </div>
                        <p className="text-xs text-mcn-gray-500">
                          {inquiry.id} - {inquiry.date}
                        </p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs font-bold text-mcn-gray-500 uppercase">Contact</p>
                        <p className="text-sm text-mcn-charcoal">{inquiry.contactName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-mcn-gray-500 uppercase">Phone</p>
                        <p className="text-sm text-mcn-charcoal">{inquiry.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-mcn-gray-500 uppercase">Email</p>
                        <p className="text-sm text-mcn-charcoal">{inquiry.email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-mcn-gray-500 uppercase">City</p>
                        <p className="text-sm text-mcn-charcoal">{inquiry.city}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs font-bold text-mcn-gray-500 uppercase mb-1">Products</p>
                      <div className="flex flex-wrap gap-2">
                        {inquiry.products.map((p) => (
                          <span key={p} className="text-xs font-semibold bg-mcn-gray-100 text-mcn-gray-600 px-2.5 py-1 rounded-full">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-xs font-bold text-mcn-gray-500 uppercase mb-1">Quantity</p>
                      <p className="text-sm text-mcn-charcoal">{inquiry.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-mcn-gray-500 uppercase mb-1">Message</p>
                      <p className="text-sm text-mcn-gray-600">{inquiry.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="max-w-2xl space-y-6">
                <div className="bg-white rounded-xl border border-mcn-gray-200 p-6">
                  <h2 className="text-lg font-extrabold text-mcn-charcoal mb-4">Store Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-mcn-charcoal mb-1">Store Name</label>
                      <input
                        type="text"
                        defaultValue="Music Craft Nepal"
                        className="w-full h-11 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-mcn-charcoal mb-1">Contact Email</label>
                      <input
                        type="email"
                        defaultValue="hello@musiccraftnepal.com"
                        className="w-full h-11 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-mcn-charcoal mb-1">Phone</label>
                      <input
                        type="tel"
                        defaultValue="01-4123456"
                        className="w-full h-11 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-mcn-charcoal mb-1">Free Shipping Threshold (Rs.)</label>
                      <input
                        type="number"
                        defaultValue="5000"
                        className="w-full h-11 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <button className="px-6 py-2.5 bg-mcn-blue text-white text-sm font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        )}
      </div>

      {/* Slide-over Form for Add / Edit Product */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsFormOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col">
              <header className="px-6 py-5 bg-mcn-dark text-white flex items-center justify-between">
                <h2 className="text-lg font-extrabold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setIsFormOpen(false)} className="text-white hover:text-mcn-red transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </header>

              <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider border-b pb-2">Basic Info</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Product Name *</label>
                      <input
                        required
                        type="text"
                        value={formFields.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                          setFormFields((prev) => ({ ...prev, name, slug }));
                        }}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Slug * (for URL)</label>
                      <input
                        required
                        type="text"
                        value={formFields.slug}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, slug: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Category *</label>
                      <select
                        value={formFields.category}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, category: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm bg-white"
                      >
                        {CATEGORIES.filter((c) => c !== 'Wholesale' && c !== 'Deals').map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Subcategory (Optional)</label>
                      <input
                        type="text"
                        value={formFields.subcategory}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, subcategory: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Price (Rs.) *</label>
                      <input
                        required
                        type="number"
                        value={formFields.price || ''}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, price: Number(e.target.value) }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Original Price (Rs. for sales / optional)</label>
                      <input
                        type="number"
                        value={formFields.originalPrice || ''}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, originalPrice: Number(e.target.value) }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Artisan Name</label>
                      <input
                        type="text"
                        value={formFields.artisan}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, artisan: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Region</label>
                      <input
                        type="text"
                        value={formFields.region}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, region: e.target.value }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Badge</label>
                      <select
                        value={formFields.badge}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, badge: e.target.value as any }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm bg-white"
                      >
                        <option value="">None</option>
                        <option value="new">new</option>
                        <option value="sale">sale</option>
                        <option value="trending">trending</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-mcn-charcoal mb-1">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={formFields.description}
                      onChange={(e) => setFormFields((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                    />
                  </div>
                </div>

                {/* Inventory Management */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider border-b pb-2">Inventory</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Stock Quantity *</label>
                      <input
                        required
                        type="number"
                        value={formFields.stock_quantity || ''}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-mcn-charcoal mb-1">Low Stock Warning Threshold *</label>
                      <input
                        required
                        type="number"
                        value={formFields.low_stock_threshold || ''}
                        onChange={(e) => setFormFields((prev) => ({ ...prev, low_stock_threshold: Number(e.target.value) }))}
                        className="w-full h-10 px-3 rounded-lg border-2 border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Repeatable Features */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider">Features</h3>
                    <button
                      type="button"
                      onClick={() => setFormFields((prev) => ({ ...prev, features: [...prev.features, ''] }))}
                      className="text-xs text-mcn-blue font-bold hover:underline"
                    >
                      + Add Feature
                    </button>
                  </div>
                  {formFields.features.map((feature, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const features = [...formFields.features];
                          features[index] = e.target.value;
                          setFormFields((prev) => ({ ...prev, features }));
                        }}
                        placeholder={`Feature #${index + 1}`}
                        className="flex-1 h-9 px-3 rounded-lg border border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormFields((prev) => ({
                            ...prev,
                            features: prev.features.filter((_, i) => i !== index),
                          }))
                        }
                        className="text-mcn-red font-bold text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Repeatable Specs */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider">Specifications</h3>
                    <button
                      type="button"
                      onClick={() => setFormFields((prev) => ({ ...prev, specs: [...prev.specs, { label: '', value: '' }] }))}
                      className="text-xs text-mcn-blue font-bold hover:underline"
                    >
                      + Add Spec
                    </button>
                  </div>
                  {formFields.specs.map((spec, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={spec.label}
                        onChange={(e) => {
                          const specs = [...formFields.specs];
                          specs[index].label = e.target.value;
                          setFormFields((prev) => ({ ...prev, specs }));
                        }}
                        placeholder="Label (e.g. Weight)"
                        className="w-1/3 h-9 px-3 rounded-lg border border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => {
                          const specs = [...formFields.specs];
                          specs[index].value = e.target.value;
                          setFormFields((prev) => ({ ...prev, specs }));
                        }}
                        placeholder="Value (e.g. 1.2 kg)"
                        className="flex-1 h-9 px-3 rounded-lg border border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormFields((prev) => ({
                            ...prev,
                            specs: prev.specs.filter((_, i) => i !== index),
                          }))
                        }
                        className="text-mcn-red font-bold text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                {/* Repeatable Variants */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider">Variants</h3>
                    <button
                      type="button"
                      onClick={() => setFormFields((prev) => ({ ...prev, variants: [...prev.variants, { name: '', options: [] }] }))}
                      className="text-xs text-mcn-blue font-bold hover:underline"
                    >
                      + Add Variant Type
                    </button>
                  </div>
                  {formFields.variants.map((v, index) => (
                    <div key={index} className="border border-mcn-gray-200 rounded-lg p-3 space-y-2">
                      <div className="flex gap-2 justify-between items-center">
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => {
                            const variants = [...formFields.variants];
                            variants[index].name = e.target.value;
                            setFormFields((prev) => ({ ...prev, variants }));
                          }}
                          placeholder="Variant Name (e.g. Size, Color)"
                          className="w-1/2 h-9 px-3 rounded-lg border border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm font-bold"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormFields((prev) => ({
                              ...prev,
                              variants: prev.variants.filter((_, i) => i !== index),
                            }))
                          }
                          className="text-mcn-red font-bold text-xs hover:underline"
                        >
                          Delete Variant
                        </button>
                      </div>
                      <div>
                        <input
                          type="text"
                          value={v.options.join(', ')}
                          onChange={(e) => {
                            const val = e.target.value;
                            const options = val.split(',').map((o) => o.trim()).filter((o) => o.length > 0);
                            const variants = [...formFields.variants];
                            variants[index].options = options;
                            setFormFields((prev) => ({ ...prev, variants }));
                          }}
                          placeholder="Options, separated by commas (e.g. Red, Blue, Green)"
                          className="w-full h-9 px-3 rounded-lg border border-mcn-gray-300 focus:border-mcn-blue focus:outline-none text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Media Gallery / Uploads */}
                <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-mcn-charcoal uppercase tracking-wider border-b pb-2">Media Gallery</h3>
                  <div className="flex items-center gap-4">
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-mcn-gray-300 rounded-lg p-4 cursor-pointer hover:border-mcn-blue transition-colors flex-1 text-center">
                      <Upload className="w-8 h-8 text-mcn-gray-400 mb-2" />
                      <span className="text-xs font-bold text-mcn-charcoal">Upload Images</span>
                      <span className="text-[10px] text-mcn-gray-500 mt-1">Multi-select allowed</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {imageUploading && (
                    <div className="text-center py-2">
                      <div className="w-5 h-5 border-2 border-mcn-blue border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                      <p className="text-[11px] font-bold text-mcn-gray-500">Uploading to bucket...</p>
                    </div>
                  )}

                  {formFields.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {formFields.images.map((url, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-mcn-gray-200">
                          <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-mcn-red text-white rounded-full hover:bg-red-700 transition-colors"
                            aria-label="Remove image"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded">
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 'left')}
                              disabled={idx === 0}
                              className="text-white hover:text-mcn-mint disabled:opacity-50 disabled:hover:text-white"
                              aria-label="Move left"
                            >
                              <ArrowUp className="w-3.5 h-3.5 rotate-270" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveImage(idx, 'right')}
                              disabled={idx === formFields.images.length - 1}
                              className="text-white hover:text-mcn-mint disabled:opacity-50 disabled:hover:text-white"
                              aria-label="Move right"
                            >
                              <ArrowDown className="w-3.5 h-3.5 rotate-270" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>

              <footer className="px-6 py-4 bg-mcn-gray-50 border-t border-mcn-gray-200 flex gap-3 justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 border border-mcn-gray-300 text-mcn-charcoal text-sm font-bold rounded-lg hover:bg-mcn-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  className="px-5 py-2.5 bg-mcn-blue text-white text-sm font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </footer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

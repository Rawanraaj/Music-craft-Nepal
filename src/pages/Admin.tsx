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
  Search,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PRODUCTS, MOCK_ORDERS, MOCK_INQUIRIES } from '../data';

type AdminTab = 'overview' | 'products' | 'orders' | 'inquiries' | 'settings';

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-mcn-blue-light/10 text-mcn-blue',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  new: 'bg-mcn-mint/20 text-mcn-mint-dark',
  contacted: 'bg-mcn-blue-light/10 text-mcn-blue',
  closed: 'bg-gray-100 text-gray-600',
};

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user || !user.isAdmin) return null;

  const totalRevenue = MOCK_ORDERS.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = MOCK_ORDERS.filter((o) => o.status === 'pending' || o.status === 'processing').length;
  const newInquiries = MOCK_INQUIRIES.filter((i) => i.status === 'new').length;

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
            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
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
          <div className="w-10 h-10 rounded-full bg-mcn-blue flex items-center justify-center text-white font-bold">
            A
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

      {/* Main */}
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
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-mcn-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="h-10 w-64 pl-10 pr-4 rounded-lg border-2 border-mcn-gray-200 focus:border-mcn-blue focus:outline-none text-sm"
              />
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-8">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { icon: DollarSign, label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, color: 'bg-mcn-mint/10 text-mcn-mint-dark' },
                  { icon: ShoppingCart, label: 'Total Orders', value: MOCK_ORDERS.length, color: 'bg-mcn-blue/10 text-mcn-blue' },
                  { icon: Package, label: 'Products', value: PRODUCTS.length, color: 'bg-purple-100 text-purple-600' },
                  { icon: Users, label: 'Wholesale Inquiries', value: MOCK_INQUIRIES.length, color: 'bg-orange-100 text-orange-600' },
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
                      {MOCK_ORDERS.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-t border-mcn-gray-100 hover:bg-mcn-gray-50 transition-colors">
                          <td className="px-5 py-3 text-sm font-bold text-mcn-charcoal">{order.id}</td>
                          <td className="px-5 py-3 text-sm text-mcn-gray-600">{order.customerName}</td>
                          <td className="px-5 py-3 text-sm text-mcn-gray-500 hidden md:table-cell">{order.date}</td>
                          <td className="px-5 py-3 text-sm font-bold text-mcn-charcoal">Rs. {order.total.toLocaleString()}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
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
                  {MOCK_INQUIRIES.slice(0, 3).map((inquiry) => (
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

          {/* Products */}
          {activeTab === 'products' && (
            <div className="bg-white rounded-xl border border-mcn-gray-200 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-mcn-gray-200">
                <h2 className="text-base font-extrabold text-mcn-charcoal">All Products ({PRODUCTS.length})</h2>
                <button className="px-4 py-2 bg-mcn-blue text-white text-sm font-bold rounded-lg hover:bg-mcn-blue-dark transition-colors">
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
                      <th className="text-left px-5 py-3 hidden lg:table-cell">Stock</th>
                      <th className="text-left px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PRODUCTS.map((product) => (
                      <tr key={product.id} className="border-t border-mcn-gray-100 hover:bg-mcn-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={product.images[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                            <span className="text-sm font-bold text-mcn-charcoal line-clamp-1">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-mcn-gray-600 hidden md:table-cell">{product.category}</td>
                        <td className="px-5 py-3 text-sm font-bold text-mcn-charcoal">Rs. {product.price.toLocaleString()}</td>
                        <td className="px-5 py-3 hidden lg:table-cell">
                          <span className={`text-xs font-bold ${product.inStock ? 'text-mcn-mint-dark' : 'text-mcn-red'}`}>
                            {product.inStock ? 'In Stock' : 'Out'}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <button className="text-sm font-bold text-mcn-blue hover:underline">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-xl border border-mcn-gray-200 overflow-hidden">
              <div className="p-5 border-b border-mcn-gray-200">
                <h2 className="text-base font-extrabold text-mcn-charcoal">All Orders ({MOCK_ORDERS.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-mcn-gray-50 text-xs font-bold text-mcn-gray-500 uppercase tracking-wide">
                      <th className="text-left px-5 py-3">Order ID</th>
                      <th className="text-left px-5 py-3">Customer</th>
                      <th className="text-left px-5 py-3 hidden md:table-cell">Items</th>
                      <th className="text-left px-5 py-3 hidden lg:table-cell">Date</th>
                      <th className="text-left px-5 py-3 hidden lg:table-cell">Payment</th>
                      <th className="text-left px-5 py-3">Total</th>
                      <th className="text-left px-5 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ORDERS.map((order) => (
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
                        <td className="px-5 py-3 text-sm text-mcn-gray-600 hidden lg:table-cell">{order.paymentMethod}</td>
                        <td className="px-5 py-3 text-sm font-bold text-mcn-charcoal">Rs. {order.total.toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Inquiries */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              {MOCK_INQUIRIES.map((inquiry) => (
                <div key={inquiry.id} className="bg-white rounded-xl border border-mcn-gray-200 p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-extrabold text-mcn-charcoal">{inquiry.businessName}</h3>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[inquiry.status]}`}>
                          {inquiry.status}
                        </span>
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

          {/* Settings */}
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

              <div className="bg-white rounded-xl border border-mcn-gray-200 p-6">
                <h2 className="text-lg font-extrabold text-mcn-charcoal mb-4">Payment Methods</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-mcn-gray-50 rounded-lg">
                    <span className="text-sm font-bold text-mcn-charcoal">Cash on Delivery</span>
                    <span className="text-xs font-bold text-mcn-mint-dark bg-mcn-mint/10 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-mcn-gray-50 rounded-lg">
                    <span className="text-sm font-bold text-mcn-charcoal">eSewa</span>
                    <span className="text-xs font-bold text-mcn-gray-500 bg-mcn-gray-100 px-2 py-1 rounded-full">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-mcn-gray-50 rounded-lg">
                    <span className="text-sm font-bold text-mcn-charcoal">Khalti</span>
                    <span className="text-xs font-bold text-mcn-gray-500 bg-mcn-gray-100 px-2 py-1 rounded-full">Coming Soon</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

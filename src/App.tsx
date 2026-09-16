import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import React, { useEffect, Suspense } from 'react';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wholesale from './pages/Wholesale';
import About from './pages/About';
import Contact from './pages/Contact';
import Articles from './pages/Articles';
import ArticleDetail from './pages/ArticleDetail';
import MyOrders from './pages/MyOrders';
import CustomerMessages from './pages/CustomerMessages';
import ShippingInfo from './pages/ShippingInfo';
import ReturnsRefunds from './pages/ReturnsRefunds';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// Lazy-load Admin (+ recharts) and Login so they're code-split
// out of the main customer-facing bundle
const Admin = React.lazy(() => import('./pages/Admin'));
const Login = React.lazy(() => import('./pages/Login'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function LazyFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #e5e7eb', borderTopColor: '#8B5E3C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#6b7280', fontSize: 14 }}>Loading…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const isLogin = pathname === '/login';

  if (isAdmin || isLogin) {
    return (
      <Suspense fallback={<LazyFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/wholesale" element={<Wholesale />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/articles/:slug" element={<ArticleDetail />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/messages" element={<CustomerMessages />} />
        <Route path="/shipping-info" element={<ShippingInfo />} />
        <Route path="/returns-refunds" element={<ReturnsRefunds />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider>
            <CartProvider>
              <ScrollToTop />
              <AppRoutes />
            </CartProvider>
          </ToastProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

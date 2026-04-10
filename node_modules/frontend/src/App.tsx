import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { clearAllCaches } from './utils/cacheBuster';

// Import Amazon-style mobile view
import './styles/AmazonMobileView.css';

// Lazy load all page components for better performance
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const Categories = lazy(() => import('./pages/Categories'));
const Wishlist = lazy(() => import('./pages/Wishlist').then(module => ({ default: module.Wishlist })));
const Cart = lazy(() => import('./pages/Cart').then(module => ({ default: module.Cart })));
const Profile = lazy(() => import('./pages/Profile'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrdersDashboard = lazy(() => import('./pages/OrdersDashboard'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Login = lazy(() => import('./pages/LoginSplitPanel'));
const Signup = lazy(() => import('./pages/SignupSplitPanel'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Loading component
const PageLoader = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div className="loading-spinner" style={{
        width: '50px',
        height: '50px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #f97316',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }}></div>
      <p style={{ color: '#282c3f', fontSize: '16px', fontWeight: 600 }}>Loading...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  </div>
);

// Layout component to conditionally render Footer based on route
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const showFooter = location.pathname === '/'; // Only show footer on home page
  
  // Scroll to top on every route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Cache busting - clear cache on app mount (development only)
  useEffect(() => {
    console.log('🔄 Clearing application cache...');
    // Uncomment the line below during development if cache issues persist
    // clearAllCaches();
  }, []);

  return (
    <>
      <Navbar />
      <main className="app-main">
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </main>
      {showFooter && <Footer />}
    </>
  );
};

const App = () => (
  <ToastProvider>
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<OrdersDashboard />} />
            <Route path="/track-order/:orderNumber" element={<OrderTracking />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Layout>
        
        {/* React Toastify Container - positioned below navbar */}
        <ToastContainer 
          position="top-right"
          autoClose={1000}  // 1 second for quick messages
          hideProgressBar={true}  // Hide the green loading line
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ 
            marginTop: '80px', // Position below navbar
            zIndex: 9999 // Ensure toasts appear on top of everything
          }}
        />
        {/* Inline styles to force toast visibility in production */}
        <style>{`
          .Toastify__toast-container {
            z-index: 9999 !important;
          }
          
          .Toastify__toast {
            min-width: 300px;
            max-width: 500px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }
          
          .Toastify__close-button {
            display: block !important;
            visibility: visible !important;
            opacity: 0.7 !important;
            color: inherit !important;
          }
          
          .Toastify__close-button:hover {
            opacity: 1 !important;
          }
          
          /* Ensure toast icons are visible */
          .Toastify__toast-icon {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
          }
        `}</style>
      </Router>
    </CartProvider>
  </ToastProvider>
);

export default App;

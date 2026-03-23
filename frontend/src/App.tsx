import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import Home from './pages/Home';
import Products from './pages/Products';
import Categories from './pages/Categories';
import { Wishlist } from './pages/Wishlist';
import { Cart } from './pages/Cart';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import { Orders } from './pages/Orders';
import OrderTracking from './pages/OrderTracking';
import ProductDetail from './pages/ProductDetail';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/authContext';
import { CartProvider } from './context/CartContext';

// Layout component to conditionally render Footer based on route
const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const showFooter = location.pathname === '/'; // Only show footer on home page

  return (
    <>
      <Navbar />
      <main className="app-main">
        {children}
      </main>
      {showFooter && <Footer />}
    </>
  );
};

const App = () => (
  <AuthProvider>
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
            <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/track-order/:orderNumber" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  </AuthProvider>
);

export default App;

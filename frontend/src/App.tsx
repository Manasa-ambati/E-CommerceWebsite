import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import Login from './pages/Login';
import Signup from './pages/Signup';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminDashboard from './pages/AdminDashboard';
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
          <Route path="/orders" element={<Orders />} />
          <Route path="/track-order/:orderNumber" element={<OrderTracking />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </Layout>
    </Router>
  </CartProvider>
);

export default App;

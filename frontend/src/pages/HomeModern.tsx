import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI, wishlistAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './HomeModern.css';

interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  rating: number;
}

interface Category {
  id: number;
  name: string;
  icon?: string;
}

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const { addToCart } = useCart();
  const toast = useToast();

  // Category icons mapping
  const categoryIcons: {[key: string]: string} = {
    'Electronics': '💻',
    'Fashion': '👕',
    'Home': '🏠',
    'Books': '📚',
    'Sports': '⚽',
    'Toys': '🎮',
    'Beauty': '💄',
    'Grocery': '🛒'
  };

  useEffect(() => {
    fetchData();
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch featured products
      const featuredRes = await productAPI.getFeatured();
      setFeaturedProducts(featuredRes.data.data?.slice(0, 4) || []);

      // Fetch best sellers (all products for now)
      const allRes = await productAPI.getAll();
      setBestSellers(allRes.data.data?.slice(0, 8) || []);

      // Fetch categories
      const catRes = await categoryAPI.getAll();
      setCategories(catRes.data.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.addToast('Failed to load products. Please refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleWishlistToggle = async (productId: number) => {
    const token = localStorage.getItem('token');
    
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    
    if (token) {
      try {
        if (wishlist.includes(productId)) {
          await wishlistAPI.remove(productId);
          toast.addToast('Removed from wishlist', 'success');
        } else {
          await wishlistAPI.add(productId);
          toast.addToast('Added to wishlist', 'success');
        }
      } catch (error: any) {
        console.error('Failed to update wishlist:', error);
        toast.addToast('Failed to update wishlist. Please try again.', 'error');
        setWishlist(prev => 
          prev.includes(productId) 
            ? prev.filter(id => id !== productId)
            : [...prev, productId]
        );
      }
    } else {
      let wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
      
      if (wishlistIds.includes(productId)) {
        wishlistIds = wishlistIds.filter((id: number) => id !== productId);
        toast.addToast('Removed from wishlist', 'success');
      } else {
        wishlistIds.push(productId);
        toast.addToast('Added to wishlist', 'success');
      }
      
      localStorage.setItem('wishlist', JSON.stringify(wishlistIds));
    }
    
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
      toast.addToast('Added to cart!', 'success');
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast.addToast(error.response?.data?.message || 'Failed to add to cart', 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-pattern"></div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">🎉 Welcome to ShopEase</div>
            <h1 className="hero-title">
              Big Savings<br />Start Here
            </h1>
            <p className="hero-subtitle">
              Discover amazing deals on your favorite products. Up to 50% off on selected items!
            </p>
            <div className="hero-buttons">
              <Link to="/products" className="add-to-cart-btn" style={{ textDecoration: 'none' }}>
                Shop Now 🛍️
              </Link>
              <a href="#featured" className="add-to-cart-btn" style={{ background: 'white', color: '#667eea', textDecoration: 'none' }}>
                View Deals
              </a>
            </div>
          </div>
          <div className="hero-image">
            <img src="https://cdn-icons-png.flaticon.com/512/3081/3081840.png" alt="Shopping" />
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="categories-section">
        <div className="categories-grid">
          {categories.slice(0, 6).map((category) => (
            <Link to={`/categories?cat=${category.id}`} key={category.id} className="category-card">
              <div className="category-icon">
                {categoryIcons[category.name] || '📦'}
              </div>
              <div className="category-name">{category.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="products-section" id="featured">
        <div className="section-header">
          <h2 className="section-title">Featured Products</h2>
          <Link to="/products" className="view-all-link">
            View All →
          </Link>
        </div>
        
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-image-wrapper">
                <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} className="product-image" />
                <div className="product-actions">
                  <button 
                    className="action-btn"
                    onClick={() => handleWishlistToggle(product.id)}
                    title="Add to Wishlist"
                  >
                    {wishlist.includes(product.id) ? '❤️' : '🤍'}
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => handleAddToCart(product.id)}
                    title="Add to Cart"
                  >
                    🛒
                  </button>
                </div>
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                
                <div className="product-rating">
                  <span className="stars">{'⭐'.repeat(Math.min(5, Math.floor(product.rating)))}</span>
                  <span className="rating-count">({product.rating})</span>
                </div>
                
                <div className="product-price">
                  <span className="current-price">${product.discountPrice?.toFixed(2) || product.price.toFixed(2)}</span>
                  {product.discountPrice && (
                    <>
                      <span className="original-price">${product.price.toFixed(2)}</span>
                      <span className="discount-badge">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product.id)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">Best Sellers 🔥</h2>
          <Link to="/products" className="view-all-link">
            View All →
          </Link>
        </div>
        
        <div className="products-grid">
          {bestSellers.slice(0, 4).map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-image-wrapper">
                <img src={product.images?.[0] || '/placeholder.jpg'} alt={product.name} className="product-image" />
                <div className="product-actions">
                  <button 
                    className="action-btn"
                    onClick={() => handleWishlistToggle(product.id)}
                    title="Add to Wishlist"
                  >
                    {wishlist.includes(product.id) ? '❤️' : '🤍'}
                  </button>
                  <button 
                    className="action-btn"
                    onClick={() => handleAddToCart(product.id)}
                    title="Add to Cart"
                  >
                    🛒
                  </button>
                </div>
              </div>
              
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                
                <div className="product-rating">
                  <span className="stars">{'⭐'.repeat(Math.min(5, Math.floor(product.rating)))}</span>
                  <span className="rating-count">({product.rating})</span>
                </div>
                
                <div className="product-price">
                  <span className="current-price">${product.discountPrice?.toFixed(2) || product.price.toFixed(2)}</span>
                  {product.discountPrice && (
                    <>
                      <span className="original-price">${product.price.toFixed(2)}</span>
                      <span className="discount-badge">
                        {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
                
                <button 
                  className="add-to-cart-btn"
                  onClick={() => handleAddToCart(product.id)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="testimonials-section">
        <div className="testimonials-container">
          <div className="testimonials-header">
            <h2 className="testimonials-title">What Our Customers Say</h2>
            <p className="testimonials-subtitle">Real reviews from real people</p>
          </div>
          
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">S</div>
                <div className="testimonial-info">
                  <h4>Sarah Johnson</h4>
                  <p>Verified Buyer</p>
                </div>
              </div>
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "Amazing shopping experience! The products are top quality and delivery was super fast. Highly recommend ShopEase!"
              </p>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">M</div>
                <div className="testimonial-info">
                  <h4>Michael Chen</h4>
                  <p>Frequent Shopper</p>
                </div>
              </div>
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "Best prices I've found online. The customer service is excellent and returns are hassle-free. Love it!"
              </p>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">E</div>
                <div className="testimonial-info">
                  <h4>Emily Rodriguez</h4>
                  <p>Happy Customer</p>
                </div>
              </div>
              <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "The website is so easy to use and checkout is seamless. My go-to shopping destination now!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>ShopEase</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/careers">Careers</Link></li>
              <li><Link to="/press">Press</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Customer Service</h3>
            <ul>
              <li><Link to="/help">Help Center</Link></li>
              <li><Link to="/returns">Returns</Link></li>
              <li><Link to="/shipping">Shipping Info</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Policies</h3>
            <ul>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/security">Security</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Connect With Us</h3>
            <ul>
              <li><a href="#">Facebook</a></li>
              <li><a href="#">Twitter</a></li>
              <li><a href="#">Instagram</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 ShopEase. All rights reserved. Made with ❤️ for shoppers.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

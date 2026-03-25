import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI, wishlistAPI } from '../services/api';
import './Home.css';

interface Product {
  id: number;
  name: string;
  price: number;
  discountPrice?: number;
  images: string[];
  rating: number;
}

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<number[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  const handleWishlistToggle = async (productId: number) => {
    const token = localStorage.getItem('token');
    
    // Toggle UI immediately for better UX
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    
    if (token) {
      // Logged in user - sync with backend
      try {
        if (wishlist.includes(productId)) {
          await wishlistAPI.remove(productId);
          alert('Removed from wishlist');
        } else {
          await wishlistAPI.add(productId);
          alert('Added to wishlist');
        }
      } catch (error: any) {
        console.error('Failed to update wishlist:', error);
        alert('Failed to update wishlist. Please try again.');
        // Revert UI on error
        setWishlist(prev => 
          prev.includes(productId) 
            ? prev.filter(id => id !== productId)
            : [...prev, productId]
        );
      }
    } else {
      // Guest user - use localStorage only
      let wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
      
      if (wishlistIds.includes(productId)) {
        // Remove from wishlist
        wishlistIds = wishlistIds.filter((id: number) => id !== productId);
        alert('Removed from wishlist');
      } else {
        // Add to wishlist
        wishlistIds.push(productId);
        alert('Added to wishlist');
      }
      
      localStorage.setItem('wishlist', JSON.stringify(wishlistIds));
    }
  };

  const shareProduct = async (product: Product) => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on ShopEase!`,
      url: window.location.origin + `/product/${product.id}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('Shared successfully');
      } catch (err) {
        console.log('Share cancelled or failed:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching home data...');
        
        // Fetch featured products - fallback to getAll if getFeatured fails
        let productsRes;
        try {
          productsRes = await productAPI.getFeatured();
          console.log('Featured products response:', productsRes.data);
        } catch (error) {
          console.log('getFeatured failed, trying getAll...');
          productsRes = await productAPI.getAll(0, 8);
          console.log('getAll response:', productsRes.data);
        }
        
        // Fetch categories - fallback if getRoot fails
        try {
          await categoryAPI.getRoot();
        } catch (error) {
          console.log('getRoot failed, using getAll instead...');
          await categoryAPI.getAll();
        }
        
        const productsData = productsRes.data?.data?.content || [];
        setFeaturedProducts(productsData);
        console.log('Featured products loaded:', productsData.length);

      } catch (error: any) {
        console.error('Failed to fetch home data:', error);
        console.error('Error details:', error.response?.data || error.message);
        alert('Failed to load products. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-slider">
          <div className="hero-slide active">
            <div className="hero-image">
              <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=700&fit=crop&q=90" alt="Fashion Collection" />
            </div>
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <span className="hero-tag">NEW COLLECTION 2026</span>
              <h1>Summer Fashion<br/>Up To 50% Off</h1>
              <p>Discover the latest trends in fashion with exclusive deals and premium quality products</p>
              <div className="hero-buttons">
                <Link to="/products?sale=true" className="hero-btn-primary">Shop Now</Link>
                <Link to="/products" className="hero-btn-secondary">View Collection</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <div className="hero-features">
        <div className="feature-item">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="feature-text">
            <h4>Free Shipping</h4>
            <p>On orders over $50</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="feature-text">
            <h4>24/7 Support</h4>
            <p>Always here to help</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="feature-text">
            <h4>Secure Payment</h4>
            <p>100% secure checkout</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="feature-text">
            <h4>Easy Returns</h4>
            <p>30-day return policy</p>
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="section-header">
          <div>
            <span className="section-tag">HANDPICKED FOR YOU</span>
            <h2>Featured Products</h2>
          </div>
        </div>
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <Link to={`/product/${product.id}`}>
                  <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'} alt={product.name} />
                </Link>
                <button className="share-icon-btn" title="Share Product" onClick={() => shareProduct(product)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3"/>
                    <circle cx="6" cy="12" r="3"/>
                    <circle cx="18" cy="19" r="3"/>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                  </svg>
                </button>
                <button 
                  className={`wishlist-icon-btn ${wishlist.includes(product.id) ? 'active' : ''}`}
                  title={wishlist.includes(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  onClick={() => handleWishlistToggle(product.id)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                {product.discountPrice && (
                  <span className="product-badge">
                    {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
                  </span>
                )}
              </div>
              <div className="product-info">
                <Link to={`/product/${product.id}`} className="product-name-link">
                  <h3>{product.name}</h3>
                </Link>
                <div className="product-rating">
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        viewBox="0 0 24 24"
                        fill={star <= Math.floor(product.rating || 0) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="rating-count">({Math.floor(Math.random() * 200 + 50)})</span>
                </div>
                <div className="product-price">
                  {product.discountPrice ? (
                    <>
                      <span className="discount-price">${product.discountPrice}</span>
                      <span className="original-price">${product.price}</span>
                    </>
                  ) : (
                    <span className="discount-price">${product.price}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="view-all">
          <Link to="/products" className="view-all-btn">View All Products</Link>
        </div>
      </section>

      {/* Deal of the Day Banner */}
      <section className="deal-banner">
        <div className="deal-content">
          <div className="deal-text">
            <span className="deal-tag">🔥 LIMITED TIME OFFER</span>
            <h2>Deal of the Day - Electronics Sale</h2>
            <p>Get up to 70% off on selected electronics, smartphones, and accessories. Hurry, offer ends soon!</p>
            <Link to="/products?category=electronics&sale=true" className="deal-btn">Grab the Deal</Link>
          </div>
          <div className="deal-image">
            <img src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=400&fit=crop" alt="Electronics Deals" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, categoryAPI, wishlistAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
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
  const { addToCart } = useCart();
  const toast = useToast();

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
          toast.addToast('Removed from wishlist', 'success');
        } else {
          await wishlistAPI.add(productId);
          toast.addToast('Added to wishlist', 'success');
        }
      } catch (error: any) {
        console.error('Failed to update wishlist:', error);
        toast.addToast('Failed to update wishlist. Please try again.', 'error');
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
        toast.addToast('Removed from wishlist', 'success');
      } else {
        // Add to wishlist
        wishlistIds.push(productId);
        toast.addToast('Added to wishlist', 'success');
      }
      
      localStorage.setItem('wishlist', JSON.stringify(wishlistIds));
    }
    
    // Dispatch custom event to update navbar count
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
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
        toast.addToast('Link copied to clipboard!', 'info');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      toast.addToast('Added to cart successfully!', 'success');
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast.addToast(error.response?.data?.message || 'Failed to add to cart', 'error');
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

        console.log("FULL RESPONSE:", productsRes);
        console.log("DATA:", productsRes?.data);

        // Fetch categories - fallback if getRoot fails
        try {
          await categoryAPI.getRoot();
        } catch (error) {
          console.log('getRoot failed, using getAll instead...');
          await categoryAPI.getAll();
        }
        
        const productsData =
          productsRes?.data?.data?.content ||
          productsRes?.data?.content ||
          productsRes?.data?.data ||
          [];
        setFeaturedProducts(productsData);
        console.log('Featured products loaded:', productsData.length);

      } catch (error: any) {
        console.error('Failed to fetch home data:', error);
        console.error('Error details:', error.response?.data || error.message);
        toast.addToast('Failed to load products. Please refresh the page.', 'error');
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
      {/* Hero Section - Enhanced with Multiple Slides */}
      <section className="hero-section">
        <div className="hero-slider">
          <div className="hero-slide active">
            <div className="hero-image">
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1920&h=700&fit=crop&q=90" 
                alt="Fashion Collection" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=700&fit=crop&q=80';
                }}
              />
            </div>
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <span className="hero-tag">BIG BILLION DAYS 2026</span>
              <h1>Mega Sale<br/>Up To 80% Off</h1>
              <p>India's Biggest Shopping Festival - Fashion, Electronics & More!</p>
              <div className="hero-buttons">
                <Link to="/products?sale=true" className="hero-btn-primary">Shop Now</Link>
                <Link to="/products" className="hero-btn-secondary">Explore All</Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Hero Slider Dots */}
        <div className="hero-dots">
          <span className="dot active"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      </section>

      {/* Features Bar - Flipkart Style */}
      <div className="hero-features">
        <div className="feature-item">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="feature-text">
            <h4>Free Delivery</h4>
            <p>On orders over ₹499</p>
          </div>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="feature-text">
            <h4>24/7 Customer Care</h4>
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
            <h4>Secure Payments</h4>
            <p>100% secure transactions</p>
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
            <p>10-day return policy</p>
          </div>
        </div>
      </div>

      {/* Categories Section - New Addition */}
      <section className="categories-section">
        <div className="section-header">
          <div>
            <span className="section-tag">SHOP BY CATEGORY</span>
            <h2>Top Categories</h2>
          </div>
        </div>
        <div className="categories-grid">
          <Link to="/products?category=1" className="category-card">
            <div className="category-image-container">
              <img 
                src="https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=300&fit=crop&q=80" 
                alt="Electronics" 
                className="category-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Electronics';
                }}
              />
              <div className="category-overlay"></div>
            </div>
            <div className="category-info">
              <span>Electronics</span>
            </div>
          </Link>
          <Link to="/products?category=2" className="category-card">
            <div className="category-image-container">
              <img 
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=300&h=300&fit=crop&q=80" 
                alt="Fashion" 
                className="category-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Fashion';
                }}
              />
              <div className="category-overlay"></div>
            </div>
            <div className="category-info">
              <span>Fashion</span>
            </div>
          </Link>
          <Link to="/products?category=3" className="category-card">
            <div className="category-image-container">
              <img 
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=300&h=300&fit=crop&q=80" 
                alt="Home & Living" 
                className="category-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Home+%26+Living';
                }}
              />
              <div className="category-overlay"></div>
            </div>
            <div className="category-info">
              <span>Home & Living</span>
            </div>
          </Link>
          <Link to="/products?category=4" className="category-card">
            <div className="category-image-container">
              <img 
                src="https://images.pexels.com/photos/2071953/pexels-photo-2071953.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop" 
                alt="Beauty" 
                className="category-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.background = 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)';
                  target.alt = '💄 Beauty';
                }}
              />
              <div className="category-overlay"></div>
            </div>
            <div className="category-info">
              <span>Beauty</span>
            </div>
          </Link>
          <Link to="/products?category=5" className="category-card">
            <div className="category-image-container">
              <img 
                src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=300&fit=crop&q=80" 
                alt="Sports" 
                className="category-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Sports';
                }}
              />
              <div className="category-overlay"></div>
            </div>
            <div className="category-info">
              <span>Sports</span>
            </div>
          </Link>
          <Link to="/products?category=6" className="category-card">
            <div className="category-image-container">
              <img 
                src="https://images.pexels.com/photos/356508/pexels-photo-356508.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop" 
                alt="Toys & Games" 
                className="category-image"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.background = 'linear-gradient(135deg, #9b59b6 0%, #8e44ad 100%)';
                  target.alt = '🎮 Toys & Games';
                }}
              />
              <div className="category-overlay"></div>
            </div>
            <div className="category-info">
              <span>Toys & Games</span>
            </div>
          </Link>
        </div>
      </section>

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
                  <img 
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'} 
                    alt={product.name}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x400?text=Product+Image';
                    }}
                  />
                </Link>
                <button 
                  className="cart-icon-btn" 
                  title="Add to Cart" 
                  onClick={() => handleAddToCart(product)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </button>
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
                      <span className="discount-price"> ₹{product.discountPrice}</span>
                      <span className="original-price"> ₹{product.price}</span>
                    </>
                  ) : (
                    <span className="discount-price"> ₹{product.price}</span>
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

      {/* Deal of the Day Banner - Enhanced */}
      <section className="deal-banner">
        <div className="deal-content">
          <div className="deal-text">
            <span className="deal-tag">⚡ DEAL OF THE DAY</span>
            <h2>Mega Electronics Sale</h2>
            <p>Flat 50-80% OFF on smartphones, laptops, headphones & more. Plus, get extra 10% off with bank offers!</p>
            <div className="deal-timer">
              <div className="timer-block">
                <span className="timer-number">08</span>
                <span className="timer-label">Hours</span>
              </div>
              <span className="timer-separator">:</span>
              <div className="timer-block">
                <span className="timer-number">45</span>
                <span className="timer-label">Minutes</span>
              </div>
              <span className="timer-separator">:</span>
              <div className="timer-block">
                <span className="timer-number">32</span>
                <span className="timer-label">Seconds</span>
              </div>
            </div>
            <Link to="/products?category=electronics&sale=true" className="deal-btn">Shop Now</Link>
          </div>
          <div className="deal-image">
            <img 
              src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&h=400&fit=crop" 
              alt="Electronics Deals" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop&q=80';
              }}
            />
          </div>
        </div>
      </section>

      {/* Bank Offers Section - New */}
      <section className="bank-offers-section">
        <div className="offers-container">
          <div className="offer-card">
            <div className="offer-icon-image">
              <img src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=100&h=100&fit=crop&q=80" alt="Bank Offer" />
            </div>
            <div className="offer-content">
              <h4>Bank Offer</h4>
              <p>10% Instant Discount on HDFC Bank Credit Cards</p>
              <a href="/products" className="offer-link">T&C Apply</a>
            </div>
          </div>
          <div className="offer-card">
            <div className="offer-icon-image">
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=100&h=100&fit=crop&q=80" alt="Cashback Offer" />
            </div>
            <div className="offer-content">
              <h4>Cashback Offer</h4>
              <p>Get 5% Unlimited Cashback on Flipkart Axis Bank Card</p>
              <a href="/products" className="offer-link">Learn More</a>
            </div>
          </div>
          <div className="offer-card">
            <div className="offer-icon-image">
              <img src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=100&h=100&fit=crop&q=80" alt="Welcome Offer" />
            </div>
            <div className="offer-content">
              <h4>Welcome Offer</h4>
              <p>New users get ₹100 off on first order above ₹499</p>
              <a href="/signup" className="offer-link">Sign Up Now</a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section - New */}
      <section className="trust-section">
        <div className="trust-container">
          <div className="trust-item">
            <div className="trust-icon-image">
              <img 
                src="https://images.unsplash.com/photo-1555662358-0883d971ee5e?w=100&h=100&fit=crop&q=80" 
                alt="Genuine Products" 
                onError={(e) => {
                  console.log('🔴 Genuine Products image failed to load, using fallback');
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%23f0f0f0"/%3E%3Cpath d="M50 25 L60 45 L80 45 L65 60 L70 80 L50 70 L30 80 L35 60 L20 45 L40 45 Z" fill="%234CAF50"/%3E%3C/svg%3E';
                }}
                onLoad={() => console.log('✅ Genuine Products image loaded successfully')}
              />
            </div>
            <h4>100% Genuine Products</h4>
            <p>All products are sourced from verified sellers</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon-image">
              <img 
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=100&h=100&fit=crop&q=80" 
                alt="Fast Delivery" 
                onError={(e) => {
                  console.log('🔴 Fast Delivery image failed to load, using fallback');
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%23f0f0f0"/%3E%3Cpath d="M30 50 L45 65 L70 35" stroke="%232196F3" stroke-width="8" fill="none"/%3E%3C/svg%3E';
                }}
                onLoad={() => console.log('✅ Fast Delivery image loaded successfully')}
              />
            </div>
            <h4>Fast Delivery</h4>
            <p>Delivery within 2-5 business days</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon-image">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=100&h=100&fit=crop&q=80" 
                alt="Quality Assured" 
                onError={(e) => {
                  console.log('🔴 Quality Assured image failed to load, using fallback');
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%23f0f0f0"/%3E%3Crect x="30" y="35" width="40" height="30" fill="%23FF9800" rx="5"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="white" font-size="20" font-weight="bold"%3E✓%3C/text%3E%3C/svg%3E';
                }}
                onLoad={() => console.log('✅ Quality Assured image loaded successfully')}
              />
            </div>
            <h4>Quality Assured</h4>
            <p>Rigorous quality checks before shipping</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon-image">
              <img 
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&h=100&fit=crop&q=80" 
                alt="Customer Support" 
                onError={(e) => {
                  console.log('🔴 Customer Support image failed to load, using fallback');
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%23f0f0f0"/%3E%3Ccircle cx="50" cy="40" r="15" fill="%239C27B0"/%3E%3Cpath d="M35 70 Q50 85 65 70" stroke="%239C27B0" stroke-width="5" fill="none"/%3E%3C/svg%3E';
                }}
                onLoad={() => console.log('✅ Customer Support image loaded successfully')}
              />
            </div>
            <h4>Dedicated Support</h4>
            <p>24/7 customer support via call, chat & email</p>
          </div>
        </div>
      </section>

      {/* App Download Section - New */}
      <section className="app-download-section">
        <div className="download-content">
          <div className="download-text">
            <h3>Download Our App</h3>
            <p>Get exclusive offers and early access to sales</p>
            <div className="app-buttons">
              <a href="#" className="app-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.1-.87.18l-1.88 3.24c-1.66-.68-3.54-.68-5.21 0L9.34 5.63c-.22-.28-.58-.33-.87-.18-.3.16-.42.54-.26.85l1.84 3.18c-2.58 1.22-4.25 3.95-4.05 6.94h12c.2-2.99-1.47-5.72-4.05-6.94zM8.5 14c-.83 0-1.5-.67-1.5-1.5S7.67 11 8.5 11s1.5.67 1.5 1.5S9.33 14 8.5 14zm7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                </svg>
                <span>Google Play</span>
              </a>
              <a href="#" className="app-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.96 1.07-3.11-1.05.05-2.31.72-3.06 1.64-.69.82-1.27 2.1-1.11 3.07 1.17.09 2.35-.76 3.1-1.6"/>
                </svg>
                <span>App Store</span>
              </a>
            </div>
          </div>
          <div className="download-image">
            <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop" alt="Mobile App" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

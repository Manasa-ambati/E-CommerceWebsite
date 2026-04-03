// src/pages/Wishlist.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI, cartAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import './Wishlist.css';


interface WishlistItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  productDiscountPrice?: number;
}

export const Wishlist: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const toast = useToast();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    
    // If user is logged in, fetch from backend
    if (token) {
      try {
        const response = await wishlistAPI.get();
        setWishlist(response.data.data || []);
        setLoading(false);
        return;
      } catch (err: any) {
        console.error('Backend wishlist error:', err);
        // Fall back to localStorage if backend fails
      }
    }
    
    // For guest users or if backend fails, use localStorage
    try {
      const localWishlist = localStorage.getItem('wishlist');
      if (localWishlist) {
        const productIds = JSON.parse(localWishlist);
        // Convert IDs to wishlist items (for display only)
        const guestWishlist = productIds.map((id: number) => ({
          id: Date.now() + Math.random(),
          productId: id,
          productName: `Product ${id}`,
          productImage: '',
          productPrice: 0,
          productDiscountPrice: 0,
        }));
        setWishlist(guestWishlist);
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error('Failed to load wishlist from localStorage:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: number) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Remove from backend
      try {
        await wishlistAPI.remove(productId);
      } catch (err: any) {
        console.error(err);
        toast.addToast(err.response?.data?.message || 'Failed to remove from wishlist.', 'error');
        return;
      }
    }
    
    // Always remove from localStorage (for guests and sync)
    const localWishlist = localStorage.getItem('wishlist');
    if (localWishlist) {
      const productIds = JSON.parse(localWishlist);
      const updated = productIds.filter((id: number) => id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    }
    
    // Update UI
    setWishlist((prev) => prev.filter((item) => item.productId !== productId));
    
    // Dispatch custom event to update navbar
    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
  };

  const moveToCart = async (productId: number) => {
    try {
      await cartAPI.add(productId, 1);
      await removeFromWishlist(productId);
      toast.addToast('Moved to cart!', 'success');
    } catch (err: any) {
      console.error(err);
      toast.addToast(err.response?.data?.message || 'Failed to move to cart.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="wishlist-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page">
        <div className="wishlist-empty-container">
          <div className="empty-wishlist-content">
            {/* Heart Icon Animation */}
            <div className="empty-heart-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            
            <h1>Your Wishlist is Empty</h1>
            
            <p className="empty-subtitle">
              Looks like you haven't added anything to your wishlist yet. 
              Start exploring and save the products you love!
            </p>
            
            <div className="empty-actions">
              <Link to="/products" className="explore-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                Explore Products
              </Link>
              
              <Link to="/" className="home-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Go to Home
              </Link>
            </div>
            
            {/* Feature Highlights */}
            <div className="wishlist-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <h3>Save Favorites</h3>
                <p>Keep track of products you love</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </div>
                <h3>Quick Access</h3>
                <p>Easy checkout when you're ready</p>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3>Price Alerts</h3>
                <p>Get notified about price drops</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>My Wishlist</h1>
        <p className="wishlist-count">{wishlist.length} items</p>
      </div>
      
      <div className="wishlist-container">
        <div className="wishlist-list">
          {wishlist.map((item) => (
            <div key={item.id} className="wishlist-card-amazon">
              <div className="amazon-card-row">
                {/* Left Section - Image */}
                <div className="product-image-section">
                  <Link to={`/products/${item.productId}`}>
                    <img src={item.productImage || 'https://via.placeholder.com/180x180'} alt={item.productName} />
                  </Link>
                </div>
                
                {/* Middle Section - Info */}
                <div className="product-info-section">
                  <div className="product-details">
                    <Link to={`/products/${item.productId}`} className="product-title">
                      {item.productName}
                    </Link>
                    
                    {item.productDiscountPrice && (
                      <div className="price-section">
                        <span className="current-price">₹{item.productDiscountPrice.toFixed(2)}</span>
                        <span className="original-price">₹{item.productPrice.toFixed(2)}</span>
                        <span className="discount-percent">
                          {Math.round((1 - item.productDiscountPrice / item.productPrice) * 100)}% off
                        </span>
                      </div>
                    )}
                    
                    {!item.productDiscountPrice && (
                      <div className="price-section">
                        <span className="current-price">₹{item.productPrice.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right Section - Actions */}
                <div className="product-actions-section">
                  <button 
                    className="move-to-cart-btn-amazon"
                    onClick={() => moveToCart(item.productId)}
                    title="Move to Cart"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <circle cx="9" cy="21" r="1"/>
                      <circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    Move to Cart
                  </button>
                  
                  <button 
                    className="delete-btn-amazon"
                    onClick={() => removeFromWishlist(item.productId)}
                    title="Delete Item"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

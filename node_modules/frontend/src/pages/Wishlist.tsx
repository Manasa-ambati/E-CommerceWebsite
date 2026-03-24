// src/pages/Wishlist.tsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wishlistAPI, cartAPI } from '../services/api';
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
        alert(err.response?.data?.message || 'Failed to remove from wishlist.');
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
  };

  const moveToCart = async (productId: number) => {
    try {
      await cartAPI.add(productId, 1);
      await removeFromWishlist(productId);
      alert('Moved to cart!');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to move to cart.');
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
        <div className="wishlist-container">
          <div className="wishlist-empty">
            <h2>Your Wishlist is Empty</h2>
            <p>Start adding products to build your wishlist!</p>
            <Link to="/products">Explore Products</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <h1>My Wishlist</h1>
        
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <div key={item.id} className="wishlist-card">
              <div className="wishlist-image">
                <Link to={`/products/${item.productId}`}>
                  <img src={item.productImage} alt={item.productName} />
                </Link>
              </div>
              
              <div className="wishlist-info">
                <h3>{item.productName}</h3>
                
                <div className="wishlist-price">
                  {item.productDiscountPrice ? (
                    <>
                      <span className="current-price">${item.productDiscountPrice}</span>
                      <span className="original-price">${item.productPrice}</span>
                    </>
                  ) : (
                    <span className="current-price">${item.productPrice}</span>
                  )}
                </div>
                
                <div className="wishlist-actions">
                  <button 
                    className="move-to-cart-btn"
                    onClick={() => moveToCart(item.productId)}
                  >
                    Move to Cart
                  </button>
                  <button 
                    className="remove-btn"
                    onClick={() => removeFromWishlist(item.productId)}
                  >
                    Remove
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

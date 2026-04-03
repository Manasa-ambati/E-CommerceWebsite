// src/pages/Cart.tsx
import React, { useEffect, useState } from 'react';
import { cartAPI, wishlistAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import '../pages/Cart.css'

interface CartItem {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  productPrice?: number;  // Backend might return this
  discountPrice?: number; // Or this
}

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cart: contextCart, 
    fetchCart: refreshCartContext, 
    clearCart: clearCartContext, 
    removeFromCart: removeFromCartContext,
    loading: contextLoading 
  } = useCart(); // Use CartContext
  const toast = useToast();
  
  // Use CartContext's cart data, transform to match Cart.tsx interface
  const [cart, setCart] = useState<CartItem[]>([]);
  const hasInitialized = React.useRef(false); // Track if we've loaded cart initially

  // Initial load only - fetch cart from context ONCE
  useEffect(() => {
    if (!hasInitialized.current && contextCart && contextCart.items) {
      const items = Array.isArray(contextCart.items) ? contextCart.items : [];
      const mappedItems = items.map((item: any) => ({
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        price: item.productDiscountPrice || item.productPrice || item.price || 0,
        productPrice: item.productPrice,
        discountPrice: item.discountPrice
      }));
      setCart(mappedItems);
      hasInitialized.current = true; // Mark as initialized
    } else if (!contextCart && !hasInitialized.current) {
      setCart([]);
      hasInitialized.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    // Cart data is already loaded from context in the initial useEffect
    // No need to call refreshCartContext() here
    
    // Add event listener for when returning to this page
    const handleFocus = () => {
      console.log('👁️ Cart page focused');
      // Don't refresh - keep local state to prevent removed items from coming back
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Listen for custom cart update events
    const handleCartUpdate = () => {
      console.log('🔄 Cart update event received (navbar updated)');
      // Don't call refreshCartContext() - local state is source of truth
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    // Don't refresh when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ Tab became visible - keeping current state');
        // Don't refresh - keep local state intact
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveToWishlist = async (productId: number) => {
    const token = localStorage.getItem('token');
    
    try {
      // Add to wishlist
      if (token) {
        await wishlistAPI.add(productId);
      } else {
        // For guest users, use localStorage
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (!wishlist.includes(productId)) {
          wishlist.push(productId);
          localStorage.setItem('wishlist', JSON.stringify(wishlist));
        }
      }
      
      // Remove from cart using CartContext
      await removeFromCartContext(productId);
      
      // Update local state
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      
      toast.addToast('Moved to wishlist successfully!', 'success');
      
      // Dispatch event to update navbar wishlist count
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (err: any) {
      console.error('Failed to move to wishlist:', err);
      toast.addToast(err.response?.data?.message || 'Failed to move to wishlist.', 'error');
    }
  };

  const handleClearCart = async () => {
    try {
      // Use CartContext's clearCart function which handles both backend and localStorage
      await clearCartContext();
      
      // Update local state
      setCart([]);
      
      toast.addToast('Cart cleared successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      toast.addToast(err.response?.data?.message || 'Failed to clear cart.', 'error');
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const token = localStorage.getItem('token');
    
    if (token) {
      // Update backend
      try {
        await cartAPI.update(productId, newQuantity);
      } catch (err: any) {
        console.error(err);
        toast.addToast(err.response?.data?.message || 'Failed to update quantity.', 'error');
        return;
      }
    }
    
    // Always update localStorage (for guests and sync)
    const localCart = localStorage.getItem('guest_cart');
    if (localCart) {
      const cartData = JSON.parse(localCart);
      const updatedItems = (cartData.items || []).map((item: any) => 
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );
      cartData.items = updatedItems;
      localStorage.setItem('guest_cart', JSON.stringify(cartData));
    }
    
    // Update UI
    setCart((prev) => prev.map((item) => 
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleRemove = async (productId: number) => {
    try {
      // First remove from UI immediately for better UX
      setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
      
      // Then call context to persist removal (backend + localStorage)
      await removeFromCartContext(productId);
      
      toast.addToast('Item removed from cart', 'success');
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.addToast('Failed to remove item. Please try again.', 'error');
      // Don't refresh - just show error. User can manually refresh if needed.
    }
  };

  if (contextLoading) {
    return (
      <div className="cart-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }
  
  // Empty cart check
  if (!cart || cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <div className="cart-empty">
            <h2>Your Shopping Cart is Empty</h2>
            <p>Add some products to see them here!</p>
            <Link to="/products">Start Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header-section">
        <div className="cart-header-content">
          <h1>My Cart</h1>
          <p className="cart-items-count">{cart.length} Items</p>
        </div>
      </div>
      
      <div className="cart-container">
        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items-section">
            <div className="cart-header-actions">
              <button className="clear-cart-btn-flipkart" onClick={handleClearCart}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Remove All
              </button>
            </div>
            
            <div className="cart-items-list">
              {Array.isArray(cart) && cart.map((item) => (
                <div key={item.productId} className="cart-item-flipkart">
                  <div className="item-row">
                    {/* Left Section - Image */}
                    <div className="item-image-section">
                      <Link to={`/products/${item.productId}`}>
                        <img src={item.productImage || 'https://via.placeholder.com/200x200'} alt={item.productName} />
                      </Link>
                    </div>
                    
                    {/* Middle Section - Details */}
                    <div className="item-details-section">
                      <Link to={`/products/${item.productId}`} className="product-title-link">
                        {item.productName}
                      </Link>
                      
                      <div className="product-meta">
                        {item.quantity > 0 && (
                          <span className="qty-badge">Qty: {item.quantity}</span>
                        )}
                      </div>
                      
                      <div className="price-section">
                        {item.discountPrice ? (
                          <>
                            <span className="current-price">₹{item.discountPrice.toFixed(2)}</span>
                            <span className="original-price">₹{item.productPrice?.toFixed(2) || item.price.toFixed(2)}</span>
                            <span className="discount-badge">
                              {Math.round((1 - item.discountPrice / (item.productPrice || item.price)) * 100)}% OFF
                            </span>
                          </>
                        ) : (
                          <span className="current-price">₹{item.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Right Section - Actions */}
                    <div className="item-actions-section">
                      <div className="quantity-controls">
                        <button 
                          className="qty-btn" 
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button 
                          className="qty-btn" 
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                        </button>
                      </div>
                      
                      <div className="action-buttons">
                        <button 
                          className="wishlist-btn-flipkart" 
                          onClick={() => moveToWishlist(item.productId)}
                          title="Move to Wishlist"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                          Save for later
                        </button>
                        
                        <button 
                          className="remove-btn-flipkart" 
                          onClick={() => handleRemove(item.productId)}
                          title="Remove Item"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Section - Subtotal */}
                  <div className="item-subtotal-section">
                    <span className="subtotal-label">Subtotal:</span>
                    <span className="subtotal-amount">
                      ₹{(Number(item.discountPrice || item.productPrice || item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Cart Summary Box */}
          <div className="cart-summary-box">
            <h2>Order Summary</h2>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{cart.reduce((sum, item) => sum + (Number(item.discountPrice || item.productPrice || item.price) * item.quantity), 0).toFixed(2)}</span>
              </div>
              
              <div className="summary-row">
                <span>Shipping</span>
                <span className="free-shipping">FREE</span>
              </div>
              
              <div className="summary-row discount-row">
                <span>GST</span>
                <span>Included in MRPs</span>
              </div>
            </div>
            
            <div className="summary-total">
              <div className="total-row">
                <span>Total Amount</span>
                <span>₹{cart.reduce((sum, item) => sum + (Number(item.discountPrice || item.productPrice || item.price) * item.quantity), 0).toFixed(2)}</span>
              </div>
            </div>
            
            <button className="checkout-btn-flipkart" onClick={() => navigate('/checkout')}>
              Place Order
            </button>
            
            <div className="features-list">
              <div className="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>Secure Checkout</span>
              </div>
              <div className="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Easy Returns</span>
              </div>
            </div>
            
            <Link to="/products" className="continue-shopping-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

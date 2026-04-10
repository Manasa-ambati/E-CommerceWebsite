// src/pages/Cart.tsx
import React, { useEffect } from 'react';
import { cartAPI, wishlistAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import BackButton from '../components/BackButton';
import '../pages/Cart.css'

interface CartItem {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  productPrice?: number;
  discountPrice?: number;
}

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { 
    cart: contextCart, 
    fetchCart: refreshCartContext, 
    clearCart: clearCartContext, 
    removeFromCart: removeFromCartContext,
    loading: contextLoading 
  } = useCart();
  const toast = useToast();
  
  // Direct mapping from context - no local state needed
  const cartItems: CartItem[] = contextCart?.items?.map((item: any) => ({
    productId: item.productId,
    productName: item.productName,
    productImage: item.productImage,
    quantity: item.quantity,
    price: item.productDiscountPrice || item.productPrice || item.price || 0,
    productPrice: item.productPrice,
    discountPrice: item.discountPrice
  })) || [];

  // Helper function to get the correct price for an item
  const getItemPrice = (item: CartItem): number => {
    return item.price || item.discountPrice || item.productPrice || 0;
  };

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
      
      toast.addToast('Cart cleared successfully!', 'success');
    } catch (err: any) {
      console.error(err);
      toast.addToast(err.response?.data?.message || 'Failed to clear cart.', 'error');
    }
  };

  const updateQuantity = async (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const token = localStorage.getItem('token');
    
    try {
      if (token) {
        // Update backend for logged-in users (don't wait for it)
        cartAPI.update(productId, newQuantity).catch(err => {
          console.error('Failed to sync quantity with backend:', err);
        });
      } else {
        // For guest users, update localStorage
        const localCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');
        const updatedCart = localCart.map((item: any) => 
          item.productId === productId ? { ...item, quantity: newQuantity } : item
        );
        localStorage.setItem('guest_cart', JSON.stringify(updatedCart));
      }
      
      // Dispatch event to update navbar cart count
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (err: any) {
      console.error('Failed to update quantity:', err);
      // Don't show error toast for background sync failures
    }
  };

  const handleBuyNow = async (productId: number) => {
    try {
      // Navigate to checkout with specific product
      navigate('/checkout', { state: { buyNowProductId: productId } });
    } catch (err: any) {
      console.error('Buy now error:', err);
      toast.addToast('Failed to proceed to checkout', 'error');
    }
  };

  const handleRemove = async (productId: number) => {
    console.log('🗑️ Removing product ID:', productId);
    
    // Find the item to be removed
    const itemToRemove = cartItems.find(item => item.productId === productId);
    if (!itemToRemove) {
      toast.addToast('Item not found in cart', 'error');
      return;
    }
    
    try {
      // Optimistically update UI immediately
      const updatedItems = cartItems.filter(item => item.productId !== productId);
      
      // Call context to persist removal (backend + localStorage)
      await removeFromCartContext(productId);
      console.log('✅ removeFromCartContext completed');
      console.log('💾 Item removed successfully');
      
      // Force refresh cart from context to ensure sync
      await refreshCartContext();
      
      toast.addToast('Item removed from cart', 'success');
    } catch (error: any) {
      console.error('❌ Failed to remove item:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.addToast(error.response?.data?.message || 'Failed to remove item. Please try again.', 'error');
      
      // Refresh cart to restore correct state if removal failed
      await refreshCartContext();
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
  if (!cartItems || cartItems.length === 0) {
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
      <BackButton fallbackPath="/products" />
      
      <div className="cart-header">
        <h1>My Cart</h1>
        <p className="cart-items-count">{cartItems.length} Items</p>
      </div>
      
      <div className="cart-container">
        <div className="cart-content">
          {/* Cart Items - Product Details First */}
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
              {cartItems.map((item) => (
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
                        <span className="current-price">₹{getItemPrice(item).toFixed(2)}</span>
                        {(item.productPrice || item.price) > getItemPrice(item) && (
                          <span className="original-price">₹{(item.productPrice || item.price).toFixed(2)}</span>
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
                          className="buy-now-btn-cart" 
                          onClick={() => handleBuyNow(item.productId)}
                          title="Buy This Item Now"
                        >
                          ⚡ Buy Now
                        </button>
                        
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
                      ₹{(getItemPrice(item) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

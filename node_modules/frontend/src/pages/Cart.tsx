// src/pages/Cart.tsx
import React, { useEffect, useState } from 'react';
import { cartAPI, wishlistAPI } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
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
  const { fetchCart: refreshCartContext } = useCart(); // Use CartContext
  const toast = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchCart();
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
      
      // Remove from cart
      await removeFromCart(productId);
      
      toast.addToast('Moved to wishlist successfully!', 'success');
      
      // Dispatch event to update navbar wishlist count
      window.dispatchEvent(new CustomEvent('wishlistUpdated'));
    } catch (err: any) {
      console.error('Failed to move to wishlist:', err);
      toast.addToast(err.response?.data?.message || 'Failed to move to wishlist.', 'error');
    }
  };

  const fetchCart = async () => {
    setLoading(true);
    setError('');
    
    const token = localStorage.getItem('token');
    
    // If user is logged in, fetch from backend
    if (token) {
      try {
        const response = await cartAPI.get();
        console.log('Cart API response:', response.data);
        
        // Backend returns: { success: true, data: { items: [...] } } or { success: true, data: [...] }
        let cartItems = [];
        if (Array.isArray(response.data.data)) {
          cartItems = response.data.data;
        } else if (response.data.data && Array.isArray(response.data.data.items)) {
          cartItems = response.data.data.items;
        } else if (response.data.data && typeof response.data.data === 'object') {
          // Single item or empty object
          cartItems = [response.data.data];
        }
        
        // Map backend fields to frontend interface
        const mappedCartItems = cartItems.map((item: any) => ({
          ...item,
          price: item.productPrice || item.discountPrice || item.price || 0
        }));
        
        setCart(Array.isArray(mappedCartItems) ? mappedCartItems : []);
        setLoading(false);
        return;
      } catch (err: any) {
        console.error('Backend cart error:', err);
        // Fall back to localStorage if backend fails
      }
    }
    
    // For guest users or if backend fails, use localStorage
    try {
      const localCart = localStorage.getItem('guest_cart');
      if (localCart) {
        const cartData = JSON.parse(localCart);
        // guest_cart structure: { id: number, items: [...], totalPrice: number, totalItems: number }
        if (cartData && Array.isArray(cartData.items)) {
          // Map localStorage fields to frontend interface
          const mappedCartItems = cartData.items.map((item: any) => ({
            ...item,
            price: item.productPrice || item.productDiscountPrice || item.price || 0
          }));
          setCart(mappedCartItems);
        } else {
          setCart([]);
        }
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      setCart([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Clear from backend if authenticated
      if (token) {
        await cartAPI.clear();
      }
      
      // Always clear from localStorage (for guests and sync)
      localStorage.removeItem('guest_cart');
      
      // Update local state
      setCart([]);
      
      // Refresh CartContext to update navbar
      await refreshCartContext();
      
      // Dispatch custom event for extra safety
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
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

  const removeFromCart = async (productId: number) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Remove from backend
      try {
        await cartAPI.remove(productId);
        console.log('✅ Removed from backend cart');
      } catch (err: any) {
        console.error(err);
        toast.addToast(err.response?.data?.message || 'Failed to remove from cart.', 'error');
        return;
      }
    }
    
    // Always remove from localStorage (for guests and sync)
    const localCart = localStorage.getItem('guest_cart');
    if (localCart) {
      const cartData = JSON.parse(localCart);
      const updatedItems = (cartData.items || []).filter((item: any) => item.productId !== productId);
      cartData.items = updatedItems;
      cartData.totalItems = updatedItems.length;
      // Recalculate total price
      cartData.totalPrice = updatedItems.reduce((sum: number, item: any) => 
        sum + (Number(item.productPrice || item.price) * item.quantity), 0
      );
      localStorage.setItem('guest_cart', JSON.stringify(cartData));
      console.log('✅ Updated guest_cart in localStorage');
    }
    
    // Update UI immediately
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    
    // Show success message
    toast.addToast('Item removed from cart', 'success');
    
    // Refresh CartContext to update navbar count
    await refreshCartContext();
    
    // Dispatch custom event for extra safety
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    
    console.log('✅ Cart removal complete');
  };

  if (loading) {
    return (
      <div className="cart-page">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="cart-page">
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
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
      <div className="cart-container">
        <h1>Shopping Cart</h1>
        
        <div className="cart-header-actions">
          <button className="clear-cart-btn" onClick={handleClearCart}>
            Clear Cart
          </button>
        </div>
        
        <div className="cart-content">
          {/* Cart Items */}
          <div className="cart-items">
            {Array.isArray(cart) && cart.map((item) => (
              <div key={item.productId} className="cart-item">
                <div className="item-image">
                  <Link to={`/products/${item.productId}`}>
                    <img src={item.productImage} alt={item.productName} />
                  </Link>
                </div>
                
                <div className="item-details">
                  <h3>{item.productName}</h3>
                  <div className="item-price">
                    <span className="current-price">${Number(item.price).toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="item-quantity">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                </div>
                
                <div className="item-subtotal">
                  ${(Number(item.price) * item.quantity).toFixed(2)}
                </div>
                
                <div className="item-actions">
                  <button 
                    className="wishlist-move-btn" 
                    onClick={() => moveToWishlist(item.productId)}
                    title="Move to Wishlist"
                  >
                    ❤️ Move to Wishlist
                  </button>
                  <button 
                    className="remove-text-btn" 
                    onClick={() => removeFromCart(item.productId)}
                    title="Remove item"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Cart Summary */}
          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toFixed(2)}</span>
            </div>
            <button className="checkout-btn" onClick={() => navigate('/checkout')}>
              Proceed to Checkout
            </button>
            <Link to="/products" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
      

    </div>
  );
};

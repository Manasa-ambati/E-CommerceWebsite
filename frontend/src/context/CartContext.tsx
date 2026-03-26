import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartAPI } from '../services/api';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  productDiscountPrice: number;
  quantity: number;
  subtotal: number;
  stockQuantity: number;
}

interface Cart {
  id: number;
  items: CartItem[];
  totalPrice: number;
  totalItems: number;
}

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateCartItem: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    // Try to fetch from backend first (if authenticated)
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        setLoading(true);
        const response = await cartAPI.get();
        // Ensure data exists and has items array
        if (response.data && response.data.data) {
          const cartData = response.data.data;
          if (cartData.items && Array.isArray(cartData.items)) {
            setCart(cartData);
          } else {
            setCart({ id: 0, items: [], totalPrice: 0, totalItems: 0 });
          }
        } else {
          setCart({ id: 0, items: [], totalPrice: 0, totalItems: 0 });
        }
        setLoading(false);
        return;
      } catch (error) {
        console.log('Backend cart not available, using local storage');
      }
    }
    
    // Fallback to localStorage for guest users
    try {
      setLoading(true);
      const localCart = localStorage.getItem('guest_cart');
      if (localCart) {
        const parsedCart = JSON.parse(localCart);
        if (parsedCart && parsedCart.items && Array.isArray(parsedCart.items)) {
          setCart(parsedCart);
        } else {
          setCart({ id: 0, items: [], totalPrice: 0, totalItems: 0 });
        }
      } else {
        setCart({ id: 0, items: [], totalPrice: 0, totalItems: 0 });
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
      setCart({ id: 0, items: [], totalPrice: 0, totalItems: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId: number, quantity: number = 1) => {
    const token = localStorage.getItem('token');
    
    // If authenticated, use backend
    if (token) {
      try {
        setLoading(true);
        const response = await cartAPI.add(productId, quantity);
        setCart(response.data.data);
        setLoading(false);
        return;
      } catch (error: any) {
        console.log('Backend add failed, using localStorage');
      }
    }
    
    // Fallback to localStorage for guest users
    try {
      setLoading(true);
      const localCart = localStorage.getItem('guest_cart');
      let cartData: Cart = localCart ? JSON.parse(localCart) : {
        id: Date.now(),
        items: [],
        totalPrice: 0,
        totalItems: 0
      };
      
      // Add or update item - for demo use minimal data
      const existingItemIndex = cartData.items.findIndex(item => item.productId === productId);
      if (existingItemIndex > -1) {
        cartData.items[existingItemIndex].quantity += quantity;
      } else {
        cartData.items.push({
          id: Date.now(),
          productId,
          productName: `Product ${productId}`,
          productImage: '',
          productPrice: 0,
          productDiscountPrice: 0,
          quantity,
          subtotal: 0,
          stockQuantity: 0
        });
      }
      
      cartData.totalItems = cartData.items.reduce((sum, item) => sum + item.quantity, 0);
      cartData.totalPrice = cartData.items.reduce((sum, item) => sum + item.subtotal, 0);
      
      localStorage.setItem('guest_cart', JSON.stringify(cartData));
      setCart(cartData);
      setLoading(false);
    } catch (error) {
      console.error('Failed to add to localStorage cart:', error);
      throw new Error('Failed to add to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (productId: number, quantity: number) => {
    try {
      setLoading(true);
      const response = await cartAPI.update(productId, quantity);
      setCart(response.data.data);
      
      // Dispatch custom event to update navbar
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to update cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: number) => {
    try {
      setLoading(true);
      const response = await cartAPI.remove(productId);
      setCart(response.data.data);
      
      // Dispatch custom event to update navbar
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartAPI.clear();
      setCart(null);
      
      // Also clear localStorage for guests
      localStorage.removeItem('guest_cart');
      
      // Dispatch custom event to update navbar
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: cart?.totalItems || 0,
        loading,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

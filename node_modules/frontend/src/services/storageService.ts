// src/services/storageService.ts

/**
 * LocalStorage Service for managing key-value pairs
 * Stores user preferences, cart data, and other client-side data
 */

const STORAGE_PREFIX = 'ecommerce_';

export const storageService = {
  /**
   * Set a value in localStorage with optional expiry
   */
  set(key: string, value: any, expiryMinutes?: number): void {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        expiry: expiryMinutes ? Date.now() + (expiryMinutes * 60 * 1000) : null
      };
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(item));
      console.log(`✅ Stored in localStorage: ${key}`, value);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  /**
   * Get a value from localStorage
   */
  get(key: string): any {
    try {
      const itemStr = localStorage.getItem(STORAGE_PREFIX + key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      
      // Check if expired
      if (item.expiry && Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  /**
   * Remove a value from localStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
      console.log(`🗑️ Removed from localStorage: ${key}`);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },

  /**
   * Clear all ecommerce-related items from localStorage
   */
  clear(): void {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      console.log('🧹 Cleared all ecommerce localStorage items');
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },

  /**
   * Check if a key exists in localStorage
   */
  has(key: string): boolean {
    try {
      const item = this.get(key);
      return item !== null;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get all keys in localStorage
   */
  getAllKeys(): string[] {
    try {
      const keys: string[] = [];
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          keys.push(key.replace(STORAGE_PREFIX, ''));
        }
      });
      return keys;
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  },

  /**
   * Store user preferences
   */
  setUserPreferences(prefs: {
    theme?: 'light' | 'dark';
    language?: string;
    currency?: string;
    [key: string]: any;
  }): void {
    this.set('user_preferences', prefs);
  },

  /**
   * Get user preferences
   */
  getUserPreferences(): any {
    return this.get('user_preferences');
  },

  /**
   * Store cart data temporarily
   */
  setCartData(cartData: any): void {
    this.set('cart_data', cartData, 1440); // 24 hours expiry
  },

  /**
   * Get cart data
   */
  getCartData(): any {
    return this.get('cart_data');
  },

  /**
   * Store browsing history
   */
  addToHistory(productId: string): void {
    const history = this.get('browsing_history') || [];
    if (!history.includes(productId)) {
      history.unshift(productId);
      if (history.length > 50) history.pop(); // Keep last 50 items
      this.set('browsing_history', history);
    }
  },

  /**
   * Get browsing history
   */
  getHistory(): string[] {
    return this.get('browsing_history') || [];
  }
};

// Export individual functions for convenience
export const { set, get, remove, clear, has } = storageService;

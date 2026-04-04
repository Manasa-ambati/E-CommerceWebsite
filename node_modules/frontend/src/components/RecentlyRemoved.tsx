import React, { useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import './RecentlyRemoved.css';

interface RemovedItem {
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  productDiscountPrice?: number;
  quantity: number;
  removedAt: number;
}

const RecentlyRemoved: React.FC = () => {
  const [removedItems, setRemovedItems] = useState<RemovedItem[]>([]);
  const toast = useToast();

  // Load removed items from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recently_removed_items');
    if (saved) {
      try {
        const items = JSON.parse(saved);
        // Filter out items older than 1 hour (Meesho style - short duration)
        const now = Date.now();
        const validItems = items.filter((item: RemovedItem) => 
          now - item.removedAt < 60 * 60 * 1000 // 1 hour
        );
        setRemovedItems(validItems);
        localStorage.setItem('recently_removed_items', JSON.stringify(validItems));
      } catch (e) {
        console.error('Failed to parse removed items:', e);
      }
    }
  }, []);

  // Listen for removed item events
  useEffect(() => {
    const handleItemRemoved = (event: CustomEvent) => {
      const item = event.detail;
      setRemovedItems(prev => {
        const updated = [item, ...prev].slice(0, 3); // Keep only last 3 items (Meesho style)
        localStorage.setItem('recently_removed_items', JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('itemRemovedFromCart' as any, handleItemRemoved as any);
    return () => {
      window.removeEventListener('itemRemovedFromCart' as any, handleItemRemoved as any);
    };
  }, []);

  const handlePutBack = async (item: RemovedItem) => {
    try {
      await cartAPI.update(item.productId, item.quantity);
      
      // Remove from recently removed list
      setRemovedItems(prev => {
        const updated = prev.filter(i => i.productId !== item.productId);
        localStorage.setItem('recently_removed_items', JSON.stringify(updated));
        return updated;
      });
      
      toast.addToast(`${item.productName} added back to cart!`, 'success');
      
      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (error: any) {
      console.error('Failed to put back item:', error);
      toast.addToast(error.response?.data?.message || 'Failed to add item back', 'error');
    }
  };

  const handleDismiss = (productId: number) => {
    setRemovedItems(prev => {
      const updated = prev.filter(i => i.productId !== productId);
      localStorage.setItem('recently_removed_items', JSON.stringify(updated));
      return updated;
    });
  };

  if (removedItems.length === 0) {
    return null;
  }

  return (
    <div className="recentlyremoved-banner">
      <div className="recentlyremoved-content">
        <span className="recentlyremoved-icon">↩️</span>
        <div className="recentlyremoved-items-inline">
          {removedItems.map((item) => (
            <div key={item.productId} className="recentlyremoved-chip">
              <img 
                src={item.productImage || 'https://via.placeholder.com/40x40'} 
                alt={item.productName}
                className="recentlyremoved-chip-image"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40';
                }}
              />
              <span className="recentlyremoved-chip-name">{item.productName}</span>
              <button 
                className="putback-inline-btn"
                onClick={() => handlePutBack(item)}
              >
                Put Back
              </button>
              <button 
                className="dismiss-btn"
                onClick={() => handleDismiss(item.productId)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentlyRemoved;

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
        // Filter out items older than 24 hours
        const now = Date.now();
        const validItems = items.filter((item: RemovedItem) => 
          now - item.removedAt < 24 * 60 * 60 * 1000
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
        const updated = [item, ...prev].slice(0, 5); // Keep only last 5 items
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

  const handleRemovePermanently = (productId: number) => {
    setRemovedItems(prev => {
      const updated = prev.filter(i => i.productId !== productId);
      localStorage.setItem('recently_removed_items', JSON.stringify(updated));
      return updated;
    });
    toast.addToast('Item removed from history', 'info');
  };

  if (removedItems.length === 0) {
    return null;
  }

  return (
    <div className="recentlyremoved-container">
      <div className="recentlyremoved-header">
        <h3>🔄 Recently Removed</h3>
        <span className="recentlyremoved-count">{removedItems.length} item(s)</span>
      </div>
      
      <div className="recentlyremoved-items">
        {removedItems.map((item) => (
          <div key={item.productId} className="recentlyremoved-item">
            <img 
              src={item.productImage || 'https://via.placeholder.com/80x80'} 
              alt={item.productName}
              className="recentlyremoved-image"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80';
              }}
            />
            
            <div className="recentlyremoved-details">
              <h4 className="recentlyremoved-name">{item.productName}</h4>
              <p className="recentlyremoved-price">
                {item.productDiscountPrice ? (
                  <>
                    <span className="discounted">₹{item.productDiscountPrice.toFixed(2)}</span>
                    <span className="original">₹{item.productPrice.toFixed(2)}</span>
                  </>
                ) : (
                  <span>₹{item.productPrice.toFixed(2)}</span>
                )}
              </p>
              <p className="recentlyremoved-qty">Qty: {item.quantity}</p>
            </div>
            
            <div className="recentlyremoved-actions">
              <button 
                className="putback-btn"
                onClick={() => handlePutBack(item)}
                title="Add back to cart"
              >
                ↩️ Put Back
              </button>
              <button 
                className="remove-permanent-btn"
                onClick={() => handleRemovePermanently(item.productId)}
                title="Remove from history"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentlyRemoved;

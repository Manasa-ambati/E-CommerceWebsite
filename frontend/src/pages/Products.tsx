import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productAPI, categoryAPI, cartAPI, wishlistAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import BackButton from '../components/BackButton';
import './Products.css';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  categoryId: number;
  categoryName: string;
}

interface Category {
  id: number;
  name: string;
}

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [wishlistItems, setWishlistItems] = useState<number[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    priceRange: true,
    sortBy: true
  });
  const { addToCart: addCart, fetchCart } = useCart();
  const toast = useToast();
  
  const page = parseInt(searchParams.get('page') || '0');
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortDir = searchParams.get('sortDir') || 'desc';

  useEffect(() => {
    // Load wishlist on mount
    const loadWishlist = async () => {
      try {
        const response = await wishlistAPI.get();
        if (response.data && response.data.data) {
          setWishlistItems(response.data.data.map((item: any) => item.id));
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      }
    };
    
    loadWishlist();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching products with params:', { page, search, categoryId, minPrice, maxPrice, sortBy, sortDir });
        
        const [productsRes, categoriesRes] = await Promise.all([
          productAPI.filter({
            page,
            size: 12,
            categoryId: categoryId ? Number(categoryId) : undefined,
            minPrice: minPrice ? Number(minPrice) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            search: search || undefined,
            sortBy,
            sortDir,
          }),
          categoryAPI.getAll(),
        ]);
        
        console.log('Products response:', productsRes.data);
        console.log('Categories response:', categoriesRes.data);
        
        const productsData = productsRes.data.data;
        const categoriesData = categoriesRes.data.data;
        
        if (!productsData) {
          console.error('No products data in response!');
          setProducts([]);
        } else {
          setProducts(productsData.content || []);
          setTotalPages(productsData.totalPages || 0);
        }
        
        if (!categoriesData) {
          console.error('No categories data in response!');
          setCategories([]);
        } else {
          setCategories(categoriesData);
        }
      } catch (error: any) {
        console.error('Failed to fetch products:', error);
        console.error('Error details:', error.response?.data || error.message);
        console.error('Error status:', error.response?.status);
        console.error('Request URL:', error.config?.url);
        
        let errorMessage = 'Failed to load products. Please check your connection or try again later.';
        
        if (error.response?.status === 404) {
          errorMessage = 'No products found in this category.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        toast.addToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, search, categoryId, minPrice, maxPrice, sortBy, sortDir]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleAddToCart = async (productId: number) => {
    try {
      await addCart(productId, 1);
      toast.addToast('Added to cart successfully!', 'success');
      fetchCart();
    } catch (error: any) {
      console.error('Add to cart error:', error);
      toast.addToast(error.response?.data?.message || 'Failed to add to cart', 'error');
    }
  };

  const handleToggleWishlist = async (productId: number) => {
    try {
      if (wishlistItems.includes(productId)) {
        await wishlistAPI.remove(productId);
        setWishlistItems(prev => prev.filter(id => id !== productId));
        toast.addToast('Removed from wishlist', 'success');
      } else {
        await wishlistAPI.add(productId);
        setWishlistItems(prev => [...prev, productId]);
        toast.addToast('Added to wishlist', 'success');
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      toast.addToast(error.response?.data?.message || 'Failed to update wishlist', 'error');
    }
  };

  const handleShare = async (product: Product) => {
    try {
      const shareData = {
        title: product.name,
        text: `Check out ${product.name} - ₹${product.discountPrice || product.price}`,
        url: `${window.location.origin}/product/${product.id}`
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast.addToast('Shared successfully!', 'success');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.addToast('Link copied to clipboard!', 'success');
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Share error:', error);
        toast.addToast('Failed to share', 'error');
      }
    }
  };

  const handleBuyNow = async (productId: number) => {
    try {
      // Add product to cart first
      await addCart(productId, 1);
      fetchCart();
      
      // Navigate to checkout page
      window.location.href = '/checkout';
    } catch (error: any) {
      console.error('Buy now error:', error);
      toast.addToast(error.response?.data?.message || 'Failed to proceed to checkout', 'error');
    }
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-page">
      <BackButton fallbackPath="/" />
      
      {/* Page Header */}
      <div className="products-header">
        <h1>Shop All Products</h1>
        <p>Discover amazing deals on top-quality products</p>
      </div>

      <div className="products-container">
        {/* Sidebar Filters - Enhanced Flipkart Style */}
        <aside className="filters-sidebar">
          <div className="filter-header">
            <h3><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>Filters</h3>
            {(categoryId || minPrice || maxPrice || search) && (
              <button className="clear-all-btn" onClick={() => setSearchParams({})}>
                Clear All
              </button>
            )}
          </div>
          
          {/* Search Filter */}
          {search && (
            <div className="active-filters">
              <div className="filter-chip">
                <span>Search: "{search}"</span>
                <button onClick={() => updateFilter('search', '')}>✕</button>
              </div>
            </div>
          )}

          {/* Category Filter - Enhanced with Accordion */}
          <div className="filter-section">
            <div 
              className="filter-title accordion-header" 
              onClick={() => toggleSection('categories')}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#2874f0" strokeWidth="2" width="18" height="18"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Categories
              </div>
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                width="20" 
                height="20"
                style={{ 
                  transform: expandedSections.categories ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {expandedSections.categories && (
              <div className="category-list">
                <label className={`category-item ${!categoryId ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="category"
                    checked={!categoryId}
                    onChange={() => updateFilter('category', '')}
                  />
                  <span>All Categories</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat.id} className={`category-item ${categoryId === String(cat.id) ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="category"
                      value={cat.id}
                      checked={categoryId === String(cat.id)}
                      onChange={(e) => updateFilter('category', e.target.value)}
                    />
                    <span>{cat.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price Range Filter - Enhanced with Accordion */}
          <div className="filter-section">
            <div 
              className="filter-title accordion-header" 
              onClick={(e) => {
                e.stopPropagation();
                toggleSection('priceRange');
              }}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#2874f0" strokeWidth="2" width="18" height="18"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                Price Range
              </div>
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                width="20" 
                height="20"
                style={{ 
                  transform: expandedSections.priceRange ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {expandedSections.priceRange && (
              <>
                <div className="price-inputs-container">
                  <div className="input-with-symbol">
                    <span className="rupee-symbol">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => {
                        // Allow only digits, no limit on length
                        const value = e.target.value.replace(/\D/g, '');
                        console.log('Min price input:', value);
                        if (value && maxPrice && parseInt(value) > parseInt(maxPrice)) {
                          toast.addToast('Minimum price cannot be greater than maximum price', 'warning');
                          return;
                        }
                        updateFilter('minPrice', value);
                      }}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onKeyDown={(e) => {
                        // Stop propagation for ALL keys
                        e.stopPropagation();
                      }}
                      onKeyPress={(e) => {
                        // Prevent any default behavior
                        e.stopPropagation();
                      }}
                    />
                  </div>
                  
                  <div className="separator-line">
                    <span>to</span>
                  </div>
                  
                  <div className="input-with-symbol">
                    <span className="rupee-symbol">₹</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => {
                        // Allow only digits, no limit on length
                        const value = e.target.value.replace(/\D/g, '');
                        console.log('Max price input:', value);
                        if (value && minPrice && parseInt(value) < parseInt(minPrice)) {
                          toast.addToast('Maximum price cannot be less than minimum price', 'warning');
                          return;
                        }
                        updateFilter('maxPrice', value);
                      }}
                      onFocus={(e) => e.target.select()}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onKeyDown={(e) => {
                        // Stop propagation for ALL keys
                        e.stopPropagation();
                      }}
                      onKeyPress={(e) => {
                        // Prevent any default behavior
                        e.stopPropagation();
                      }}
                    />
                  </div>
                </div>

                {/* Price Range Slider Visualization */}
                <div className="price-slider-visual">
                  <div className="slider-track">
                    <div className="slider-fill" style={{
                      left: minPrice ? `${Math.min(parseFloat(minPrice) / 100, 100)}%` : '0%',
                      right: maxPrice ? `${100 - Math.min(parseFloat(maxPrice) / 10000, 100)}%` : '0%'
                    }}></div>
                  </div>
                  <div className="slider-labels">
                    <span>₹0</span>
                    <span>₹500</span>
                    <span>₹1k</span>
                    <span>₹5k</span>
                    <span>₹10k+</span>
                  </div>
                </div>
                
                {(minPrice || maxPrice) && (
                  <div className="active-filters">
                    <div className="filter-chip">
                      <span>Price: ₹{minPrice || '0'} - ₹{maxPrice || '∞'}</span>
                      <button onClick={() => { updateFilter('minPrice', ''); updateFilter('maxPrice', ''); }}>✕</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sort By Filter - Enhanced with Accordion */}
          <div className="filter-section">
            <div 
              className="filter-title accordion-header" 
              onClick={() => toggleSection('sortBy')}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#2874f0" strokeWidth="2" width="18" height="18"><path d="M3 6h18M6 12h12M9 18h9"/></svg>
                Sort By
              </div>
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                width="20" 
                height="20"
                style={{ 
                  transform: expandedSections.sortBy ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s ease'
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </div>
            {expandedSections.sortBy && (
              <select
                className="sort-select"
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [field, dir] = e.target.value.split('-');
                  updateFilter('sortBy', field);
                  updateFilter('sortDir', dir);
                }}
              >
                <option value="createdAt-desc">⚡ Newest First</option>
                <option value="createdAt-asc">📅 Oldest First</option>
                <option value="price-asc">💰 Price: Low to High</option>
                <option value="price-desc">💎 Price: High to Low</option>
                <option value="name-asc">🔤 Name: A to Z</option>
                <option value="name-desc">🔠 Name: Z to A</option>
                <option value="rating-desc">⭐ Rating: High to Low</option>
              </select>
            )}
          </div>

          {/* Active Filters Summary */}
          {(categoryId || minPrice || maxPrice) && (
            <div className="filter-summary">
              <h4>Active Filters:</h4>
              <div className="summary-list">
                {categoryId && (
                  <div className="summary-item">
                    Category: <strong>{categories.find(c => String(c.id) === categoryId)?.name}</strong>
                  </div>
                )}
                {(minPrice || maxPrice) && (
                  <div className="summary-item">
                    Price: <strong>₹{minPrice || '0'} - ₹{maxPrice || '∞'}</strong>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Products Grid - Enhanced */}
        <div className="products-content">
          {/* Results Header */}
          <div className="results-header">
            {search ? (
              <h2>🔍 Search Results for "{search}"</h2>
            ) : categoryId ? (
              <h2>📦 {categories.find(c => String(c.id) === categoryId)?.name}</h2>
            ) : (
              <h2>All Products</h2>
            )}
            <span className="results-count">{products.length} products found</span>
          </div>
          
          {products.length === 0 ? (
            <div className="no-products">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="64" height="64"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search criteria</p>
              <button className="clear-btn" onClick={() => setSearchParams({})}>Clear All Filters</button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="product-card"
                  >
                    <div className="product-image">
                      <Link to={`/product/${product.id}`}>
                        <img
                          src={product.images?.[0] || 'https://via.placeholder.com/300x300'}
                          alt={product.name}
                        />
                      </Link>
                      {product.discountPrice && (
                        <span className="discount-badge">
                          {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                        </span>
                      )}
                      <button 
                        className="cart-icon-btn" 
                        title="Add to Cart" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCart(product.id);
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="9" cy="21" r="1"/>
                          <circle cx="20" cy="21" r="1"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                      </button>
                      <button 
                        className="share-icon-btn" 
                        title="Share Product" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleShare(product);
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="18" cy="5" r="3"/>
                          <circle cx="6" cy="12" r="3"/>
                          <circle cx="18" cy="19" r="3"/>
                          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                        </svg>
                      </button>
                      <button 
                        className={`wishlist-icon-btn ${wishlistItems.includes(product.id) ? 'active' : ''}`}
                        title={wishlistItems.includes(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'} 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleWishlist(product.id);
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill={wishlistItems.includes(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                      </button>
                    </div>
                    <div className="product-info">
                      <span className="product-category">{product.categoryName}</span>
                      <h3 className="product-name">
                        <Link to={`/product/${product.id}`}>{product.name}</Link>
                      </h3>
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
                        <span className="rating-text">({product.reviewCount})</span>
                      </div>
                      <div className="product-price-section">
                        {product.discountPrice ? (
                          <>
                            <span className="original-price">₹{product.price.toFixed(2)}</span>
                            <span className="discount-price">₹{product.discountPrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="regular-price">₹{product.price.toFixed(2)}</span>
                        )}
                      </div>
                      {/* Buy Now Button - Meesho Style */}
                      <button 
                        className="buy-now-btn"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleBuyNow(product.id);
                        }}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;

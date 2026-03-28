import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productAPI, categoryAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
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
  const toast = useToast();
  
  const page = parseInt(searchParams.get('page') || '0');
  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortDir = searchParams.get('sortDir') || 'desc';

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
        toast.addToast('Failed to load products. Please check your connection or try again later.', 'error');
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

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="products-page">
      <div className="products-container">
        {/* Sidebar Filters */}
        <aside className="filters-sidebar">
          <h3>Filters</h3>
          
          <div className="filter-section">
            <h4>Category</h4>
            <select
              value={categoryId}
              onChange={(e) => updateFilter('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  // Validate: if max exists, min should be less than max
                  if (value && maxPrice && parseFloat(value) > parseFloat(maxPrice)) {
                    toast.addToast('Minimum price cannot be greater than maximum price', 'warning');
                    return;
                  }
                  updateFilter('minPrice', value);
                }}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  const value = e.target.value;
                  // Validate: if min exists, max should be greater than min
                  if (value && minPrice && parseFloat(value) < parseFloat(minPrice)) {
                    toast.addToast('Maximum price cannot be less than minimum price', 'warning');
                    return;
                  }
                  updateFilter('maxPrice', value);
                }}
              />
            </div>
          </div>

          <div className="filter-section">
            <h4>Sort By</h4>
            <select
              value={`${sortBy}-${sortDir}`}
              onChange={(e) => {
                const [field, dir] = e.target.value.split('-');
                updateFilter('sortBy', field);
                updateFilter('sortDir', dir);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>

          {(categoryId || minPrice || maxPrice || search) && (
            <button
              className="clear-filters"
              onClick={() => setSearchParams({})}
            >
              Clear Filters
            </button>
          )}
        </aside>

        {/* Products Grid */}
        <div className="products-content">
          {search && (
            <h2>Search Results for "{search}"</h2>
          )}
          
          {products.length === 0 ? (
            <div className="no-products">No products found</div>
          ) : (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="product-card"
                  >
                    <div className="product-image">
                      <img
                        src={product.images?.[0] || 'https://via.placeholder.com/300x300'}
                        alt={product.name}
                      />
                      {product.discountPrice && (
                        <span className="discount-badge">
                          {Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <div className="product-info">
                      <span className="product-category">{product.categoryName}</span>
                      <h3>{product.name}</h3>
                      <div className="product-price">
                        {product.discountPrice ? (
                          <>
                            <span className="original-price">${product.price}</span>
                            <span className="discount-price">${product.discountPrice}</span>
                          </>
                        ) : (
                          <span>${product.price}</span>
                        )}
                      </div>
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
                        <span>({product.reviewCount})</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    disabled={page === 0}
                    onClick={() => updateFilter('page', String(page - 1))}
                  >
                    Previous
                  </button>
                  <span>Page {page + 1} of {totalPages}</span>
                  <button
                    disabled={page >= totalPages - 1}
                    onClick={() => updateFilter('page', String(page + 1))}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;

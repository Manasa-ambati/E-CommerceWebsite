import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, wishlistAPI, reviewAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  images: string[];
  rating: number;
  reviewCount: number;
  categoryName: string;
  tags: string[];
}

interface Review {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState('');
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingDistribution, setRatingDistribution] = useState<{[key: number]: number}>({1: 0, 2: 0, 3: 0, 4: 0, 5: 0});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        console.log('Fetching product with ID:', id);
        const response = await productAPI.getById(Number(id));
        console.log('Product API response:', response.data);
        
        // Handle different response structures
        let productData = response.data.data || response.data;
        console.log('Product data:', productData);
        
        setProduct(productData);
        
        // Check wishlist status if user is authenticated
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const wishlistRes = await wishlistAPI.check(Number(id));
            setIsInWishlist(wishlistRes.data.data);
          } catch (err) {
            console.log('Wishlist check failed:', err);
          }
          
          // Fetch reviews
          try {
            const reviewsRes = await reviewAPI.getByProduct(Number(id));
            const reviewsData = reviewsRes.data.data || [];
            setReviews(reviewsData);
            
            // Calculate average rating and distribution
            if (reviewsData.length > 0) {
              const totalRating = reviewsData.reduce((sum: number, r: Review) => sum + r.rating, 0);
              setAverageRating(totalRating / reviewsData.length);
              
              const distribution: {[key: number]: number} = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
              reviewsData.forEach((r: Review) => {
                distribution[r.rating] = (distribution[r.rating] || 0) + 1;
              });
              setRatingDistribution(distribution);
            }
          } catch (err) {
            console.log('Reviews fetch failed:', err);
          }
          
          // Check if user has already reviewed
          try {
            const checkRes = await reviewAPI.check(Number(id));
            setHasUserReviewed(checkRes.data.data);
          } catch (err) {
            console.log('Review check failed:', err);
          }
        }
      } catch (error: any) {
        console.error('Failed to fetch product:', error);
        alert(error.response?.data?.message || 'Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Keyboard navigation for image zoom
  useEffect(() => {
    if (!showImageZoom) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePreviousImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'Escape') {
        setShowImageZoom(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showImageZoom]);

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      await addToCart(Number(id), quantity);
      alert('Added to cart!');
    } catch (error) {
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Wishlist action triggered:', { 
        productId: Number(id), 
        isInWishlist, 
        hasToken: !!token,
        token: token ? token.substring(0, 20) + '...' : null 
      });
      
      // Toggle UI immediately for better UX
      setIsInWishlist(!isInWishlist);
      
      if (token) {
        // Logged in user - sync with backend
        try {
          if (isInWishlist) {
            await wishlistAPI.remove(Number(id));
            console.log('Successfully removed from wishlist');
            alert('Removed from wishlist');
          } else {
            console.log('Adding to wishlist, product ID:', Number(id));
            const response = await wishlistAPI.add(Number(id));
            console.log('Wishlist add response:', response);
            alert('Added to wishlist');
          }
        } catch (apiError: any) {
          console.error('Backend wishlist operation failed:', apiError);
          console.error('Error details:', {
            status: apiError.response?.status,
            data: apiError.response?.data,
            message: apiError.response?.data?.message,
            headers: apiError.response?.headers
          });
          
          // Revert UI on error
          setIsInWishlist(isInWishlist);
          
          const errorMsg = apiError.response?.data?.message || apiError.message || 'Backend error';
          alert(`Failed: ${errorMsg}`);
          throw apiError; // Re-throw to main catch
        }
      } else {
        // Guest user - use localStorage only
        let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        
        if (isInWishlist) {
          // Remove from wishlist
          wishlist = wishlist.filter((pid: number) => pid !== Number(id));
          alert('Removed from wishlist');
        } else {
          // Add to wishlist
          wishlist.push(Number(id));
          alert('Added to wishlist');
        }
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        console.log('Guest wishlist updated:', wishlist);
      }
    } catch (error: any) {
      console.error('Wishlist error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        code: error.code
      });
      // Don't show alert here since we already showed it in the inner catch
    }
  };

  const handlePreviousImage = () => {
    if (!product?.images || product.images.length === 0) return;
    setSelectedImage((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!product?.images || product.images.length === 0) return;
    setSelectedImage((prev) => 
      prev === product.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Product',
      text: `Check out ${product?.name} on ShopEase!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('Shared successfully');
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareData.url);
      alert('Link copied to clipboard!');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userRating || userRating === 0) {
      alert('Please select a rating');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to submit a review');
        navigate('/login');
        return;
      }

      await reviewAPI.add(Number(id), {
        rating: userRating,
        comment: reviewComment
      });

      alert('Thank you for your review!');
      setUserRating(0);
      setReviewComment('');
      setShowReviewForm(false);
      
      // Reload reviews
      const reviewsRes = await reviewAPI.getByProduct(Number(id));
      setReviews(reviewsRes.data.data || []);
      
      // Reload product to get updated rating
      const productRes = await productAPI.getById(Number(id));
      setProduct(productRes.data.data);
      
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error">
        <h2>Product Not Found</h2>
        <p>Sorry, the product you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/products')}>Browse Products</button>
      </div>
    );
  }

  const currentPrice = product.discountPrice || product.price;
  const discount = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        {/* Image Gallery */}
        <div className="product-images">
          <div className="main-image" onClick={() => setShowImageZoom(true)}>
            <img
              src={product.images?.[selectedImage] || 'https://via.placeholder.com/500x500'}
              alt={product.name}
              style={{ cursor: 'pointer' }}
            />
            <div className="zoom-hint">Click to enlarge</div>
          </div>
          {product.images?.length > 1 && (
            <div className="thumbnail-list">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  className={selectedImage === index ? 'active' : ''}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <span className="product-category">{product.categoryName}</span>
          <h1>{product.name}</h1>
          
          <div className="product-rating">
            <div className="star-rating-display">
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
            <span>({product.reviewCount} reviews)</span>
          </div>

          {/* Rating Summary */}
          {reviews.length > 0 && (
            <div className="rating-summary">
              <div className="rating-overview">
                <div className="average-rating">
                  <span className="rating-number">{averageRating.toFixed(1)}</span>
                  <div className="stars-large">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        viewBox="0 0 24 24"
                        fill={star <= Math.round(averageRating) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="total-reviews">Based on {reviews.length} reviews</span>
                </div>
              </div>
              <div className="rating-bars">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingDistribution[stars] || 0;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={stars} className="rating-bar-row">
                      <span className="star-label">{stars} star<span className="asterisk">*</span></span>
                      <div className="bar-container">
                        <div 
                          className="bar-fill" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="star-count">({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Review Submission Form */}
          {!hasUserReviewed && (
            <div className="review-form-section">
              <button 
                className="write-review-btn"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                {showReviewForm ? 'Cancel' : 'Write a Review'}
              </button>
              
              {showReviewForm && (
                <form onSubmit={handleSubmitReview} className="review-form">
                  <h3>Rate this product</h3>
                  <div className="star-rating-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        viewBox="0 0 24 24"
                        fill={star <= (hoverRating || userRating) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setUserRating(star)}
                        style={{ cursor: 'pointer', width: '30px', height: '30px' }}
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    ))}
                  </div>
                  {userRating > 0 && (
                    <p className="selected-rating">You selected: {userRating} star{userRating > 1 ? 's' : ''}</p>
                  )}
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your review (optional)"
                    rows={4}
                    className="review-comment"
                  />
                  <button type="submit" className="submit-review-btn">
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Reviews List */}
          {reviews.length > 0 && (
            <div className="reviews-section">
              <h3>Customer Reviews ({reviews.length})</h3>
              <div className="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="review-item">
                    <div className="review-header">
                      <div className="reviewer-name">{review.userName}</div>
                      <div className="review-date">{review.createdAt}</div>
                    </div>
                    <div className="review-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          viewBox="0 0 24 24"
                          fill={star <= review.rating ? "currentColor" : "none"}
                          stroke="currentColor"
                          strokeWidth="2"
                          style={{ width: '16px', height: '16px' }}
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      ))}
                    </div>
                    {review.comment && (
                      <p className="review-comment-text">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="product-price-detail">
            {product.discountPrice ? (
              <>
                <span className="current-price">${product.discountPrice}</span>
                <span className="original-price">${product.price}</span>
                <span className="discount-badge">{discount}% OFF</span>
              </>
            ) : (
              <span className="current-price">${product.price}</span>
            )}
          </div>

          <p className="product-description">{product.description}</p>

          <div className="product-tags">
            {product.tags?.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                disabled={quantity >= product.stockQuantity}
              >
                +
              </button>
            </div>

            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              disabled={addingToCart || product.stockQuantity === 0}
            >
              {addingToCart ? 'Adding...' : product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>

            <div className="action-buttons-group">
              <button
                className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                onClick={handleWishlist}
                title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                {isInWishlist ? '♥' : '♡'}
              </button>

              <button
                className="share-btn"
                onClick={handleShare}
                title="Share Product"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"/>
                  <circle cx="6" cy="12" r="3"/>
                  <circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="product-meta">
            <p><strong>SKU:</strong> {product.id}</p>
            <p><strong>Stock:</strong> {product.stockQuantity} available</p>
          </div>
        </div>

        {/* Image Zoom Modal */}
        {showImageZoom && (
          <div className="image-zoom-modal" onClick={() => setShowImageZoom(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal" onClick={() => setShowImageZoom(false)}>
                &times;
              </button>
              <img
                src={product.images?.[selectedImage] || 'https://via.placeholder.com/500x500'}
                alt={product.name}
              />
              <div className="modal-nav">
                <button
                  className="nav-btn prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviousImage();
                  }}
                  title="Previous image (Left Arrow)"
                >
                  &#8249;
                </button>
                <button
                  className="nav-btn next"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                  title="Next image (Right Arrow)"
                >
                  &#8250;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;

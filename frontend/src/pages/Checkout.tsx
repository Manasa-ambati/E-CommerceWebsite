import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { orderAPI, cartAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import BackButton from '../components/BackButton';
import './Checkout.css';

const Checkout: React.FC = () => {
  const { cart, clearCart, removeFromCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if this is a "Buy Now" order (single item)
  const buyNowProductId = location.state?.buyNowProductId;
  const [singleItemCart, setSingleItemCart] = useState<any>(null);
  
  useEffect(() => {
    // If Buy Now, filter cart to only include that product
    if (buyNowProductId && cart) {
      const singleItem = cart.items.find((item: any) => item.productId === buyNowProductId);
      if (singleItem) {
        setSingleItemCart({
          ...cart,
          items: [singleItem],
          totalPrice: singleItem.productDiscountPrice || singleItem.productPrice || singleItem.subtotal / singleItem.quantity
        });
      }
    }
  }, [buyNowProductId, cart]);
  
  // Use single item cart if Buy Now, otherwise use full cart
  const currentCart = buyNowProductId ? singleItemCart : cart;
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    paymentMethod: 'CREDIT_CARD',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear validation error when user starts typing
    if (validationErrors[e.target.name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[e.target.name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      errors.phone = 'Phone number must be 10 digits';
    }

    // Street validation
    if (!formData.street.trim()) {
      errors.street = 'Street address is required';
    } else if (formData.street.trim().length < 5) {
      errors.street = 'Please enter a complete address';
    }

    // City validation
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    // State validation
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    // ZIP Code validation
    if (!formData.zipCode.trim()) {
      errors.zipCode = 'ZIP code is required';
    } else if (!/^[0-9]{6}$/.test(formData.zipCode.trim())) {
      errors.zipCode = 'ZIP code must be 6 digits';
    }

    // Country validation
    if (!formData.country.trim()) {
      errors.country = 'Country is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (!validateForm()) {
      setError('Please fill in all required fields correctly');
      return;
    }

    setLoading(true);

    try {
      const response = await orderAPI.create({
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      });
      
      // If Buy Now, remove only that item from cart
      if (buyNowProductId) {
        await removeFromCart(buyNowProductId);
      } else {
        // Otherwise clear entire cart
        await clearCart();
      }
      
      navigate(`/track-order/${response.data.data.orderNumber}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentCart || currentCart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <p>Add some products before checkout.</p>
        </div>
      </div>
    );
  }

  const subtotal = currentCart.totalPrice;
  const tax = 0; // No tax
  const shipping = 0; // Free shipping
  const total = subtotal;

  return (
    <div className="checkout-page">
      <BackButton fallbackPath="/cart" />
      
      <div className="checkout-container">
        <h1>Checkout</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="checkout-content">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h2>Shipping Address</h2>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name<span className="asterisk">*</span></label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={formData.firstName} 
                    onChange={handleChange}
                    className={validationErrors.firstName ? 'input-error' : ''}
                  />
                  {validationErrors.firstName && <span className="error-text">{validationErrors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label>Last Name<span className="asterisk">*</span></label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={formData.lastName} 
                    onChange={handleChange}
                    className={validationErrors.lastName ? 'input-error' : ''}
                  />
                  {validationErrors.lastName && <span className="error-text">{validationErrors.lastName}</span>}
                </div>
              </div>
              <div className="form-group">
                <label>Phone<span className="asterisk">*</span></label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleChange}
                  className={validationErrors.phone ? 'input-error' : ''}
                  placeholder="10-digit mobile number"
                />
                {validationErrors.phone && <span className="error-text">{validationErrors.phone}</span>}
              </div>
              <div className="form-group">
                <label>Street Address<span className="asterisk">*</span></label>
                <input 
                  type="text" 
                  name="street" 
                  value={formData.street} 
                  onChange={handleChange}
                  className={validationErrors.street ? 'input-error' : ''}
                />
                {validationErrors.street && <span className="error-text">{validationErrors.street}</span>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City<span className="asterisk">*</span></label>
                  <input 
                    type="text" 
                    name="city" 
                    value={formData.city} 
                    onChange={handleChange}
                    className={validationErrors.city ? 'input-error' : ''}
                  />
                  {validationErrors.city && <span className="error-text">{validationErrors.city}</span>}
                </div>
                <div className="form-group">
                  <label>State<span className="asterisk">*</span></label>
                  <input 
                    type="text" 
                    name="state" 
                    value={formData.state} 
                    onChange={handleChange}
                    className={validationErrors.state ? 'input-error' : ''}
                  />
                  {validationErrors.state && <span className="error-text">{validationErrors.state}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>ZIP Code<span className="asterisk">*</span></label>
                  <input 
                    type="text" 
                    name="zipCode" 
                    value={formData.zipCode} 
                    onChange={handleChange}
                    className={validationErrors.zipCode ? 'input-error' : ''}
                    placeholder="6-digit PIN code"
                  />
                  {validationErrors.zipCode && <span className="error-text">{validationErrors.zipCode}</span>}
                </div>
                <div className="form-group">
                  <label>Country<span className="asterisk">*</span></label>
                  <input 
                    type="text" 
                    name="country" 
                    value={formData.country} 
                    onChange={handleChange}
                    className={validationErrors.country ? 'input-error' : ''}
                  />
                  {validationErrors.country && <span className="error-text">{validationErrors.country}</span>}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-options">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CREDIT_CARD"
                    checked={formData.paymentMethod === 'CREDIT_CARD'}
                    onChange={handleChange}
                  />
                  <span>Credit Card</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="DEBIT_CARD"
                    checked={formData.paymentMethod === 'DEBIT_CARD'}
                    onChange={handleChange}
                  />
                  <span>Debit Card</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CASH_ON_DELIVERY"
                    checked={formData.paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={handleChange}
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>
            </div>

            <div className="form-section">
              <h2>Order Notes (Optional)</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Special instructions for delivery..."
              />
            </div>

            <button type="submit" className="place-order-btn" disabled={loading}>
              {loading ? 'Placing Order...' : `Place Order - ₹${total.toFixed(2)}`}
            </button>
          </form>

          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {currentCart.items.map((item: any) => (
                <div key={item.id} className="summary-item">
                  <span>{item.productName} × {item.quantity}</span>
                  <span>₹{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row total">
                <span>Order Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              {buyNowProductId && (
                <div className="single-item-note">
                  ⚡ Single Item Order
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

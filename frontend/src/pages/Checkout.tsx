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
  
  // Card details state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryDate: '',
    cvv: '',
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

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\D/g, '').substring(0, 16);
      formattedValue = formattedValue.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    
    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2);
      }
    }
    
    // Limit CVV to 3-4 digits
    if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
    }
    
    setCardDetails({
      ...cardDetails,
      [name]: formattedValue,
    });
    
    // Clear validation error
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
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

    // Card details validation (only for credit/debit card)
    if (formData.paymentMethod === 'CREDIT_CARD' || formData.paymentMethod === 'DEBIT_CARD') {
      if (!cardDetails.cardNumber.trim()) {
        errors.cardNumber = 'Card number is required';
      } else if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
        errors.cardNumber = 'Card number must be 16 digits';
      }

      if (!cardDetails.cardHolderName.trim()) {
        errors.cardHolderName = 'Card holder name is required';
      } else if (cardDetails.cardHolderName.trim().length < 3) {
        errors.cardHolderName = 'Please enter a valid name';
      }

      if (!cardDetails.expiryDate.trim()) {
        errors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardDetails.expiryDate)) {
        errors.expiryDate = 'Invalid format (MM/YY)';
      }

      if (!cardDetails.cvv.trim()) {
        errors.cvv = 'CVV is required';
      } else if (!/^[0-9]{3,4}$/.test(cardDetails.cvv)) {
        errors.cvv = 'Invalid CVV';
      }
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
      const orderData: any = {
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
      };
      
      // If Buy Now, send only that product ID
      if (buyNowProductId) {
        orderData.productIds = [buyNowProductId];
        console.log('🛒 Buy Now - Ordering only product ID:', buyNowProductId);
      } else {
        console.log('🛒 Regular checkout - Ordering all cart items');
      }
      
      console.log('📦 Sending order data:', JSON.stringify(orderData, null, 2));
      const response = await orderAPI.create(orderData);
      console.log('✅ Order placed successfully:', response.data);
      
      // Don't remove items from cart - keep them for future purchases
      // Users can manually remove items if they want
      
      navigate(`/track-order/${response.data.data.orderNumber}`);
    } catch (err: any) {
      console.error('❌ Order placement failed:', err);
      console.error('Error response:', JSON.stringify(err.response?.data, null, 2));
      console.error('Error status:', err.response?.status);
      console.error('Error message:', err.response?.data?.message);
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

              {/* Card Details Form - Shows only for Credit/Debit Card */}
              {(formData.paymentMethod === 'CREDIT_CARD' || formData.paymentMethod === 'DEBIT_CARD') && (
                <div className="card-details-form">
                  <h3>Card Details</h3>
                  
                  <div className="form-group">
                    <label>Card Number<span className="asterisk">*</span></label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={cardDetails.cardNumber}
                      onChange={handleCardChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={validationErrors.cardNumber ? 'input-error' : ''}
                    />
                    {validationErrors.cardNumber && <span className="error-text">{validationErrors.cardNumber}</span>}
                  </div>

                  <div className="form-group">
                    <label>Card Holder Name<span className="asterisk">*</span></label>
                    <input
                      type="text"
                      name="cardHolderName"
                      value={cardDetails.cardHolderName}
                      onChange={handleCardChange}
                      placeholder="Name on card"
                      className={validationErrors.cardHolderName ? 'input-error' : ''}
                    />
                    {validationErrors.cardHolderName && <span className="error-text">{validationErrors.cardHolderName}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date<span className="asterisk">*</span></label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={cardDetails.expiryDate}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={validationErrors.expiryDate ? 'input-error' : ''}
                      />
                      {validationErrors.expiryDate && <span className="error-text">{validationErrors.expiryDate}</span>}
                    </div>
                    <div className="form-group">
                      <label>CVV<span className="asterisk">*</span></label>
                      <input
                        type="password"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardChange}
                        placeholder="123"
                        maxLength={4}
                        className={validationErrors.cvv ? 'input-error' : ''}
                      />
                      {validationErrors.cvv && <span className="error-text">{validationErrors.cvv}</span>}
                    </div>
                  </div>

                  <div className="card-security-info">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0110 0v4"></path>
                    </svg>
                    <span>Your card details are secure and encrypted</span>
                  </div>
                </div>
              )}
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

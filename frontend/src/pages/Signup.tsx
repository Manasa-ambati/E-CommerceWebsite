import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { validateSignupForm, validateOtp, getPasswordStrength } from '../utils/validation';
import './SignupProfessional.css';

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [formData, setFormData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Handle field blur for validation
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    const errors = validateSignupForm(formData);
    if (errors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: errors[field] }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle input changes with validation
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const name = e.target.name;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Update password strength in real-time
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
    
    // Real-time validation if field is touched
    if (touched[name]) {
      const updatedData = { ...formData, [name]: value };
      const errors = validateSignupForm(updatedData);
      
      if (errors[name]) {
        setValidationErrors(prev => ({ ...prev, [name]: errors[name] }));
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate entire form before submission
    const errors = validateSignupForm(formData);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setTouched({
        firstName: true,
        lastName: true,
        email: true,
        password: true,
        phone: true
      });
      
      // Show first error as toast
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }
    
    setLoading(true);

    // Combine firstName and lastName into name for backend
    const signupPayload = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      password: formData.password,
      phone: formData.phone
    };

    console.log('Sending signup request with data:', signupPayload);

    try {
      const response = await authAPI.signup(signupPayload);
      console.log('Signup response:', response.data);
      const data = response.data;

      if (data.requiresOtp) {
        // OTP sent successfully
        toast.success('Account created! Please check your email for verification code.');
        setStep('otp');
        setResendDisabled(true);
        setCountdown(30);
      } else {
        // Direct signup (fallback)
        toast.success('Account created successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate OTP
    const otpError = validateOtp(otp);
    if (otpError) {
      toast.error(otpError);
      return;
    }
    
    setLoading(true);

    try {
      const response = await authAPI.verifyOtp(formData.email, otp);
      const data = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        email: data.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim() || data.name,
        role: data.role,
        emailVerified: true // OTP verified during signup
      }));
      
      toast.success('Email verified successfully! Welcome to ShopEase!');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;

    setError('');
    setLoading(true);

    try {
      await authAPI.resendOtp(formData.email);
      setResendDisabled(true);
      setCountdown(30);
      toast.info('OTP resent to your email!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page-container">
      <div className="signup-card">
        {/* LEFT SIDE - BRANDING */}
        <div className="signup-branding">
          <div className="branding-content">
            <div className="brand-logo">ShopEase</div>
            <p className="brand-tagline">Discover the future of online shopping with exclusive deals and premium products.</p>
            
            <div className="brand-features">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h4>Secure Shopping</h4>
                  <p>100% secure checkout</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h4>Fast Delivery</h4>
                  <p>Express shipping available</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h4>24/7 Support</h4>
                  <p>Always here to help</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="branding-image">
            <img src="https://cdn3d.iconscout.com/3d/premium/thumb/shopping-bag-4438064-3723931.png" alt="Shopping" />
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="signup-form-container">
          {step === 'signup' ? (
            <>
              <div className="signup-header">
                <h1 className="signup-title">Create Your Account</h1>
                <p className="signup-subtitle">Join thousands of happy customers today</p>
              </div>
              
              <form onSubmit={handleSignup}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('firstName')}
                      className={`form-input ${touched.firstName && validationErrors.firstName ? 'error' : ''}`}
                      required
                    />
                    {touched.firstName && validationErrors.firstName && (
                      <span className="field-error">{validationErrors.firstName}</span>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      Last Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('lastName')}
                      className={`form-input ${touched.lastName && validationErrors.lastName ? 'error' : ''}`}
                      required
                    />
                    {touched.lastName && validationErrors.lastName && (
                      <span className="field-error">{validationErrors.lastName}</span>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('email')}
                    className={`form-input ${touched.email && validationErrors.email ? 'error' : ''}`}
                    required
                  />
                  {touched.email && validationErrors.email && (
                    <span className="field-error">{validationErrors.email}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Password <span className="required">*</span>
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('password')}
                      minLength={8}
                      className={`form-input ${touched.password && validationErrors.password ? 'error' : ''}`}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="password-strength-meter">
                      <div className="strength-bar-bg">
                        <div 
                          className={`strength-bar-fill strength-${passwordStrength <= 1 ? 'very-weak' : passwordStrength <= 2 ? 'weak' : passwordStrength <= 3 ? 'fair' : passwordStrength <= 4 ? 'good' : 'strong'}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`strength-text strength-${passwordStrength <= 1 ? 'very-weak' : passwordStrength <= 2 ? 'weak' : passwordStrength <= 3 ? 'fair' : passwordStrength <= 4 ? 'good' : 'strong'}-text`}>
                        {passwordStrength <= 1 ? 'Very Weak' : passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Fair' : passwordStrength <= 4 ? 'Good' : 'Strong'}
                      </span>
                    </div>
                  )}
                  
                  {touched.password && validationErrors.password && (
                    <span className="field-error">{validationErrors.password}</span>
                  )}
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Phone Number <span className="required">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('phone')}
                    className={`form-input ${touched.phone && validationErrors.phone ? 'error' : ''}`}
                    title="Please enter a valid phone number"
                    required
                  />
                  {touched.phone && validationErrors.phone && (
                    <span className="field-error">{validationErrors.phone}</span>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading || Object.keys(validationErrors).length > 0}
                  className="submit-btn"
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>
                
                <p className="terms-text">
                  By signing up, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </p>
              </form>
              
              <div className="login-link">
                Already have an account? <Link to="/login">Login here</Link>
              </div>
            </>
          ) : (
            <div className="otp-section">
              <div className="otp-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              
              <h2 className="otp-title">Verify Your Email</h2>
              <p className="otp-description">We've sent a 6-digit verification code to:</p>
              
              <span className="email-highlight">{formData.email}</span>
              
              <form onSubmit={handleOtpVerification}>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="form-input otp-input-field"
                  required
                />
                
                <button 
                  type="submit" 
                  disabled={loading || otp.length !== 6}
                  className="submit-btn"
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Create Account'
                  )}
                </button>
                
                <button 
                  type="button" 
                  onClick={handleResendOtp}
                  disabled={resendDisabled || loading}
                  className="resend-otp-btn"
                >
                  {resendDisabled ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setStep('signup')}
                  className="back-to-signup-btn"
                >
                  ← Back to Signup
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Signup;

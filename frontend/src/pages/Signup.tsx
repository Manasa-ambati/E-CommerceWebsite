import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { validateSignupForm, validateOtp, getPasswordStrength } from '../utils/validation';
import './SignupAmazon.css';

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
    
    // Quick validation - only check required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Password length check
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    // INSTANT UI FEEDBACK - Show loading state immediately
    setLoading(true);
    console.log('⏱️ Signup started:', new Date().toISOString());

    // Combine firstName and lastName into name for backend
    const signupPayload = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      password: formData.password,
      phone: formData.phone
    };

    console.log('📤 Sending signup request...');
    const startTime = Date.now();

    try {
      const response = await authAPI.signup(signupPayload);
      const endTime = Date.now();
      console.log('✅ API Response time:', (endTime - startTime), 'ms');
      console.log('Signup response:', response.data);
      const data = response.data;

      if (data.requiresOtp) {
        // INSTANT SUCCESS MESSAGE
        toast.success('Signup successfully! 🎉');
        console.log('📧 OTP sent - switching to verification step');
        setStep('otp');
        setResendDisabled(true);
        setCountdown(30);
      } else {
        // DIRECT SIGNUP - Faster redirect
        toast.success('Signup successfully! 🎉 Redirecting...');
        setTimeout(() => navigate('/login'), 1000); // Even faster!
      }
    } catch (err: any) {
      const errorTime = Date.now();
      console.log('❌ Error after:', (errorTime - startTime), 'ms');
      console.error('Signup error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      console.log('🏁 Signup process completed');
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
    <div className="amazon-signup-container">
      <div className="amazon-logo">Shop<span>Ease</span></div>
      
      <div className="signup-box">
        {step === 'signup' ? (
          <>
            <h2>Create Account</h2>
            
            <form onSubmit={handleSignup}>
              <div className="form-group">
                <label className="form-label">
                  Your name <span className="required">*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('firstName')}
                    className={`form-input ${touched.firstName && validationErrors.firstName ? 'error' : ''}`}
                    required
                  />
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('lastName')}
                    className={`form-input ${touched.lastName && validationErrors.lastName ? 'error' : ''}`}
                    required
                  />
                </div>
                {(touched.firstName && validationErrors.firstName) || (touched.lastName && validationErrors.lastName) ? (
                  <span className="field-error">
                    {validationErrors.firstName || validationErrors.lastName}
                  </span>
                ) : null}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Mobile number or email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
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
                    placeholder="At least 8 characters"
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
                    {showPassword ? '👁️' : '👁️'}
                  </button>
                </div>
                <div className="helper-text">Passwords must be at least 8 characters.</div>
                
                {/* Password Strength */}
                {formData.password && (
                  <div className="password-strength-meter">
                    <div className="strength-bar-bg">
                      <div 
                        className={`strength-bar-fill strength-${passwordStrength <= 1 ? 'very-weak' : passwordStrength <= 2 ? 'weak' : passwordStrength <= 3 ? 'fair' : passwordStrength <= 4 ? 'good' : 'strong'}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="strength-text">
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
                  Phone number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('phone')}
                  className={`form-input ${touched.phone && validationErrors.phone ? 'error' : ''}`}
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
                    Creating your account...
                  </>
                ) : (
                  'Create your ShopEase account'
                )}
              </button>
              
              <p className="terms-text">
                By creating an account, you agree to ShopEase's{' '}
                <a href="#">Conditions of Use</a> and{' '}
                <a href="#">Privacy Notice</a>.
              </p>
            </form>
          </>
        ) : (
          <div className="otp-section">
            <h3>Verify Your Email</h3>
            <p className="otp-description">
              We've sent a 6-digit verification code to:
            </p>
            
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
                  'Verify Email'
                )}
              </button>
              
              <button 
                type="button" 
                onClick={handleResendOtp}
                disabled={resendDisabled || loading}
                className="resend-otp-btn"
              >
                {resendDisabled ? `Resend code in ${countdown}s` : 'Resend code'}
              </button>
              
              <button 
                type="button"
                onClick={() => setStep('signup')}
                className="back-to-signup-btn"
              >
                ← Back to signup
              </button>
            </form>
          </div>
        )}
      </div>
      
      <div className="divider"></div>
      
      <div className="login-link">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
};

export default Signup;

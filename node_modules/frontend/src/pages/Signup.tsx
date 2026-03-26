import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { validateSignupForm, validateOtp, getPasswordStrength } from '../utils/validation';
import './AuthModern.css';

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
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* LEFT SIDE */}
        <div className="auth-left">
          <h2>Create Account ✨</h2>
          <p>Join ShopEase today</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-right">
          {step === 'signup' ? (
            <>
              <h2>Sign Up</h2>
              <form onSubmit={handleSignup}>
                <div className="name-row">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('firstName')}
                    required
                  />
                  {touched.firstName && validationErrors.firstName && (
                    <span className="field-error">{validationErrors.firstName}</span>
                  )}
                </div>
                
                <div className="name-row">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('lastName')}
                    required
                  />
                  {touched.lastName && validationErrors.lastName && (
                    <span className="field-error">{validationErrors.lastName}</span>
                  )}
                </div>
                
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('email')}
                  required
                />
                {touched.email && validationErrors.email && (
                  <span className="field-error">{validationErrors.email}</span>
                )}
                
                <div className="password-field">
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('password')}
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
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
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className={`strength-fill strength-${Math.min(passwordStrength, 5)}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`strength-text strength-${passwordStrength}`}>
                        {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 4 ? 'Medium' : 'Strong'}
                      </span>
                    </div>
                  )}
                  
                  {touched.password && validationErrors.password && (
                    <span className="field-error">{validationErrors.password}</span>
                  )}
                </div>
                
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('phone')}
                  title="Please enter a valid phone number (numbers, +, -, spaces, parentheses)"
                  required
                />
                {touched.phone && validationErrors.phone && (
                  <span className="field-error">{validationErrors.phone}</span>
                )}
                
                <button 
                  type="submit" 
                  disabled={loading || Object.keys(validationErrors).length > 0}
                  className={loading ? 'loading' : ''}
                >
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
                
                <p className="terms-text">
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </p>
              </form>
              
              <p className="auth-link">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </>
          ) : (
            <>
              <h2>Verify Email 🔐</h2>
              <form onSubmit={handleOtpVerification}>
                <div className="otp-info">
                  <p>We've sent a verification code to:</p>
                  <p className="email-highlight">{formData.email}</p>
                  <p className="otp-instruction">Enter the 6-digit OTP from your email</p>
                </div>
                
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="otp-input"
                  required
                />
                
                <button 
                  type="submit" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>
                
                <button 
                  type="button" 
                  onClick={handleResendOtp}
                  disabled={resendDisabled || loading}
                  className="resend-btn"
                >
                  {resendDisabled ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setStep('signup')}
                  className="back-btn"
                >
                  ← Back to Signup
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      
      {error && <div className="error-message-toast">{error}</div>}
    </div>
  );
};

export default Signup;

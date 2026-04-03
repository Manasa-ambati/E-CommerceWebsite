import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { validateSignupForm, validateOtp, getPasswordStrength } from '../utils/validation';
import './SplitAuth.css';

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
    <div className="auth-page-wrapper">
      <div className="auth-container">
        {/* LEFT SIDE - Decorative Panel */}
        <div className="left-panel">
          <div className="left-panel-content">
            <h1>Welcome!</h1>
            <p>Join our community and discover amazing products</p>
            
            <div className="social-icons">
              <div className="social-icon" onClick={() => toast.info('Facebook coming soon!')}>f</div>
              <div className="social-icon" onClick={() => toast.info('Twitter coming soon!')}>t</div>
              <div className="social-icon" onClick={() => toast.info('Instagram coming soon!')}>ig</div>
            </div>

            <p className="divider-text">Or sign up with</p>
            
            <button 
              className="google-btn-left"
              onClick={() => toast.info('Google signup coming soon!')}
            >
              <span>G</span> Google
            </button>
          </div>
        </div>

        {/* RIGHT SIDE - Form Panel */}
        <div className="right-panel">
          <div className="form-container">
            {step === 'signup' ? (
              <>
                <h2>Create Account</h2>
                <p className="form-subtitle">Fill in your details to get started</p>

                <form onSubmit={handleSignup}>
                  {/* Name Fields */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        className="form-input"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('firstName')}
                        required
                      />
                      {touched.firstName && validationErrors.firstName && (
                        <div style={{ color: '#ff416c', fontSize: '12px', marginTop: '5px' }}>
                          {validationErrors.firstName}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        className="form-input"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        onBlur={() => handleBlur('lastName')}
                        required
                      />
                      {touched.lastName && validationErrors.lastName && (
                        <div style={{ color: '#ff416c', fontSize: '12px', marginTop: '5px' }}>
                          {validationErrors.lastName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('email')}
                      required
                    />
                    {touched.email && validationErrors.email && (
                      <div style={{ color: '#ff416c', fontSize: '12px', marginTop: '5px' }}>
                        {validationErrors.email}
                      </div>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      placeholder="+1 234 567 8900"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('phone')}
                      required
                    />
                    {touched.phone && validationErrors.phone && (
                      <div style={{ color: '#ff416c', fontSize: '12px', marginTop: '5px' }}>
                        {validationErrors.phone}
                      </div>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="form-group">
                    <label>Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="form-input"
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('password')}
                      minLength={8}
                      required
                    />
                    
                    {/* Password Strength Indicator */}
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div 
                          className="strength-fill" 
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        />
                      </div>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        Password strength: {passwordStrength}/5
                      </span>
                    </div>

                    {touched.password && validationErrors.password && (
                      <div style={{ color: '#ff416c', fontSize: '12px', marginTop: '5px' }}>
                        {validationErrors.password}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={loading}
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
                </form>

                {/* Login Link */}
                <div className="login-link">
                  Already have an account?{' '}
                  <Link to="/login">Sign In</Link>
                </div>
              </>
            ) : (
              <div className="otp-section">
                <button className="back-btn" onClick={() => setStep('signup')}>
                  ← Back
                </button>
                
                <h2>Verify Your Account</h2>
                <p className="form-subtitle">Enter the OTP sent to your email</p>

                <div className="otp-input-container">
                  {otp.split('').map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      className="otp-input"
                      value={digit}
                      onChange={(e) => {
                        const newOtp = otp.split('');
                        newOtp[index] = e.target.value;
                        setOtp(newOtp.join(''));
                        if (e.target.value && index < 5) {
                          const nextInput = document.querySelectorAll('.otp-input')[index + 1];
                          if (nextInput) (nextInput as HTMLInputElement).focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !(e.target as HTMLInputElement).value && index > 0) {
                          const prevInput = document.querySelectorAll('.otp-input')[index - 1];
                          if (prevInput) (prevInput as HTMLInputElement).focus();
                        }
                      }}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <button 
                  onClick={handleOtpVerification} 
                  disabled={loading || otp.length !== 6} 
                  className="submit-btn"
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Continue'
                  )}
                </button>

                {/* Resend OTP */}
                <div className="resend-otp">
                  Didn't receive OTP?{' '}
                  <button 
                    onClick={handleResendOtp} 
                    disabled={resendDisabled || loading}
                  >
                    {resendDisabled ? `Resend in ${countdown}s` : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

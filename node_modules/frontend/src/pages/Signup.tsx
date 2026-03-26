import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Toast from '../components/Toast';
import './Auth.css';

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
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  // Add toast notification
  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  // Remove toast notification
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
        addToast('Account created! Please check your email for verification code.', 'success');
        setStep('otp');
        setResendDisabled(true);
        setCountdown(30);
      } else {
        // Direct signup (fallback)
        addToast('Account created successfully! Redirecting to login...', 'success');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
      
      addToast('Email verified successfully! Welcome to ShopEase!', 'success');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      addToast(errorMessage, 'error');
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
      addToast('OTP resent to your email!', 'info');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP.';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container signup-container">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      <h2>Create Your Account</h2>
      <p className="subtitle">Join our community today</p>
      
      {step === 'signup' ? (
        <form onSubmit={handleSignup}>
          <div className="name-row">
            <div className="form-group">
              <label>
                First Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>
                Last Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group password-field">
            <label>
              Password <span className="required">*</span>
            </label>
            <div className="password-input-wrapper">
              <input
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange}
                minLength={6}
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
          </div>
          
          <div className="form-group">
            <label>
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleInputChange}
              title="Please enter a valid phone number (numbers, +, -, spaces, parentheses)"
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          
          <p className="terms-text">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      ) : (
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
          
          <button type="submit" disabled={loading}>
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
      )}

      <p>
        Already have an account?{' '}
        <Link to="/login">Login here</Link>
      </p>

      {error && <div className="error">{error}</div>}
    </div>
    
  );
};

export default Signup;

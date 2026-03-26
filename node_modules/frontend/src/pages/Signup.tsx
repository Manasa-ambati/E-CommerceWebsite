import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Toast from '../components/Toast';
import './Auth.css';

interface SignupData {
  name: string;
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
    name: '',
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

    console.log('Sending signup request with data:', formData);

    try {
      const response = await authAPI.signup(formData);
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
        name: formData.name || data.name,
        role: data.role
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
      
      {step === 'signup' ? (
        <form onSubmit={handleSignup}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleInputChange}
              minLength={6}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
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

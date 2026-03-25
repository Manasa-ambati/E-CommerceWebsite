import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import Toast from '../components/Toast';
import './Auth.css';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
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

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('📤 Sending password login request:', { email, password: '***' });

    try {
      const response = await authAPI.login({ email, password });
      console.log('📥 Login response received:', response.data);
      const data = response.data;

      if (data.requiresOtp) {
        // User needs OTP verification
        addToast('Please verify your identity with OTP', 'info');
        setShowOtpForm(true);
        setError('');
      } else {
        // Direct login with JWT
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          id: data.id,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role
        }));
        addToast('Login successful!', 'success');
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (err: any) {
      console.error('❌ Password login failed:', err);
      console.error('📄 Error response:', err.response?.data);
      console.error('📊 Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('📤 Sending OTP request with email:', email);

    try {
      // Send only email for OTP-based login
      const payload = { email: email.trim() };
      console.log('📤 Request payload:', payload);
      
      const response = await authAPI.login(payload);
      console.log('📥 OTP response received:', response.data);
      
      setShowOtpForm(true);
      setResendDisabled(true);
      setCountdown(30); // 30 seconds cooldown
      addToast('OTP sent to your email!', 'success');
    } catch (err: any) {
      console.error('❌ OTP request failed:', err);
      console.error('📄 Error response:', err.response?.data);
      console.error('📊 Error status:', err.response?.status);
      console.error('📝 Error headers:', err.response?.headers);
      
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.';
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
      const response = await authAPI.verifyOtp(email, otp);
      const data = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role
      }));
      addToast('OTP verified successfully! Login successful!', 'success');
      setTimeout(() => navigate('/'), 1000);
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
      await authAPI.login({ email, password: '' });
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
    <div className="auth-container">
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

      <h2>Welcome Back</h2>
      
      {!showOtpForm ? (
        <>
          {/* Login Method Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${loginMethod === 'password' ? 'active' : ''}`}
              onClick={() => setLoginMethod('password')}
            >
              Password Login
            </button>
            <button
              type="button"
              className={`auth-tab ${loginMethod === 'otp' ? 'active' : ''}`}
              onClick={() => setLoginMethod('otp')}
            >
              OTP Login
            </button>
          </div>

          {loginMethod === 'password' ? (
            <form onSubmit={handlePasswordLogin}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpRequest}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          <p>
            Don't have an account?{' '}
            <Link to="/signup">Sign up here</Link>
          </p>
        </>
      ) : (
        <form onSubmit={handleOtpVerification}>
          <div className="otp-info">
            <p>Enter the OTP sent to <strong>{email}</strong></p>
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
            {loading ? 'Verifying...' : 'Verify & Login'}
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
            onClick={() => {
              setShowOtpForm(false);
              setOtp('');
            }}
            className="back-btn"
          >
            ← Back to Login
          </button>
        </form>
      )}

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default Login;

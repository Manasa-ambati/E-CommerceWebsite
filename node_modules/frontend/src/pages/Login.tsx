// src/pages/Login.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { authAPI } from '../services/api';
import { storageService } from '../services/storageService';
import './Login.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showSignupForm, setShowSignupForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [loginMethod, setLoginMethod] = useState<'email' | 'otp'>('email');

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  useEffect(() => {
    // Load saved email from localStorage
    const savedEmail = storageService.get('saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setLoginMethod('otp');
    }
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (showOtpForm || showSignupForm) otpInputRef.current?.focus();
  }, [showOtpForm, showSignupForm]);

  // ✅ STEP 1: Send OTP (or verify directly if debug mode)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Save email to localStorage for future logins
      storageService.set('saved_email', email, 43200); // 30 days

      // Normal OTP flow
      const response = await authAPI.login({ email });
      const data = response.data.data;

      if (data?.isNewUser) {
        setShowSignupForm(true);
        setError('New user detected. Please complete your registration');
        return;
      }

      if (data?.requiresOtp) {
        setShowOtpForm(true);
        setLoginMethod('otp');
        setResendCooldown(30);
        return;
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ✅ STEP 2: Complete Signup for new users
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);

    try {
      const signupData = {
        name: firstName + ' ' + lastName,
        email,
        password,
        phone,
      };

      const response = await authAPI.signup(signupData);
      const data = response.data.data;

      if (data?.requiresOtp) {
        setShowOtpForm(true);
        setLoginMethod('otp');
        setError('Enter OTP sent to your email');
        setResendCooldown(30);
        return;
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setOtpLoading(false);
    }
  };

  // ✅ STEP 3: Verify OTP
  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);

    try {
      const response = await authAPI.verifyOtp(email, otp);
      const data = response.data.data;

      if (!data || !data.token || !data.user) {
        throw new Error('Invalid server response');
      }

      const token = data.token;
      const userData = data.user;

      // Save to auth context (which stores in localStorage)
      login(userData, token);
      
      // Store additional user data in localStorage
      storageService.set('last_login', Date.now());
      storageService.set('user_email', email);
      
      navigate('/');

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      await authAPI.resendOtp(email);
      alert('New OTP sent!');
      setResendCooldown(30);
    } catch {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>
          {showSignupForm
            ? 'Complete Registration'
            : showOtpForm
            ? 'Verify OTP'
            : 'Welcome Back'}
        </h2>

        {error && <div className="login-error">{error}</div>}

        {/* Login Method Tabs */}
        {!showSignupForm && !showOtpForm && (
          <div className="login-tabs">
            <button 
              className={`login-tab ${loginMethod === 'email' ? 'active' : ''}`}
              onClick={() => setLoginMethod('email')}
            >
              Email Login
            </button>
            <button 
              className={`login-tab ${loginMethod === 'otp' ? 'active' : ''}`}
              onClick={() => setLoginMethod('otp')}
            >
              OTP Login
            </button>
          </div>
        )}

        {/* STEP 1: Email/OTP Request */}
        {!showSignupForm && !showOtpForm && (
          <form onSubmit={handleSendOtp} className="login-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="login-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {loginMethod === 'email' && (
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <button type="submit" className="login-btn-primary" disabled={loading}>
              {loading ? 'Processing...' : (loginMethod === 'email' ? 'Login' : 'Send OTP')}
            </button>

            {loginMethod === 'otp' && email && (
              <p className="login-help-text">
                We'll send a 6-digit OTP to {email}
              </p>
            )}
          </form>
        )}

        {/* STEP 2: Signup Form */}
        {showSignupForm && (
          <form onSubmit={handleCompleteSignup} className="login-form">
            <div className="form-group">
              <label>First Name</label>
              <input 
                className="login-input" 
                placeholder="Enter first name" 
                value={firstName} 
                onChange={(e)=>setFirstName(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Last Name</label>
              <input 
                className="login-input" 
                placeholder="Enter last name" 
                value={lastName} 
                onChange={(e)=>setLastName(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Email</label>
              <input 
                className="login-input" 
                value={email} 
                readOnly 
                style={{ background: '#f5f5f5', cursor: 'not-allowed' }}
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                className="login-input" 
                placeholder="Create a password" 
                value={password} 
                onChange={(e)=>setPassword(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                className="login-input" 
                placeholder="Enter phone number" 
                value={phone} 
                onChange={(e)=>setPhone(e.target.value)} 
                required 
              />
            </div>
            
            <button type="submit" className="login-btn-primary" disabled={otpLoading}>
              {otpLoading ? 'Registering...' : 'Register & Send OTP'}
            </button>
          </form>
        )}

        {/* STEP 3: OTP Verification */}
        {showOtpForm && (
          <form onSubmit={handleOtpVerification} className="login-form">
            <div className="form-group">
              <label>Enter 6-Digit OTP</label>
              <input
                className="login-input login-otp-input"
                value={otp}
                ref={otpInputRef}
                onChange={(e)=>setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                maxLength={6}
                type="text"
                inputMode="numeric"
                required
              />
            </div>

            <button type="submit" className="login-btn-primary" disabled={otpLoading}>
              {otpLoading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button 
              type="button" 
              className="login-btn-secondary" 
              onClick={handleResendOtp} 
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
            </button>

            <p className="login-help-text">
              Didn't receive OTP? Check your spam folder or click resend
            </p>
          </form>
        )}

        {!showSignupForm && !showOtpForm && (
          <p className="login-footer-text">
            Don't have an account? <Link to="/signup" className="login-link">Signup here</Link>
          </p>
        )}
      </div>
    </div>
  );
};
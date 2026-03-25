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

  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // Load saved email from localStorage
  useEffect(() => {
    const savedEmail = storageService.get('saved_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Autofocus OTP input
  useEffect(() => {
    if (showOtpForm || showSignupForm) otpInputRef.current?.focus();
  }, [showOtpForm, showSignupForm]);

  /** Step 1: Send OTP or check if new user */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      storageService.set('saved_email', email, 43200); // 30 days
      const response = await authAPI.login({ email });
      const data = response.data.data;

      if (data?.isNewUser) {
        setShowSignupForm(true);
        setError('New user detected. Complete your registration');
        return;
      }

      if (data?.requiresOtp) {
        setShowOtpForm(true);
        setResendCooldown(30);
        return;
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  /** Step 2: Complete Signup for new users */
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);
    try {
      const signupData = {
        name: firstName + ' ' + lastName,
        email,
        phone,
      };
      const response = await authAPI.signup(signupData);
      const data = response.data.data;

      if (data?.requiresOtp) {
        setShowOtpForm(true);
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

  /** Step 3: Verify OTP */
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

      login(data.user, data.token);
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
      setResendCooldown(30);
      alert('New OTP sent!');
    } catch {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{showSignupForm ? 'Complete Registration' : showOtpForm ? 'Verify OTP' : 'Welcome Back'}</h2>
        {error && <div className="login-error">{error}</div>}

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
            <button type="submit" className="login-btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Send OTP'}
            </button>
          </form>
        )}

        {showSignupForm && (
          <form className="login-form" onSubmit={handleCompleteSignup}>
            <div className="form-group">
              <label>First Name</label>
              <input className="login-input" value={firstName} onChange={e=>setFirstName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input className="login-input" value={lastName} onChange={e=>setLastName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input className="login-input" value={phone} onChange={e=>setPhone(e.target.value)} required />
            </div>
            <button className="login-btn-primary" disabled={otpLoading}>{otpLoading ? 'Registering...' : 'Register & Send OTP'}</button>
          </form>
        )}

        {showOtpForm && (
          <form className="login-form" onSubmit={handleOtpVerification}>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                className="login-input login-otp-input"
                value={otp}
                ref={otpInputRef}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                required
              />
            </div>
            <button type="submit" className="login-btn-primary" disabled={otpLoading}>
              {otpLoading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button type="button" className="login-btn-secondary" onClick={handleResendOtp} disabled={resendCooldown>0}>
              {resendCooldown>0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
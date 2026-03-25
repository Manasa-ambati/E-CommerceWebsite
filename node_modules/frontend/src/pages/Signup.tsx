// src/pages/Signup.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { authAPI } from '../services/api';
import { storageService } from '../services/storageService';
import { AuthResponse } from '../types/auth';
import './Signup.css';

export const Signup: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const signupData = {
        name: firstName + ' ' + lastName,
        email,
        password,
        phone,
      };

      const response = await authAPI.signup(signupData);
      const data: AuthResponse = response.data.data || response.data;

      // Check if OTP verification is required
      if (data.requiresOtp) {
        setShowOtpForm(true);
        setResendCooldown(30);
        // Save signup data to localStorage temporarily
        storageService.set('pending_signup', { firstName, lastName, email, phone });
        return;
      }

      // If no OTP required (direct login)
      const token = data.token || data.accessToken;
      const userData = data.user || data;

      if (!token) throw new Error('No token returned from server');

      login(userData, token);
      storageService.set('last_login', Date.now());
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed.');
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
      const data: AuthResponse = response.data.data || response.data;
      const token = data.token || data.accessToken;
      const userData = data.user || data;

      if (!token) throw new Error('No token returned after OTP verification');

      login(userData, token);
      
      // Store user data in localStorage
      storageService.set('last_login', Date.now());
      storageService.set('user_email', email);
      storageService.remove('pending_signup');
      
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      await authAPI.resendOtp(email);
      alert('✅ New OTP sent to your email!');
      setResendCooldown(30);
    } catch (err: any) {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>{showOtpForm ? 'Verify Your Email' : 'Create Account'}</h2>
        
        {error && <div className="signup-error">{error}</div>}

        {showOtpForm ? (
          <form className="signup-form" onSubmit={handleOtpVerification}>
            <div className="form-group">
              <label>Enter 6-Digit OTP</label>
              <input
                type="text"
                className="signup-input signup-otp-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                required
              />
              <p className="signup-help-text">
                We've sent a verification code to <strong>{email}</strong>
              </p>
            </div>
            
            <button type="submit" className="signup-btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
            
            <button 
              type="button" 
              className="signup-btn-secondary" 
              onClick={handleResendOtp} 
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </form>
        ) : (
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                className="signup-input"
                placeholder="Enter first name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                className="signup-input"
                placeholder="Enter last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="signup-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="signup-input"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                className="signup-input"
                placeholder="+91 XXXXX XXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="signup-btn-primary" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
            
            <p className="signup-terms-text">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        )}
        
        <p className="signup-footer-text">
          Already have an account? <Link to="/login" className="signup-link">Login here</Link>
        </p>
      </div>
    </div>
  );
};

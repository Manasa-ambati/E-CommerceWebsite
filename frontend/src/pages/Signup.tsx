// src/pages/Signup.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { authAPI } from '../services/api';
import { storageService } from '../services/storageService';
import './Signup.css';

export const Signup: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
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
    if (user) navigate('/');
  }, [user, navigate]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Step 1: Submit Signup
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const signupData = { name: firstName + ' ' + lastName, email, phone };
      const response = await authAPI.signup(signupData);
      const data = response.data.data;

      if (data?.requiresOtp) {
        setShowOtpForm(true);
        setResendCooldown(30);
        storageService.set('pending_signup', { firstName, lastName, email, phone });
        return;
      }

      login(data.user, data.token);
      storageService.set('last_login', Date.now());
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.verifyOtp(email, otp);
      const data = response.data.data;
      login(data.user, data.token);
      storageService.set('last_login', Date.now());
      storageService.remove('pending_signup');
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      await authAPI.resendOtp(email);
      alert('✅ New OTP sent!');
      setResendCooldown(30);
    } catch {
      setError('Failed to resend OTP');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>{showOtpForm ? 'Verify OTP' : 'Create Account'}</h2>
        {error && <div className="signup-error">{error}</div>}

        {showOtpForm ? (
          <form onSubmit={handleOtpVerification} className="signup-form">
            <div className="form-group">
              <label>Enter 6-Digit OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                required
              />
            </div>
            <button type="submit" className="signup-btn-primary" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
            <button type="button" className="signup-btn-secondary" onClick={handleResendOtp} disabled={resendCooldown > 0}>
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="signup-form">
            <div className="form-group">
              <label>First Name</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            <button type="submit" className="signup-btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </form>
        )}

        <p className="signup-footer-text">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};
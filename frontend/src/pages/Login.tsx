// src/pages/Login.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { authAPI } from '../services/api';
import { AuthResponse } from '../types/auth';

export const Login: React.FC = () => {
  // Step 1: Email/Phone input
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 2: Signup form (for new users)
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Step 3: OTP verification
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const otpInputRef = useRef<HTMLInputElement>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Countdown timer for OTP resend
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

  // Step 1: Send OTP or detect new user
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email });
      const data: AuthResponse = response.data.data || response.data;

      if (data.isNewUser) {
        // New user - show signup form
        setShowSignupForm(true);
        setError('Please complete your registration');
        setLoading(false);
        return;
      }

      if (data.requiresOtp) {
        // Existing user - show OTP form
        setShowOtpForm(true);
        setError('Enter OTP sent to your email');
        setResendCooldown(30);
        setLoading(false);
        return;
      }

      // Fallback: direct login (shouldn't happen in Meesho flow)
      const token = data.token || data.accessToken;
      const userData = data.user || data;
      if (token) {
        login(userData, token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Check email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Complete signup (for new users)
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
      const data: AuthResponse = response.data.data || response.data;

      if (data.requiresOtp) {
        // OTP required after signup
        setShowOtpForm(true);
        setError('Enter OTP sent to your email');
        setResendCooldown(30);
        setOtpLoading(false);
        return;
      }

      // Direct login after signup (fallback)
      const token = data.token || data.accessToken;
      const userData = data.user || data;
      if (token) {
        login(userData, token);
        navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);

    try {
      const response = await authAPI.verifyOtp(email, otp);
      const data: AuthResponse = response.data.data || response.data;
      const token = data.token || data.accessToken;
      const userData = data.user || data;

      if (!token) throw new Error('No token returned after OTP verification');

      login(userData, token);
      navigate('/'); // Redirect to Home
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    try {
      await authAPI.resendOtp(email);
      alert('New OTP sent to your email!');
      setResendCooldown(30);
    } catch {
      setError('Failed to resend OTP.');
    }
  };

  return (
    <div className="auth-container">
      <h2>
        {showSignupForm ? 'Complete Registration' : showOtpForm ? 'Verify OTP' : 'Welcome Back'}
      </h2>
      {error && <div className="error">{error}</div>}

      {/* STEP 1: Email Input */}
      {!showSignupForm && !showOtpForm && (
        <form onSubmit={handleSendOtp}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Sending OTP...' : 'Continue with Email'}
          </button>
          <p style={{ fontSize: '0.9em', color: '#666', marginTop: '15px' }}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </form>
      )}

      {/* STEP 2: Signup Form (New Users) */}
      {showSignupForm && (
        <form onSubmit={handleCompleteSignup}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="email"
            value={email}
            readOnly
            style={{ backgroundColor: '#f0f0f0' }}
          />
          <input
            type="password"
            placeholder="Create Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button type="submit" disabled={otpLoading}>
            {otpLoading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>
      )}

      {/* STEP 3: OTP Verification */}
      {showOtpForm && (
        <form onSubmit={handleOtpVerification}>
          <input
            type="text"
            value={otp}
            ref={otpInputRef}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            required
          />
          <button type="submit" disabled={otpLoading}>
            {otpLoading ? 'Verifying...' : 'Verify & Continue'}
          </button>
          <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0}>
            {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowOtpForm(false);
              setShowSignupForm(false);
              setOtp('');
              setError('');
            }}
          >
            Back
          </button>
        </form>
      )}

      {!showSignupForm && !showOtpForm && (
        <p>
          Don't have an account? <Link to="/signup">Signup here</Link>
        </p>
      )}
    </div>
  );
};

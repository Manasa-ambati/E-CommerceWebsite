// src/pages/Login.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { authAPI } from '../services/api';
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

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

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

  // ✅ STEP 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login({ email });
      const data = response.data.data;

      if (data?.isNewUser) {
        setShowSignupForm(true);
        setError('Please complete your registration');
        return;
      }

      if (data?.requiresOtp) {
        setShowOtpForm(true);
        setError('Enter OTP sent to your email');
        setResendCooldown(30);
        return;
      }

    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // ✅ STEP 2: Signup
  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);

    try {
      const response = await authAPI.signup({
        name: firstName + ' ' + lastName,
        email,
        password,
        phone,
      });

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

  // ✅ STEP 3: Verify OTP (🔥 MAIN FIX HERE)
  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);

    try {
      const response = await authAPI.verifyOtp(email, otp);

      console.log("VERIFY RESPONSE:", response.data);

      const data = response.data.data;

      // 🔥 STRICT VALIDATION (fixes your bug)
      if (!data || !data.token || !data.user) {
        throw new Error('Invalid server response');
      }

      const token = data.token;
      const userData = data.user;

      console.log("LOGIN DATA:", userData, token);

      login(userData, token); // ✅ saves to localStorage
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
      <h2>
        {showSignupForm
          ? 'Complete Registration'
          : showOtpForm
          ? 'Verify OTP'
          : 'Welcome Back'}
      </h2>

      {error && <div className="login-error">{error}</div>}

      {/* STEP 1 */}
      {!showSignupForm && !showOtpForm && (
        <form onSubmit={handleSendOtp}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button disabled={loading}>
            {loading ? 'Sending...' : 'Continue'}
          </button>
        </form>
      )}

      {/* STEP 2 */}
      {showSignupForm && (
        <form onSubmit={handleCompleteSignup}>
          <input placeholder="First Name" value={firstName} onChange={(e)=>setFirstName(e.target.value)} required />
          <input placeholder="Last Name" value={lastName} onChange={(e)=>setLastName(e.target.value)} required />
          <input value={email} readOnly />
          <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <input placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} required />
          <button disabled={otpLoading}>
            {otpLoading ? 'Registering...' : 'Register'}
          </button>
        </form>
      )}

      {/* STEP 3 */}
      {showOtpForm && (
        <form onSubmit={handleOtpVerification}>
          <input
            value={otp}
            ref={otpInputRef}
            onChange={(e)=>setOtp(e.target.value)}
            placeholder="Enter OTP"
            maxLength={6}
            required
          />
          <button disabled={otpLoading}>
            {otpLoading ? 'Verifying...' : 'Verify'}
          </button>

          <button type="button" onClick={handleResendOtp} disabled={resendCooldown > 0}>
            {resendCooldown > 0 ? `Resend (${resendCooldown})` : 'Resend OTP'}
          </button>
        </form>
      )}

      {!showSignupForm && !showOtpForm && (
        <p>
          Don't have an account? <Link to="/signup">Signup</Link>
        </p>
      )}
    </div>
  );
};
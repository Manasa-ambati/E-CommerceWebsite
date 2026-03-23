// src/pages/Signup.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { authAPI } from '../services/api';
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

  const { login, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const signupData = {
        name: firstName + ' ' + lastName, // name required by API
        email,
        password,
        phone,
      };

      const response = await authAPI.signup(signupData);
      const data: AuthResponse = response.data.data || response.data;

      // Check if OTP verification is required
      if (data.requiresOtp) {
        setShowOtpForm(true);
        setError('Please enter the OTP sent to your email');
        setLoading(false);
        return;
      }

      // If no OTP required (direct login)
      const token = data.token || data.accessToken;
      const userData = data.user || data;

      if (!token) throw new Error('No token returned from server');

      login(userData, token);
      navigate('/'); // Redirect to Home
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
      navigate('/'); // Redirect to Home
    } catch (err: any) {
      setError(err.response?.data?.message || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>{showOtpForm ? 'Verify Email' : 'Signup'}</h2>
      {error && <div className="signup-error">{error}</div>}

      {showOtpForm ? (
        <form className="signup-form" onSubmit={handleOtpVerification}>
          <input
            type="text"
            className="signup-input signup-otp-input"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            required
          />
          <button type="submit" className="signup-btn-primary" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>
      ) : (
        <form className="signup-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="signup-input"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            className="signup-input"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="email"
            className="signup-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="signup-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="text"
            className="signup-input"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <button type="submit" className="signup-btn-primary" disabled={loading}>
            {loading ? 'Signing up...' : 'Signup'}
          </button>
        </form>
      )}
      <p className="signup-footer-text">
        Already have an account? <Link to="/login" className="signup-link">Login here</Link>
      </p>
    </div>
  );
};

// src/pages/Login.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { authAPI } from '../services/api';
import { storageService } from '../services/storageService';
import './Login.css';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => { if (showOtpForm) otpInputRef.current?.focus(); }, [showOtpForm]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      storageService.set('saved_email', email, 43200);
      const res = await authAPI.login({ email });
      const data = res.data.data;
      if (data?.requiresOtp) { setShowOtpForm(true); setResendCooldown(30); }
      else login(data.user, data.token);
    } catch (err: any) { setError(err.response?.data?.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault(); setOtpLoading(true); setError('');
    try {
      const res = await authAPI.verifyOtp(email, otp);
      const data = res.data.data;
      login(data.user, data.token);
      navigate('/');
    } catch (err: any) { setError(err.response?.data?.message || 'OTP verification failed'); }
    finally { setOtpLoading(false); }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try { await authAPI.resendOtp(email); setResendCooldown(30); alert('OTP resent'); }
    catch { setError('Failed to resend OTP'); }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{showOtpForm ? 'Verify OTP' : 'Login'}</h2>
        {error && <div className="login-error">{error}</div>}

        {!showOtpForm ? (
          <form onSubmit={handleSendOtp}>
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <button type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send OTP'}</button>
          </form>
        ) : (
          <form onSubmit={handleOtpVerification}>
            <input type="text" placeholder="Enter OTP" maxLength={6} value={otp} ref={otpInputRef} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} required />
            <button type="submit" disabled={otpLoading}>{otpLoading ? 'Verifying...' : 'Verify & Login'}</button>
            <button type="button" disabled={resendCooldown>0} onClick={handleResendOtp}>{resendCooldown>0?`Resend in ${resendCooldown}s`:'Resend OTP'}</button>
          </form>
        )}

        <p>Don't have an account? <Link to="/signup">Signup</Link></p>
      </div>
    </div>
  );
};
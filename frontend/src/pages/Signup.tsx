// src/pages/Signup.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { authAPI } from '../services/api';
import { storageService } from '../services/storageService';
import './Signup.css';

export const Signup: React.FC = () => {
  const [firstName,setFirstName]=useState('');
  const [lastName,setLastName]=useState('');
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [phone,setPhone]=useState('');
  const [otp,setOtp]=useState('');
  const [showOtpForm,setShowOtpForm]=useState(false);
  const [loading,setLoading]=useState(false);
  const [resendCooldown,setResendCooldown]=useState(0);
  const [error,setError]=useState('');

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const otpInputRef = useRef<HTMLInputElement>(null);

  useEffect(()=>{if(user) navigate('/');}, [user,navigate]);
  useEffect(()=>{let t:NodeJS.Timeout;if(resendCooldown>0) t=setTimeout(()=>setResendCooldown(resendCooldown-1),1000); return()=>clearTimeout(t);}, [resendCooldown]);
  useEffect(()=>{if(showOtpForm) otpInputRef.current?.focus();}, [showOtpForm]);

  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true); setError('');
    try{
      const data = {name:firstName+' '+lastName,email,password,phone};
      const res = await authAPI.signup(data);
      if(res.data.data?.requiresOtp){ setShowOtpForm(true); setResendCooldown(30); storageService.set('pending_signup',data); return; }
      login(res.data.data.user,res.data.data.token); navigate('/');
    }catch(err:any){ setError(err.response?.data?.message||'Signup failed'); } finally{ setLoading(false);}
  };

  const handleOtpVerification=async(e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true); setError('');
    try{
      const res=await authAPI.verifyOtp(email,otp);
      login(res.data.data.user,res.data.data.token);
      storageService.remove('pending_signup'); navigate('/');
    }catch(err:any){setError(err.response?.data?.message||'OTP verification failed');} finally{setLoading(false);}
  };

  const handleResendOtp=async()=>{
    if(resendCooldown>0) return;
    try{await authAPI.resendOtp(email); setResendCooldown(30); alert('OTP resent');}catch{setError('Failed to resend OTP');}
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>{showOtpForm?'Verify OTP':'Signup'}</h2>
        {error && <div className="signup-error">{error}</div>}

        {!showOtpForm?(
          <form onSubmit={handleSubmit}>
            <input type="text" placeholder="First Name" value={firstName} onChange={e=>setFirstName(e.target.value)} required/>
            <input type="text" placeholder="Last Name" value={lastName} onChange={e=>setLastName(e.target.value)} required/>
            <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required/>
            <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/>
            <input type="text" placeholder="Phone" value={phone} onChange={e=>setPhone(e.target.value)} required/>
            <button type="submit" disabled={loading}>{loading?'Creating...':'Signup & Send OTP'}</button>
          </form>
        ):(
          <form onSubmit={handleOtpVerification}>
            <input type="text" placeholder="Enter OTP" value={otp} maxLength={6} ref={otpInputRef} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))} required/>
            <button type="submit" disabled={loading}>{loading?'Verifying...':'Verify & Create Account'}</button>
            <button type="button" disabled={resendCooldown>0} onClick={handleResendOtp}>{resendCooldown>0?`Resend in ${resendCooldown}s`:'Resend OTP'}</button>
          </form>
        )}

        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </div>
  );
};
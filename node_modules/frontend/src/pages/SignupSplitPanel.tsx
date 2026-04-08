import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { validateSignupForm, getPasswordStrength } from '../utils/validation';
import './SignupSplitPanel.css';

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}

const SignupSplitPanel: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState<'signup' | 'otp'>('signup');
  const [formData, setFormData] = useState<SignupData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  // Update password strength
  useEffect(() => {
    setPasswordStrength(getPasswordStrength(formData.password));
  }, [formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Quick validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.phone) {
      toast.addToast('Please fill in all required fields', 'error');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.addToast('Please enter a valid email address', 'error');
      return;
    }
    
    if (formData.password.length < 8) {
      toast.addToast('Password must be at least 8 characters', 'error');
      return;
    }

    setLoading(true);

    const signupPayload = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
      password: formData.password,
      phone: formData.phone
    };

    try {
      const response = await authAPI.signup(signupPayload);
      const data = response.data;

      if (data.requiresOtp) {
        toast.addToast('Signup successful! Please verify your email 🎉', 'success');
        setStep('otp');
        setResendDisabled(true);
        setCountdown(30);
      } else {
        toast.addToast('Signup successful! 🎉 Redirecting...', 'success');
        setTimeout(() => navigate('/login'), 1000);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
      setError(errorMessage);
      toast.addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      toast.addToast('Please enter a valid 6-digit OTP', 'error');
      return;
    }
    
    setLoading(true);

    try {
      const response = await authAPI.verifyOtp(formData.email, otp);
      const data = response.data;

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({
        id: data.id,
        email: data.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        name: `${formData.firstName} ${formData.lastName}`.trim() || data.name,
        role: data.role,
        emailVerified: true
      }));
      
      toast.addToast('Email verified successfully! Welcome to ShopEase!', 'success');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP. Please try again.';
      setError(errorMessage);
      toast.addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;

    setError('');
    setLoading(true);

    try {
      await authAPI.resendOtp(formData.email);
      setResendDisabled(true);
      setCountdown(30);
      toast.addToast('OTP resent to your email!', 'info');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP.';
      setError(errorMessage);
      toast.addToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return '#ef4444';
    if (passwordStrength === 2) return '#f97316';
    if (passwordStrength === 3) return '#f59e0b';
    if (passwordStrength === 4) return '#84cc16';
    return '#22c55e';
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return 'Very Weak';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    if (passwordStrength === 4) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className="split-signup-container">
      <div className="split-panel-wrapper">
        {/* Left Panel - Green Gradient */}
        <div className="left-panel">
          <div className="left-content">
            <h1>JOIN US</h1>
            <p>Create your account and start your shopping journey with amazing deals and offers.</p>
            <div className="decorative-circle circle1"></div>
            <div className="decorative-circle circle2"></div>
          </div>
        </div>

        {/* Right Panel - Signup Form */}
        <div className="right-panel">
          <div className="form-container">
            {step === 'signup' ? (
              <>
                <h2>Create Account</h2>

                <form onSubmit={handleSignup}>
                  <div className="name-row">
                    <div className="input-group">
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="First Name"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Last Name"
                        required
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Email Address"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      required
                    />
                  </div>

                  <div className="input-group password-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Password"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>

                  {formData.password && (
                    <div className="password-strength-indicator">
                      <div className="strength-bar-wrapper">
                        <div 
                          className="strength-bar-fill" 
                          style={{ 
                            width: `${(passwordStrength / 5) * 100}%`,
                            backgroundColor: getStrengthColor()
                          }}
                        />
                      </div>
                      <span className="strength-text" style={{ color: getStrengthColor() }}>
                        {getStrengthText()}
                      </span>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="signup-btn">
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>
                        Creating Account...
                      </>
                    ) : (
                      'Sign Up'
                    )}
                  </button>

                  <div className="login-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2>Verify Your Email</h2>
                <p className="otp-subtitle">Enter the 6-digit OTP sent to {formData.email}</p>

                <form onSubmit={handleOtpVerification}>
                  <div className="otp-inputs">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={otp[index] || ''}
                        onChange={(e) => {
                          const newOtp = otp.split('');
                          newOtp[index] = e.target.value;
                          setOtp(newOtp.join(''));
                          
                          if (e.target.value && index < 5) {
                            const nextInput = document.querySelectorAll('.otp-single-input')[index + 1];
                            if (nextInput) (nextInput as HTMLInputElement).focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !otp[index] && index > 0) {
                            const prevInput = document.querySelectorAll('.otp-single-input')[index - 1];
                            if (prevInput) (prevInput as HTMLInputElement).focus();
                          }
                        }}
                        className="otp-single-input"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <button type="submit" disabled={loading || otp.length !== 6} className="verify-btn">
                    {loading ? (
                      <>
                        <span className="loading-spinner"></span>
                        Verifying...
                      </>
                    ) : (
                      'Verify & Continue'
                    )}
                  </button>

                  <div className="resend-section">
                    Didn't receive OTP?{' '}
                    <button 
                      type="button"
                      onClick={handleResendOtp} 
                      disabled={resendDisabled || loading}
                      className="resend-btn"
                    >
                      {resendDisabled ? `Resend in ${countdown}s` : 'Resend OTP'}
                    </button>
                  </div>

                  <button 
                    type="button"
                    className="back-to-signup"
                    onClick={() => setStep('signup')}
                  >
                    ← Back to Sign Up
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupSplitPanel;

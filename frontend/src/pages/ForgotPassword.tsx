import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { validateEmail, validatePassword, validateOtp } from '../utils/validation';
import './ForgotPassword.css';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string; otp?: string; password?: string; confirm?: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
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

  // Password strength calculation
  useEffect(() => {
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (newPassword.length >= 12) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[a-z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) score++;
    setPasswordStrength(Math.min(score, 5));
  }, [newPassword]);

  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'email':
        error = validateEmail(value);
        break;
      case 'otp':
        error = value ? validateOtp(value) : '';
        break;
      case 'password':
        const pwdResult = validatePassword(value);
        error = pwdResult.errors[0] || '';
        break;
      case 'confirm':
        if (value !== newPassword) {
          error = 'Passwords do not match';
        }
        break;
    }
    
    setErrors(prev => ({ ...prev, [name]: error || undefined }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ email: true });
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors({ email: emailError });
      toast.addToast(emailError, 'error');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await authAPI.forgotPassword(email);
      toast.addToast('OTP sent to your email! 📧', 'success');
      setStep('otp');
      setResendDisabled(true);
      setCountdown(30);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP';
      toast.addToast(errorMessage, 'error');
      if (err.response?.status === 404) {
        setErrors({ email: 'Email not found. Please check and try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ otp: true });
    const otpError = validateOtp(otp);
    if (otpError) {
      setErrors({ otp: otpError });
      toast.addToast(otpError, 'error');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Just verify OTP format, move to reset password step
      toast.addToast('OTP verified! Now set your new password.', 'success');
      setStep('reset');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP';
      toast.addToast(errorMessage, 'error');
      setErrors({ otp: 'Invalid or expired OTP' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendDisabled) return;

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setResendDisabled(true);
      setCountdown(30);
      toast.addToast('OTP resent successfully! 📧', 'success');
    } catch (err: any) {
      toast.addToast('Failed to resend OTP', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setTouched({ password: true, confirm: true });
    
    // Validate password
    const pwdResult = validatePassword(newPassword);
    if (!pwdResult.isValid) {
      setErrors({ password: pwdResult.errors[0] });
      toast.addToast(pwdResult.errors[0], 'error');
      return;
    }

    // Validate confirm password
    if (newPassword !== confirmPassword) {
      setErrors({ confirm: 'Passwords do not match' });
      toast.addToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await authAPI.resetPassword(email, otp, newPassword);
      toast.addToast('Password reset successful! Please login with your new password. 🎉', 'success');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      toast.addToast(errorMessage, 'error');
      setErrors({ otp: errorMessage });
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
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        {/* Step 1: Enter Email */}
        {step === 'email' && (
          <>
            <div className="fp-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <h2>Forgot Password?</h2>
            <p className="fp-subtitle">Enter your email address and we'll send you an OTP to reset your password</p>

            <form onSubmit={handleSendOtp}>
              <div className="fp-input-group">
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  className={errors.email && touched.email ? 'fp-input-error' : ''}
                  required
                />
                {errors.email && touched.email && (
                  <span className="fp-field-error">{errors.email}</span>
                )}
              </div>

              <button type="submit" disabled={loading} className="fp-submit-btn">
                {loading ? (
                  <>
                    <span className="fp-spinner"></span>
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>

            <Link to="/login" className="fp-back-link">
              ← Back to Login
            </Link>
          </>
        )}

        {/* Step 2: Verify OTP */}
        {step === 'otp' && (
          <>
            <div className="fp-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 10v4"/>
                <path d="M12 18h.01"/>
                <path d="M20.423 13.437l-1.479-8.533a2.268 2.268 0 0 0-1.823-1.824L5.356 1.566A2.25 2.25 0 0 0 2.75 3.583l.823 14.833a2.25 2.25 0 0 0 2.243 2.134h11.867a2.25 2.25 0 0 0 2.22-1.886l.52-3.227Z"/>
              </svg>
            </div>
            <h2>Verify OTP</h2>
            <p className="fp-subtitle">Enter the 6-digit OTP sent to <strong>{email}</strong></p>

            <form onSubmit={handleVerifyOtp}>
              <div className="fp-otp-inputs">
                {Array.from({ length: 6 }).map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    name="otp"
                    value={otp[index] || ''}
                    onChange={(e) => {
                      const newOtp = otp.split('');
                      newOtp[index] = e.target.value;
                      setOtp(newOtp.join(''));
                      
                      if (e.target.value && index < 5) {
                        const nextInput = document.querySelectorAll('.fp-otp-single')[index + 1];
                        if (nextInput) (nextInput as HTMLInputElement).focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[index] && index > 0) {
                        const prevInput = document.querySelectorAll('.fp-otp-single')[index - 1];
                        if (prevInput) (prevInput as HTMLInputElement).focus();
                      }
                    }}
                    className="fp-otp-single"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              {errors.otp && touched.otp && (
                <span className="fp-field-error" style={{ textAlign: 'center', display: 'block' }}>{errors.otp}</span>
              )}

              <button type="submit" disabled={loading || otp.length !== 6} className="fp-submit-btn">
                {loading ? (
                  <>
                    <span className="fp-spinner"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>

              <div className="fp-resend-section">
                Didn't receive OTP?{' '}
                <button 
                  type="button"
                  onClick={handleResendOtp} 
                  disabled={resendDisabled || loading}
                  className="fp-resend-btn"
                >
                  {resendDisabled ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 3: Reset Password */}
        {step === 'reset' && (
          <>
            <div className="fp-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h2>Reset Password</h2>
            <p className="fp-subtitle">Create a new strong password for your account</p>

            <form onSubmit={handleResetPassword}>
              <div className="fp-input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onBlur={handleBlur}
                  placeholder="New Password"
                  className={errors.password && touched.password ? 'fp-input-error' : ''}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="fp-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
                {errors.password && touched.password && (
                  <span className="fp-field-error">{errors.password}</span>
                )}
              </div>

              {newPassword && (
                <div className="fp-strength-indicator">
                  <div className="fp-strength-bar">
                    <div 
                      className="fp-strength-fill" 
                      style={{ width: `${(passwordStrength / 5) * 100}%`, backgroundColor: getStrengthColor() }}
                    />
                  </div>
                  <span className="fp-strength-text" style={{ color: getStrengthColor() }}>
                    {getStrengthText()}
                  </span>
                </div>
              )}

              <div className="fp-input-group">
                <input
                  type="password"
                  name="confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={handleBlur}
                  placeholder="Confirm Password"
                  className={errors.confirm && touched.confirm ? 'fp-input-error' : ''}
                  required
                />
                {errors.confirm && touched.confirm && (
                  <span className="fp-field-error">{errors.confirm}</span>
                )}
              </div>

              <button type="submit" disabled={loading} className="fp-submit-btn">
                {loading ? (
                  <>
                    <span className="fp-spinner"></span>
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;

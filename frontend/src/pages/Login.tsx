import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { validateLoginForm } from '../utils/validation';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Handle field blur for validation
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate on blur
    const errors = validateLoginForm(email, password);
    if (errors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: errors[field] }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Real-time validation on change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (touched.email) {
      const error = validateLoginForm(value, password).email;
      setValidationErrors(prev => ({
        ...prev,
        email: error || ''
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (touched.password) {
      const error = validateLoginForm(email, value).password;
      setValidationErrors(prev => ({
        ...prev,
        password: error || ''
      }));
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate entire form before submission
    const errors = validateLoginForm(email, password);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setTouched({ email: true, password: true });
      
      // Show first error as toast
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }
    
    setLoading(true);

    console.log('📤 Sending password login request:', { email, password: '***' });

    try {
      const response = await authAPI.login({ email, password });
      console.log('📥 Login response received:', response.data);
      
      // Backend returns: { success: true, message: "...", token: "...", data: { userData } }
      const loginData = response.data;
      const userData = loginData.data; // Extract the actual user data from nested 'data' field
      
      console.log('Extracted userData:', userData);
      console.log('Token:', loginData.token);
      
      if (!userData) {
        throw new Error('No user data received from server');
      }
      
      localStorage.setItem('token', loginData.token || '');
      const userObject = {
        id: userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        role: userData.role,
        emailVerified: userData.emailVerified ?? true // Assume verified if coming from backend
      };
      localStorage.setItem('user', JSON.stringify(userObject));
      console.log('✅ User stored in localStorage:', userObject);
      
      toast.success('Login successful! Welcome back.');
      setTimeout(() => navigate('/'), 1000);
    } catch (err: any) {
      console.error('❌ Password login failed:', err);
      console.error('📄 Error response:', err.response?.data);
      console.error('📊 Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Check if email is not registered (404 or specific message)
      if (err.response?.status === 404 || errorMessage.includes('not found') || errorMessage.includes('not registered')) {
        toast.info('Email not registered. Please create an account instead.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async () => {
    try {
      // TODO: Implement Google OAuth
      // For now, show a more engaging message
      toast.info('🚀 Redirecting to Google...', { autoClose: 2000 });
      
      // Simulate redirect (remove this in production)
      setTimeout(() => {
        toast.warning('Google OAuth integration coming soon! Please use email login.', { 
          autoClose: 4000 
        });
      }, 2000);
      
      // Production code:
      // const response = await authAPI.loginWithGoogle();
      // window.location.href = response.data.authUrl;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Google login failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Handle Apple Login
  const handleAppleLogin = async () => {
    try {
      // TODO: Implement Apple OAuth
      toast.info('🍎 Redirecting to Apple...', { autoClose: 2000 });
      
      // Simulate redirect (remove this in production)
      setTimeout(() => {
        toast.warning('Apple OAuth integration coming soon! Please use email login.', { 
          autoClose: 4000 
        });
      }, 2000);
      
      // Production code:
      // const response = await authAPI.loginWithApple();
      // window.location.href = response.data.authUrl;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Apple login failed. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
    if (email) {
      setResetEmail(email);
    }
  };

  // Handle Password Reset Submission
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    const emailError = validateLoginForm(resetEmail, '').email;
    if (emailError) {
      toast.error(emailError);
      return;
    }
    
    setResetLoading(true);
    
    try {
      // TODO: Implement actual password reset API call
      // await authAPI.forgotPassword({ email: resetEmail });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Password reset link sent to ${resetEmail}!`);
      setShowForgotPasswordModal(false);
      setResetEmail('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send reset link. Please try again.';
      toast.error(errorMessage);
    } finally {
      setResetLoading(false);
    }
  };

  // Close modal
  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setResetEmail('');
  };

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
      <p className="subtitle">Sign in to continue shopping</p>
      
      <form onSubmit={handlePasswordLogin}>
        <div className="form-group">
          <label>
            Email Address <span className="required">*</span>
          </label>
          <input
            type="email"
            placeholder="john.doe@example.com"
            value={email}
            onChange={handleEmailChange}
            onBlur={() => handleBlur('email')}
            required
          />
          {touched.email && validationErrors.email && (
            <span className="field-error">{validationErrors.email}</span>
          )}
        </div>
        <div className="form-group password-field">
          <label>
            Password <span className="required">*</span>
          </label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
          {touched.password && validationErrors.password && (
            <span className="field-error">{validationErrors.password}</span>
          )}
          <div className="forgot-password-link">
            <button 
              type="button" 
              className="forgot-password-btn"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>
        </div>
        <button 
          type="submit" 
          disabled={loading || Object.keys(validationErrors).length > 0}
          className={`login-btn ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Logging in...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Login
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="auth-divider">
        <span>OR</span>
      </div>

      {/* Social Login Buttons */}
      <div className="social-login-container">
        <button 
          type="button" 
          className="social-btn google-btn"
          onClick={handleGoogleLogin}
          aria-label="Login with Google"
        >
          <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
        
        <button 
          type="button" 
          className="social-btn apple-btn"
          onClick={handleAppleLogin}
          aria-label="Login with Apple"
        >
          <svg className="apple-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.74.62 3.66 1.61-3.1 1.86-2.61 6.27.75 7.62zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          Continue with Apple
        </button>
      </div>

      <p>
        Don't have an account?{' '}
        <Link to="/signup">Sign up here</Link>
      </p>

      {error && <div className="error-message">{error}</div>}

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="modal-overlay" onClick={closeForgotPasswordModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeForgotPasswordModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="modal-header">
              <div className="modal-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3>Reset Your Password</h3>
              <p>Enter your email address and we'll send you a link to reset your password.</p>
            </div>
            
            <form onSubmit={handlePasswordResetSubmit}>
              <div className="form-group">
                <label>
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="modal-btn cancel-btn"
                  onClick={closeForgotPasswordModal}
                  disabled={resetLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="modal-btn submit-btn"
                  disabled={resetLoading}
                >
                  {resetLoading ? (
                    <>
                      <span className="spinner-small"></span>
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;

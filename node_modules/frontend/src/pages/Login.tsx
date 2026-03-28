import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import { validateLoginForm } from "../utils/validation";
import './ModernAuth.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateLoginForm(email, password);
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.addToast(firstError as string, 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      
      // Handle nested response structure
      const userData = response.data.data || response.data;
      
      // Store user data
      localStorage.setItem('user', JSON.stringify(userData));
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      toast.addToast('Login successful! Welcome back 👋', 'success');
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.addToast(errorMessage, 'error');
      
      // Check if email is not registered
      if (err.response?.status === 404 || errorMessage.includes('not found') || errorMessage.includes('not registered')) {
        toast.addToast('Email not registered. Please create an account instead.', 'info');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modern-auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🛍️</div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to continue shopping</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-wrapper">
              <span className="form-input-icon">📧</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="form-input-wrapper">
              <span className="form-input-icon">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div className="forgot-password">
              <a href="#" className="forgot-password-link" onClick={(e) => { e.preventDefault(); toast.addToast('Forgot password feature coming soon!', 'info'); }}>
                Forgot Password?
              </a>
            </div>
          </div>

          {/* Remember Me */}
          <div className="checkbox-container">
            <input type="checkbox" id="keep-signed-in" />
            <label htmlFor="keep-signed-in">Keep me signed in</label>
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Divider */}
          <div className="divider">
            <span>or continue with</span>
          </div>

          {/* Social Login */}
          <div className="social-login">
            <button type="button" className="social-btn google" onClick={() => toast.addToast('Google login coming soon!', 'info')}>
              G
            </button>
            <button type="button" className="social-btn facebook" onClick={() => toast.addToast('Facebook login coming soon!', 'info')}>
              f
            </button>
            <button type="button" className="social-btn apple" onClick={() => toast.addToast('Apple login coming soon!', 'info')}>
              🍎
            </button>
          </div>

          {/* Footer */}
          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-footer-link">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

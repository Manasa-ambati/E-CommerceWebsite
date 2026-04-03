import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import { validateLoginForm } from "../utils/validation";
import './LoginAmazon.css';

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
    <div className="amazon-login-container">
      {/* Logo */}
      <div className="amazon-logo">
        <h2>shop<span>easy</span></h2>
      </div>

      {/* Login Card */}
      <div className="login-container">
        <h2>Sign In</h2>
        
        <form onSubmit={handleLogin}>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div className="password-row">
              <label className="form-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-password-link" onClick={(e) => { e.preventDefault(); toast.addToast('Forgot password feature coming soon!', 'info'); }}>
                Forgot your password?
              </Link>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          {/* Sign In Button */}
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

          {/* Keep me signed in */}
          <div className="checkbox-container">
            <input type="checkbox" id="keep-signed-in" />
            <label htmlFor="keep-signed-in">Keep me signed in.</label>{' '}
            <Link to="/help" onClick={(e) => { e.preventDefault(); toast.addToast('Help section coming soon!', 'info'); }}>Details</Link>
          </div>
        </form>
      </div>

      {/* New Customer Section */}
      <div className="create-account-section">
        <div className="divider">
          <span>New customer?</span>
        </div>
        <Link to="/signup" className="create-account-btn">
          Create your account
        </Link>
      </div>

      {/* Footer Links */}
      <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px', color: '#555' }}>
        <div style={{ marginBottom: '10px' }}>
          <a href="#" style={{ color: '#0066c0', textDecoration: 'none', margin: '0 10px' }} onClick={(e) => { e.preventDefault(); toast.addToast('Conditions of Use', 'info'); }}>Conditions of Use</a>
          <a href="#" style={{ color: '#0066c0', textDecoration: 'none', margin: '0 10px' }} onClick={(e) => { e.preventDefault(); toast.addToast('Privacy Notice', 'info'); }}>Privacy Notice</a>
          <a href="#" style={{ color: '#0066c0', textDecoration: 'none', margin: '0 10px' }} onClick={(e) => { e.preventDefault(); toast.addToast('Help', 'info'); }}>Help</a>
        </div>
        <div>
          © 1996-2026, ShopEasy.com, Inc. or its affiliates
        </div>
      </div>
    </div>
  );
};

export default Login;

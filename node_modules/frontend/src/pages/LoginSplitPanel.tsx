import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import { validateLoginForm } from "../utils/validation";
import './LoginSplitPanel.css';

const LoginSplitPanel: React.FC = () => {
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
    <div className="split-login-container">
      <div className="split-panel-wrapper">
        {/* Left Panel - Blue Gradient */}
        <div className="left-panel">
          <div className="left-content">
            <h1>WELCOME</h1>
            <p>Your one-stop shop for everything you need. Discover amazing products at great prices.</p>
            <div className="decorative-circle circle1"></div>
            <div className="decorative-circle circle2"></div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="right-panel">
          <div className="form-container">
            <h2>Sign in</h2>

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                />
              </div>

              <div className="input-group password-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
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

              <button type="submit" disabled={loading} className="signin-btn">
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>

              <Link to="/forgot-password" className="forgot-link" onClick={(e) => { e.preventDefault(); toast.addToast('Forgot password feature coming soon!', 'info'); }}>
                Forgot your password?
              </Link>

              <div className="signup-footer">
                Don't have an account? <Link to="/signup">Sign up</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSplitPanel;

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { useToast } from "../context/ToastContext";
import { validateLoginForm, validateEmail } from "../utils/validation";
import './LoginSplitPanel.css';

const LoginSplitPanel: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  const [touched, setTouched] = useState<{email?: boolean; password?: boolean}>({});

  // Real-time validation
  const validateField = (name: string, value: string) => {
    if (name === 'email') {
      const error = validateEmail(value);
      setErrors(prev => ({ ...prev, email: error }));
    } else if (name === 'password') {
      if (!value) {
        setErrors(prev => ({ ...prev, password: 'Password is required' }));
      } else {
        setErrors(prev => ({ ...prev, password: undefined }));
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'email') setEmail(value);
    else if (name === 'password') setPassword(value);
    
    // Validate on change if field was touched
    if (touched[name as keyof typeof touched]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    // Validate form
    const validationErrors = validateLoginForm(email, password);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      toast.addToast(firstError as string, 'error');
      return;
    }

    setLoading(true);
    setErrors({});

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
      
      // Set field-specific errors
      if (err.response?.status === 401) {
        setErrors({ password: 'Invalid email or password' });
      } else if (err.response?.status === 404) {
        setErrors({ email: 'Email not registered. Please create an account.' });
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
                  name="email"
                  value={email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Email Address"
                  className={errors.email && touched.email ? 'input-error' : ''}
                  required
                />
                {errors.email && touched.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>

              <div className="input-group password-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="Password"
                  className={errors.password && touched.password ? 'input-error' : ''}
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
                {errors.password && touched.password && (
                  <span className="field-error">{errors.password}</span>
                )}
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

              <Link to="/forgot-password" className="forgot-link">
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

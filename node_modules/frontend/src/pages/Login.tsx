import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { validateLoginForm } from '../utils/validation';
import './Auth.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

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
    } finally {
      setLoading(false);
    }
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
        </div>
        <button 
          type="submit" 
          disabled={loading || Object.keys(validationErrors).length > 0}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p>
        Don't have an account?{' '}
        <Link to="/signup">Sign up here</Link>
      </p>

      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default Login;

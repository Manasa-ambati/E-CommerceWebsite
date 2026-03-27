import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { toast } from "react-toastify";
import { validateLoginForm } from "../utils/validation";
import './LoginAmazon.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateLoginForm(email, password);
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError as string);
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
      
      toast.success('Login successful! Welcome back 👋');
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
      window.dispatchEvent(new Event('storage'));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
      
      // Check if email is not registered
      if (err.response?.status === 404 || errorMessage.includes('not found') || errorMessage.includes('not registered')) {
        toast.info('Email not registered. Please create an account instead.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="amazon-login-container">
      <div className="amazon-logo">
        <h2>Shop<span>Ease</span></h2>
      </div>
      
      <div className="login-container">
        <h2>Login</h2>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email or mobile phone number</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter your email or phone number"
              required
            />
          </div>
          
          <div className="form-group">
            <div className="password-row">
              <label className="form-label">Password</label>
              <a href="#" className="forgot-password-link" onClick={(e) => { e.preventDefault(); toast.info('Forgot password feature coming soon!'); }}>
                Forgot Password?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
          
          <div className="checkbox-container">
            <input type="checkbox" id="keep-signed-in" />
            <label htmlFor="keep-signed-in">Keep me signed in.</label>
            <a href="#" onClick={(e) => { e.preventDefault(); toast.info('Learn more about secure sign-in'); }}>Details</a>
          </div>
          
          <div className="divider">
            <span>New to ShopEase?</span>
          </div>
        </form>
      </div>
      
      <div className="create-account-section">
        <button className="create-account-btn" onClick={() => navigate('/signup')}>
          Create your ShopEase account
        </button>
      </div>
    </div>
  );
};

export default Login;

import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Company Info & Social Media Section */}
        <div className="footer-section company-section">
          <h3 className="footer-logo">ShopEase</h3>
          <p className="footer-description">
            Your one-stop destination for all your shopping needs. Quality products, great prices, and excellent service.
          </p>
          
          {/* Enhanced Social Media Icons */}
          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon facebook" title="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon twitter" title="Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon instagram" title="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon linkedin" title="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon youtube" title="YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
            <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="social-icon whatsapp" title="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
            </a>
          </div>
        </div>
        
        {/* Quick Links Section */}
        <div className="footer-section links-section">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/categories">Categories</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/orders">My Orders</Link></li>
            <li><Link to="/wishlist">Wishlist</Link></li>
          </ul>
        </div>
        
        {/* Customer Service Section */}
        <div className="footer-section links-section">
          <h4>Customer Service</h4>
          <ul>
            <li><Link to="/profile">My Account</Link></li>
            <li><button type="button" className="footer-link-button">Contact Us</button></li>
            <li><button type="button" className="footer-link-button">FAQ</button></li>
            <li><button type="button" className="footer-link-button">Shipping Info</button></li>
            <li><button type="button" className="footer-link-button">Returns & Refunds</button></li>
            <li><button type="button" className="footer-link-button">Track Order</button></li>
          </ul>
        </div>
        
        {/* Newsletter & App Download Section */}
        <div className="footer-section newsletter-app-section">
          <h4>Stay Connected</h4>
          
          {/* Newsletter Subscription */}
          <div className="newsletter-section">
            <p className="newsletter-text">Subscribe to get latest updates & offers</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Your email address" />
              <button type="submit">→</button>
            </div>
          </div>
          
          {/* App Download with QR Code */}
          <div className="app-download-section">
            <h4>Download Our App</h4>
            <p className="app-text">Scan QR code to download</p>
            <div className="qr-code-container">
              <div className="qr-code">
                <svg viewBox="0 0 100 100" fill="currentColor">
                  <rect x="0" y="0" width="100" height="100" fill="white"/>
                  <rect x="10" y="10" width="30" height="30" fill="black"/>
                  <rect x="60" y="10" width="30" height="30" fill="black"/>
                  <rect x="10" y="60" width="30" height="30" fill="black"/>
                  <rect x="15" y="15" width="20" height="20" fill="white"/>
                  <rect x="65" y="15" width="20" height="20" fill="white"/>
                  <rect x="15" y="65" width="20" height="20" fill="white"/>
                  <rect x="20" y="20" width="10" height="10" fill="black"/>
                  <rect x="70" y="20" width="10" height="10" fill="black"/>
                  <rect x="20" y="70" width="10" height="10" fill="black"/>
                  <rect x="50" y="50" width="10" height="10" fill="black"/>
                  <rect x="70" y="70" width="10" height="10" fill="black"/>
                  <rect x="50" y="10" width="5" height="5" fill="black"/>
                  <rect x="60" y="20" width="5" height="5" fill="black"/>
                  <rect x="40" y="60" width="5" height="5" fill="black"/>
                  <rect x="80" y="50" width="5" height="5" fill="black"/>
                </svg>
              </div>
              <div className="app-stores">
                <button className="store-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <div className="store-text">
                    <span>Download on the</span>
                    <strong>App Store</strong>
                  </div>
                </button>
                <button className="store-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                  </svg>
                  <div className="store-text">
                    <span>Get it on</span>
                    <strong>Google Play</strong>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2026 ShopEase. All rights reserved.</p>
          <div className="footer-bottom-links">
            <button type="button" className="footer-link-button">Privacy Policy</button>
            <button type="button" className="footer-link-button">Terms of Service</button>
            <button type="button" className="footer-link-button">Cookie Policy</button>
            <button type="button" className="footer-link-button">Security</button>
          </div>
          <div className="payment-methods">
            <span>We Accept:</span>
            <div className="payment-icons">
              <svg viewBox="0 0 48 48" width="36" height="36"><rect fill="#FF5F00" width="48" height="48"/><path fill="#EB001B" d="M17.136,30.084l2.696-13.008h-4.224L12.912,30.084H17.136z M29.952,17.076c-0.84-0.312-1.92-0.48-3.264-0.48c-3.6,0-6.144,1.848-6.168,4.488c-0.024,1.944,1.8,3.024,3.192,3.696c1.416,0.672,1.896,1.104,1.896,1.704c0,0.936-1.152,1.344-2.208,1.344c-1.464,0-2.256-0.216-3.456-0.72l-0.48-0.216l-0.504,2.448c0.864,0.384,2.448,0.72,4.08,0.72c3.84,0,6.336-1.824,6.36-4.656c0-1.56-0.96-2.736-3.072-3.696C25.056,21.156,24.6,20.868,24.6,20.268c0-0.528,0.6-1.08,1.92-1.08c1.08,0,1.872,0.216,2.472,0.456l0.288,0.144L29.952,17.076z M37.8,30.084h3.888l-2.4-13.008h-3.336c-1.056,0-1.848,0.6-2.136,1.368l-6.048,11.64h4.272l0.864-2.304h5.232L37.8,30.084z M33.24,24.996l1.608-4.224l0.936,4.224H33.24z"/></svg>
              <svg viewBox="0 0 48 48" width="36" height="36"><path fill="#006FCF" d="M36.8,12.8H11.2C8.5,12.8,6.4,14.9,6.4,17.6v12.8c0,2.7,2.1,4.8,4.8,4.8h25.6c2.7,0,4.8-2.1,4.8-4.8V17.6C41.6,14.9,39.5,12.8,36.8,12.8z M35.2,30.4H12.8V17.6h22.4V30.4z"/><path fill="#006FCF" d="M24,20.8c-2.7,0-4.8,2.1-4.8,4.8s2.1,4.8,4.8,4.8s4.8-2.1,4.8-4.8S26.7,20.8,24,20.8z M24,28.8c-1.8,0-3.2-1.4-3.2-3.2s1.4-3.2,3.2-3.2s3.2,1.4,3.2,3.2S25.8,28.8,24,28.8z"/></svg>
              <svg viewBox="0 0 48 48" width="36" height="36"><path fill="#E8E8E8" d="M40,12H8C5.8,12,4,13.8,4,16v16c0,2.2,1.8,4,4,4h32c2.2,0,4-1.8,4-4V16C44,13.8,42.2,12,40,12z"/><path fill="#006FCF" d="M24,20.8c-2.7,0-4.8,2.1-4.8,4.8s2.1,4.8,4.8,4.8s4.8-2.1,4.8-4.8S26.7,20.8,24,20.8z"/><path fill="#EB001B" d="M32,25.6c0,1.5-0.5,2.8-1.4,3.8l-2.9-2.9c0.3-0.3,0.5-0.7,0.5-1.2c0-0.9-0.7-1.6-1.6-1.6c-0.2,0-0.4,0-0.6,0.1l-2.9-2.9c0.9-0.8,2.1-1.3,3.4-1.3C29.6,19.6,32,22,32,25.6z"/><path fill="#F79E1B" d="M16,25.6c0-0.2,0-0.4,0.1-0.6l-2.9,2.9c-0.9-1-1.4-2.3-1.4-3.8c0-3.6,2.4-6,5.6-6c1.3,0,2.5,0.5,3.4,1.3l-2.9,2.9c-0.2-0.1-0.4-0.1-0.6-0.1c-0.9,0-1.6,0.7-1.6,1.6c0,0.5,0.2,0.9,0.5,1.2l-2.9,2.9C16.5,28.4,16,27.1,16,25.6z"/></svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

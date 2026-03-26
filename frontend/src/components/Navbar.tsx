import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { wishlistAPI } from "../services/api";
import { useAuth } from "../context/authContext";

import "./Navbar.css";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, logout } = useAuth(); // ✅ USE CONTEXT

  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  
  // fallback for refresh
  const storedUser = localStorage.getItem("user");
  const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);

  // login check
  const isLoggedIn = !!currentUser;

  // Close profile dropdown when clicking outside
  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;

    if (!target.closest(".profile-dropdown-container")) {
      setShowProfileDropdown(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);  // Removed showProfileDropdown from dependencies - it's not needed

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);
  
  // Fetch wishlist count when logged in
  useEffect(() => {
    const fetchWishlistCount = async () => {
      if (isLoggedIn) {
        try {
          // Try to fetch from backend first
          const response = await wishlistAPI.get();
          const items = response.data?.data || [];
          setWishlistCount(Array.isArray(items) ? items.length : 0);
        } catch (error) {
          // Fallback to localStorage
          const localWishlist = localStorage.getItem('wishlist');
          if (localWishlist) {
            try {
              const items = JSON.parse(localWishlist);
              setWishlistCount(Array.isArray(items) ? items.length : 0);
            } catch (e) {
              setWishlistCount(0);
            }
          } else {
            setWishlistCount(0);
          }
        }
      } else {
        setWishlistCount(0);
      }
    };
    
    fetchWishlistCount();
  }, [isLoggedIn]);
  
  /* ---------------- SEARCH HANDLER ---------------- */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  /* ---------------- CAMERA SEARCH ---------------- */
  const handleCameraSearch = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        alert(
          `Image uploaded: ${file.name}\nVisual search functionality would go here.`
        );
      }
    };
    input.click();
  };

  
  /* ---------------- VOICE SEARCH ---------------- */
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(
        "Voice search is not supported in your browser. Please use Chrome or Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => alert("Listening... Please speak now");

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      navigate(`/products?search=${encodeURIComponent(transcript)}`);
    };

    recognition.onerror = (event: any) =>
      alert("Voice recognition error: " + event.error);

    recognition.start();
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-main-content">
          {/* LEFT SIDE - LOGO & MOBILE TOGGLE */}
          <div className="navbar-left">
            <Link to="/" className="navbar-logo">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="url(#logo-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <defs>
                  <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: "#f97316" }} />
                    <stop offset="100%" style={{ stopColor: "#ec4899" }} />
                  </linearGradient>
                </defs>
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                <circle cx="12" cy="12" r="3" fill="var(--primary)" opacity="0.3"></circle>
              </svg>
              <span className="logo-text">ShopEase</span>
            </Link>

            <button
              className={`mobile-toggle ${mobileMenuOpen ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>

          {/* MOBILE MENU OVERLAY */}
          <div className={`mobile-menu-overlay ${mobileMenuOpen ? "open" : ""}`} onClick={(e) => {
            if (e.target === e.currentTarget) {
              setMobileMenuOpen(false);
            }
          }}>
            <div className="mobile-menu-content">
              {/* Mobile Menu Header - Simplified, no close button */}
              <div className="mobile-menu-header">
                <Link to="/" className="mobile-logo" onClick={() => setMobileMenuOpen(false)}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="url(#mobile-logo-gradient)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  > 
                    <defs>
                      <linearGradient id="mobile-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#f97316" }} />
                        <stop offset="100%" style={{ stopColor: "#ec4899" }} />
                      </linearGradient>
                    </defs>
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path>
                    <circle cx="12" cy="12" r="3" fill="var(--primary)" opacity="0.3"></circle>
                  </svg>
                  <span className="mobile-logo-text">ShopEase</span>
                </Link>
              </div>

              {/* Mobile Navigation Links */}
              <div className="mobile-nav-links">
                {isLoggedIn ? (
                  <>
                    <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      Home
                    </Link>
                    <Link to="/products" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                      </svg>
                      Products
                    </Link>
                    <Link to="/wishlist" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                      </svg>
                      Wishlist
                      {wishlistCount > 0 && <span className="mobile-badge">{wishlistCount}</span>}
                    </Link>
                    <Link to="/cart" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="8" cy="21" r="1"></circle>
                        <circle cx="19" cy="21" r="1"></circle>
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                      </svg>
                      Cart
                      {cartCount > 0 && <span className="mobile-cart-count">{cartCount}</span>}
                    </Link>
                    <Link to="/orders" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                        <path d="M3 6h18"></path>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                      </svg>
                      Orders
                    </Link>
                      <div className="mobile-user-section">
                        <div className="mobile-user-info">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          <span>
                            {(() => {
                              if (currentUser?.firstName) {
                                return currentUser.firstName;
                              }
                              if (currentUser?.name) {
                                // Extract first name from full name
                                const firstName = currentUser.name.split(' ')[0];
                                return firstName;
                              }
                              return currentUser?.email || 'Guest';
                            })()}
                          </span>
                        </div>
                      <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Profile Settings
                      </Link>
                      <button 
                        className="mobile-logout-btn"
                        onClick={() => {
                          logout();   // from AuthContext
                          navigate("/login");
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" x2="9" y1="12" y2="12"></line>
                        </svg>
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                      Home
                    </Link>
                    <Link to="/products" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                      </svg>
                      Products
                    </Link>
                    <div className="mobile-auth-section">
                      <div className="mobile-auth-buttons">
                        <Link to="/login" className="mobile-btn mobile-login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                        <Link to="/signup" className="mobile-btn mobile-signup" onClick={() => setMobileMenuOpen(false)}>Sign Up</Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* SEARCH BAR */}
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for products,categories, brands and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="search-actions">
              <button type="button" onClick={handleCameraSearch} title="Search with Camera" className="camera-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                  <circle cx="12" cy="13" r="3"></circle>
                </svg>
              </button>
              <button type="button" onClick={handleVoiceSearch} title="Search with Voice" className="voice-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" x2="12" y1="19" y2="22"></line>
                </svg>
              </button>
              <button type="submit" title="Search" className="search-submit-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>
          </form>

          {/* NAV LINKS */}
          <div className="navbar-nav">
            {isLoggedIn ? (
              // Logged In Navigation
              <>
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/products" className="nav-link">Products</Link>
                <Link to="/wishlist" className="nav-link nav-link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                  </svg>
                  <span className="nav-text">Wishlist</span>
                  {wishlistCount > 0 && <span className="nav-badge">{wishlistCount}</span>}
                </Link>
                <Link to="/cart" className="nav-link nav-link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="8" cy="21" r="1"></circle>
                    <circle cx="19" cy="21" r="1"></circle>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                  </svg>
                  <span className="nav-text">Cart</span>
                  {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
                </Link>
                <Link to="/orders" className="nav-link">Orders</Link>
                <div className="profile-dropdown-container">
                  <button 
                    className="nav-link nav-link-icon profile-trigger"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span className="nav-text">Profile</span>
                  </button>
                  {showProfileDropdown && (
                    <div className="profile-dropdown-menu">
                      <div className="dropdown-user-info">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span className="dropdown-username">
                            {currentUser?.firstName || currentUser?.name || currentUser?.email}
                        </span>
                      </div>
                      <Link to="/orders" className="dropdown-item" onClick={() => setShowProfileDropdown(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                          <path d="M3 6h18"></path>
                          <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                        My Orders
                      </Link>
                      <Link to="/profile" className="dropdown-item" onClick={() => setShowProfileDropdown(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        Profile Settings
                      </Link>
                      <div className="dropdown-divider"></div>
                      <button 
                        className="dropdown-item logout-item"
                        onClick={() => {
                          logout();   // from AuthContext
                          navigate("/login");
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                          <polyline points="16 17 21 12 16 7"></polyline>
                          <line x1="21" x2="9" y1="12" y2="12"></line>
                        </svg>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Not Logged In - Only Login & Signup
              <>
                <Link to="/login" className="nav-link btn-login">Login</Link>
                <Link to="/signup" className="nav-link btn-signup">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
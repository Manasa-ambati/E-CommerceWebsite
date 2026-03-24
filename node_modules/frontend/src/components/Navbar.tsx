import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/authContext";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, logout } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Compute login state directly from context
  const isLoggedIn = !!user;

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showProfileDropdown && !target.closest(".profile-dropdown-container")) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileDropdown]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setShowProfileDropdown(false);
    navigate("/");
  };

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

          {/* SEARCH BAR */}
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="search-actions">
              <button type="button" onClick={handleCameraSearch} title="Search with Camera">
                📷
              </button>
              <button type="button" onClick={handleVoiceSearch} title="Search with Voice">
                🎤
              </button>
              <button type="submit" title="Search">
                🔍
              </button>
            </div>
          </form>

          {/* NAV LINKS */}
          <div className="navbar-nav">
            {isLoggedIn ? (
              <>
                <Link to="/" className="nav-link">Home</Link>
                <Link to="/products" className="nav-link">Products</Link>
                <Link to="/wishlist" className="nav-link">Wishlist</Link>
                <Link to="/cart" className="nav-link">Cart ({cartCount})</Link>
                <Link to="/orders" className="nav-link">Orders</Link>

                <div className="profile-dropdown-container">
                  <button
                    className="profile-dropdown-toggle"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  >
                    {user?.firstName || "User"} ▼
                  </button>
                  {showProfileDropdown && (
                    <div className="profile-dropdown-menu">
                      <button onClick={handleLogout}>Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn-login">Login</Link>
                <Link to="/signup" className="btn-signup">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
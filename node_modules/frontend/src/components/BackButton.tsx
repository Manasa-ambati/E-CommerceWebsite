import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './BackButton.css';

interface BackButtonProps {
  fallbackPath?: string; // Optional fallback path if no history
}

const BackButton: React.FC<BackButtonProps> = ({ fallbackPath = '/' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // Fallback to specified path
      navigate(fallbackPath);
    }
  };

  // Don't show on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <button className="back-button" onClick={handleBack} aria-label="Go back">
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', minWidth: '18px' }}
      >
        <path 
          d="M19 12H5M5 12L12 19M5 12L12 5" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className="back-text">Back</span>
    </button>
  );
};

export default BackButton;

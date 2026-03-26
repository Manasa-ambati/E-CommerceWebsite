import React, { useState, useEffect } from 'react';
import './Profile.css';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to load user data
    const loadUserData = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      console.log('Profile - Token exists:', !!token);
      console.log('Profile - User data:', userData);
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log('Profile - User parsed successfully:', parsedUser);
        } catch (error) {
          console.error('Error parsing user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } else if (!token) {
        console.log('Profile - No token found, user not logged in');
      }
      setLoading(false);
    };

    // Initial load
    loadUserData();

    // Listen for storage changes (in case user logs in from another tab/component)
    window.addEventListener('storage', loadUserData);
    return () => window.removeEventListener('storage', loadUserData);
  }, []);

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <h1>Please login to view your profile</h1>
          <p>You need to be logged in to access this page.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#e94560',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>
        
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {user?.name?.[0] || user?.email?.[0]}
            </div>
            <div className="profile-info">
              <h2>{user?.name || user?.email}</h2>
              <span className="profile-role">{user?.role}</span>
            </div>
          </div>
          
          <div className="profile-details">
            <div className="detail-row">
              <span className="label">Email</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="detail-row">
              <span className="label">Account Status</span>
              <span className={`value status-${user?.emailVerified ? 'verified' : 'pending'}`}>
                {user?.emailVerified ? 'Verified ✅' : 'Pending Verification ⏳'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

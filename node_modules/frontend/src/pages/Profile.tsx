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
      
      console.log('=== PROFILE DEBUG INFO ===');
      console.log('Token exists:', !!token);
      console.log('Raw user data from localStorage:', userData);
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('Parsed user object:', parsedUser);
          console.log('User fields breakdown:');
          console.log('  - id:', parsedUser.id);
          console.log('  - email:', parsedUser.email);
          console.log('  - firstName:', parsedUser.firstName, `(type: ${typeof parsedUser.firstName})`);
          console.log('  - lastName:', parsedUser.lastName, `(type: ${typeof parsedUser.lastName})`);
          console.log('  - name:', parsedUser.name);
          console.log('  - role:', parsedUser.role);
          console.log('  - emailVerified:', parsedUser.emailVerified);
          
          setUser(parsedUser);
          console.log('✅ User parsed successfully:', parsedUser);
        } catch (error) {
          console.error('❌ Error parsing user data:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      } else if (!token) {
        console.log('⚠️ No token found, user not logged in');
      }
      console.log('========================');
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
              {user?.firstName?.[0] || user?.name?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div className="profile-info">
              <h2>
                {user?.firstName 
                  ? `${user.firstName} ${user.lastName || ''}`.trim() 
                  : user?.name || user?.email || 'User'}
              </h2>
              <span className="profile-role">{user?.role}</span>
            </div>
          </div>
          
          <div className="profile-details">
            <div className="detail-row">
              <span className="label">Full Name</span>
              <span className="value">
                {user?.firstName 
                  ? `${user.firstName} ${user.lastName || ''}`.trim() 
                  : user?.name || user?.email || 'N/A'}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Email</span>
              <span className="value">{user?.email || 'Not provided'}</span>
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

import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/authContext";

const ProtectedRoute = ({ children }: any) => {
  const authContext = useAuth();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('=== PROTECTED ROUTE CHECK ===');
    console.log('Path:', location.pathname);
    
    // Check multiple sources for authentication
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const contextUser = authContext?.user;
    
    console.log('Token exists:', !!token);
    console.log('Stored user exists:', !!storedUser);
    console.log('Context user exists:', !!contextUser);
    
    // User is authenticated if we have token AND (stored user OR context user)
    const authenticated = !!(token && (storedUser || contextUser));
    
    console.log('Is authenticated?', authenticated);
    
    setIsAuthenticated(authenticated);
    setIsChecking(false);
  }, [authContext?.user, location.pathname]);

  // While checking, show nothing or loading
  if (isChecking) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  // Handle case where AuthProvider might not be set up correctly
  if (!authContext) {
    console.error('ProtectedRoute: AuthContext is null. Make sure AuthProvider wraps the app.');
    return <Navigate to="/" replace />;
  }

  if (!isAuthenticated) {
    console.log('Redirecting to login from:', location.pathname);
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
import React from 'react';
import { Navigate } from 'react-router-dom';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
 // Check if user is admin (you can implement your own logic here)
 const isAdmin = localStorage.getItem('isAdmin') === 'true';

  if (!isAdmin) {
 return <Navigate to="/"replace />;
 }

 return <>{children}</>;
};

export default AdminRoute;

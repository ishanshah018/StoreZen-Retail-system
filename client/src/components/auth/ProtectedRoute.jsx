import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const loggedInUser = localStorage.getItem('loggedInUser');
  
  // If no token or user data, redirect to signup page
  if (!token || !loggedInUser) {
    // Clear any stale data
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('customerName');
    
    return <Navigate to="/signup" replace />;
  }

  // Optional: Add token validation here
  // You could also verify token with backend API
  
  return children;
};

export default ProtectedRoute;

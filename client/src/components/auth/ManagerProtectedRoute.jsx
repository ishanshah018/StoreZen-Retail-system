//=============================================================================
// MANAGER PROTECTED ROUTE COMPONENT
//=============================================================================
// Higher-order component that protects manager-only routes
// Features: Token validation, automatic cleanup, secure redirects
//=============================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ManagerProtectedRoute Component
 * Protects routes that require manager authentication
 * 
 * @param {Object} props - Component properties
 * @param {ReactNode} props.children - Child components to render if authenticated
 * @returns {ReactNode} Protected content or redirect to login
 */
const ManagerProtectedRoute = ({ children }) => {
  // Check manager authentication status
  const managerToken = localStorage.getItem('managerToken');
  const loggedInManager = localStorage.getItem('loggedInManager');
  const managerRole = localStorage.getItem('managerRole');
  
  /**
   * Validate manager authentication
   * Requires: valid token, manager name, and correct role
   */
  const isManagerAuthenticated = (
    managerToken && 
    loggedInManager && 
    managerRole === 'manager'
  );
  
  if (!isManagerAuthenticated) {
    // Clear potentially corrupted or stale authentication data
    localStorage.removeItem('managerToken');
    localStorage.removeItem('loggedInManager');
    localStorage.removeItem('managerId');
    localStorage.removeItem('managerRole');
    
    // Redirect to manager login page
    return <Navigate to="/manager/login" replace />;
  }

  // Render protected content for authenticated managers
  return children;
};

export default ManagerProtectedRoute;

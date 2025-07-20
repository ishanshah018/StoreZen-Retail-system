import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Theme Provider
import { ThemeProvider } from './components/theme';

// Authentication
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page Components
import Main from './pages/main';
import Customer from './pages/customer';
import Manager from './pages/manager';
import Login from './pages/LoginPage';
import Signup from './pages/SignupPage';
import Profile from './pages/Profile';

// =============================================================================
// MAIN APPLICATION COMPONENT
// =============================================================================

/**
 * App - Root component that handles routing and global theme provider
 * Manages both public and protected routes with authentication
 */
function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* =============================================================================
               PUBLIC ROUTES - No authentication required
               ============================================================================= */}
          
          <Route path="/" element={<Main />} />           {/* Landing page */}
          <Route path="/manager" element={<Manager />} /> {/* Manager dashboard */}
          <Route path="/login" element={<Login />} />     {/* User login */}
          <Route path="/signup" element={<Signup />} />   {/* User registration */}
          
          {/* =============================================================================
               PROTECTED ROUTES - Require user authentication
               ============================================================================= */}
          
          {/* Customer shopping interface */}
          <Route 
            path="/customer" 
            element={
              <ProtectedRoute>
                <Customer />
              </ProtectedRoute>
            } 
          />
          
          {/* User profile management */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
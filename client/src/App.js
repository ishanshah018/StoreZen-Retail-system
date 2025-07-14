import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/theme';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Main from './pages/main';
import Customer from './pages/customer';
import Manager from './pages/manager';
import Login from './pages/LoginPage'
import Signup from './pages/SignupPage'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route 
            path="/customer" 
            element={
              <ProtectedRoute>
                <Customer />
              </ProtectedRoute>
            } 
          />
          <Route path="/manager" element={<Manager />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
import React from 'react';
import ReactDOM from 'react-dom/client';

// Styles
import './index.css';                    // Global CSS styles
import 'react-toastify/ReactToastify.css'; // Toast notification styles

// Main App Component
import App from './App';

// Performance monitoring
import reportWebVitals from './reportWebVitals';

// =============================================================================
// APPLICATION ENTRY POINT
// =============================================================================

/**
 * React 18 root rendering setup
 * StrictMode helps identify potential problems in development
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// =============================================================================
// PERFORMANCE MONITORING (Optional)
// =============================================================================

/**
 * Web Vitals measurement for performance analysis
 * Can be configured to send metrics to analytics endpoint
 */
reportWebVitals();

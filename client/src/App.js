import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './pages/main';
import Customer from './pages/customer';
import Manager from './pages/manager';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/customer" element={<Customer />} />
        <Route path="/manager" element={<Manager />} />
      </Routes>
    </Router>
  );
}

export default App;
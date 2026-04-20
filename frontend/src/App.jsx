import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewBooking from './pages/NewBooking';
import MyBookings from './pages/MyBookings';
import FacilitiesCatalogue from './pages/FacilitiesCatalogue';
import ManageFacility from './pages/ManageFacility';
import './index.css';

function App() {
  // Simple auth check using localStorage for demo
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Authenticated Routes */}
        <Route 
          path="/dashboard" 
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/facilities" 
          element={isAuthenticated ? <FacilitiesCatalogue /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/facilities/manage" 
          element={isAuthenticated ? <ManageFacility /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/bookings/new" 
          element={isAuthenticated ? <NewBooking /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/bookings/my" 
          element={isAuthenticated ? <MyBookings /> : <Navigate to="/login" />} 
        />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;

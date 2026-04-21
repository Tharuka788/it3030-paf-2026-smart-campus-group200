import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewBooking from './pages/NewBooking';
import MyBookings from './pages/MyBookings';
import FacilitiesCatalogue from './pages/FacilitiesCatalogue';
import ManageFacility from './pages/ManageFacility';
import MyTickets from './pages/MyTickets';
import HallBooking from './pages/HallBooking';
import './index.css';

// Protected Route component to check auth status on every navigation
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Authenticated Routes */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/facilities" 
          element={<ProtectedRoute><FacilitiesCatalogue /></ProtectedRoute>} 
        />
        <Route 
          path="/facilities/manage" 
          element={<ProtectedRoute><ManageFacility /></ProtectedRoute>} 
        />
        <Route 
          path="/bookings/new" 
          element={<ProtectedRoute><NewBooking /></ProtectedRoute>} 
        />
        <Route 
          path="/bookings/my" 
          element={<ProtectedRoute><MyBookings /></ProtectedRoute>} 
        />
        <Route 
          path="/bookings/hall" 
          element={<ProtectedRoute><HallBooking /></ProtectedRoute>} 
        />
        <Route 
          path="/tickets/my" 
          element={<ProtectedRoute><MyTickets /></ProtectedRoute>} 
        />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

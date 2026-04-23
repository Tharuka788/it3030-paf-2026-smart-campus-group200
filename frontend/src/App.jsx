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
import LabBooking from './pages/LabBooking';
import NewTicket from './pages/NewTicket';
import AdminDashboard from './pages/AdminDashboard';
import AdminFacilities from './pages/AdminFacilities';
import AdminBookings from './pages/AdminBookings';
import AdminTickets from './pages/AdminTickets';
import AdminUsers from './pages/AdminUsers';
// import TechnicianDashboard from './pages/TechnicianDashboard';
import './index.css';

// Protected Route component to check auth status on every navigation
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Admin Protected Route component
const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
  return (isAuthenticated && userRole === 'ROLE_ADMIN') ? children : <Navigate to="/dashboard" replace />;
};

// Technician Protected Route component
const TechnicianProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
  return (isAuthenticated && userRole === 'ROLE_TECHNICIAN') ? children : <Navigate to="/dashboard" replace />;
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
        {/* <Route 
          path="/technician/dashboard" 
          element={<TechnicianProtectedRoute><TechnicianDashboard /></TechnicianProtectedRoute>} 
        /> */}
        <Route 
          path="/admin/dashboard" 
          element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} 
        />
        <Route 
          path="/admin/facilities" 
          element={<AdminProtectedRoute><AdminFacilities /></AdminProtectedRoute>} 
        />
        <Route 
          path="/admin/bookings" 
          element={<AdminProtectedRoute><AdminBookings /></AdminProtectedRoute>} 
        />
        <Route 
          path="/admin/tickets" 
          element={<AdminProtectedRoute><AdminTickets /></AdminProtectedRoute>} 
        />
        <Route 
          path="/admin/users" 
          element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} 
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
          path="/bookings/lab" 
          element={<ProtectedRoute><LabBooking /></ProtectedRoute>} 
        />
        <Route 
          path="/tickets/my" 
          element={<ProtectedRoute><MyTickets /></ProtectedRoute>} 
        />
        <Route 
          path="/tickets/new" 
          element={<ProtectedRoute><NewTicket /></ProtectedRoute>} 
        />

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

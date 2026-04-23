import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
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
import TechnicianDashboard from './pages/TechnicianDashboard';
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
  return (isAuthenticated && userRole === 'ROLE_ADMIN') ? children : <RoleBasedRedirect />;
};

// Technician Protected Route component
const TechnicianProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
  return (isAuthenticated && userRole === 'ROLE_TECHNICIAN') ? children : <RoleBasedRedirect />;
};

// Staff Protected Route component (Admin or Technician)
const StaffProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
  const isStaff = userRole === 'ROLE_ADMIN' || userRole === 'ROLE_TECHNICIAN';
  return (isAuthenticated && isStaff) ? children : <RoleBasedRedirect />;
};

// Helper for root/fallback redirection
const RoleBasedRedirect = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (userRole === 'ROLE_ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (userRole === 'ROLE_TECHNICIAN') return <Navigate to="/technician/dashboard" replace />;
  return <Navigate to="/dashboard" replace />;
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
          element={<StaffProtectedRoute><AdminTickets /></StaffProtectedRoute>} 
        />
        <Route 
          path="/admin/users" 
          element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} 
        />
        <Route 
          path="/technician/dashboard" 
          element={<TechnicianProtectedRoute><TechnicianDashboard /></TechnicianProtectedRoute>} 
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
        <Route path="/" element={<RoleBasedRedirect />} />
        <Route path="*" element={<RoleBasedRedirect />} />
      </Routes>
    </Router>
  );
}

export default App;

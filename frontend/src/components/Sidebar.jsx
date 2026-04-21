import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar,
  Box, 
  User, 
  Settings, 
  LogOut,
  GraduationCap,
  Ticket
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const userRole = localStorage.getItem('userRole');
  
  const navItems = [
    { name: 'Overview', icon: <Home size={22} />, path: '/dashboard' },
    { name: 'Facilities', icon: <Box size={22} />, path: '/facilities' },
    ...(userRole === 'ROLE_ADMIN' ? [
      { name: 'Manage Facilities', icon: <Settings size={22} />, path: '/facilities/manage' }
    ] : []),
    { name: 'My Bookings', icon: <Calendar size={22} />, path: '/bookings/my' },
    { name: 'My Tickets', icon: <Ticket size={22} />, path: '/tickets/my' },
    { name: 'Profile', icon: <User size={22} />, path: '/profile' },
    { name: 'Settings', icon: <Settings size={22} />, path: '/settings' },
  ];

  return (
    <motion.aside 
      className="sidebar glass-morphism"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="sidebar-header">
        <GraduationCap size={32} className="logo-icon" />
        <span className="logo-text gradient-text">Smart Campus</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="icon-wrapper">{item.icon}</div>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="logout-btn"
          onClick={() => {
            localStorage.removeItem('isAuthenticated');
            window.location.href = '/login';
          }}
        >
          <LogOut size={22} />
          <span>Logout</span>
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: 280px;
          height: calc(100vh - 40px);
          position: fixed;
          top: 20px;
          left: 20px;
          display: flex;
          flex-direction: column;
          padding: 30px 20px;
          z-index: 100;
          box-shadow: var(--box-shadow);
          border: 1px solid var(--glass-border);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 40px;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 30px;
        }

        .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 20px;
          border-radius: 12px;
          color: #334155;
          font-weight: 500;
          transition: all 0.3s;
        }

        .nav-item .icon-wrapper {
          color: #0ea5e9;
          display: flex;
          align-items: center;
        }

        .nav-item:hover {
          background: rgba(0, 0, 0, 0.03);
          color: var(--text-main);
        }

        .nav-item.active {
          background: #f3e8ff;
          color: #7c3aed;
          box-shadow: none;
        }

        .nav-item.active .icon-wrapper {
          color: #7c3aed;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid var(--glass-border);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 12px 20px;
          color: #ef4444;
          font-weight: 500;
          border-radius: 12px;
          transition: all 0.3s;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </motion.aside>
  );
};

export default Sidebar;

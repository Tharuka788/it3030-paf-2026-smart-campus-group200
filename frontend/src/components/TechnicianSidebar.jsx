import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Wrench,
  Ticket,
  Building2,
  Bell,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const TechnicianSidebar = () => {
  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={22} />, path: '/technician/dashboard' },
    { name: 'Assigned Tickets', icon: <Ticket size={22} />, path: '/technician/tickets' }, // Reusing existing ticket management
    { name: 'Facility Status', icon: <Building2 size={22} />, path: '/facilities' },
    { name: 'Service Logs', icon: <CheckCircle2 size={22} />, path: '/technician/logs' },
  ];

  return (
    <motion.aside
      className="technician-sidebar"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="sidebar-header">
        <div className="logo-wrapper">
          <Wrench size={32} />
        </div>
        <div className="title-info">
          <span className="logo-text">Tech Portal</span>
          <span className="status">Maintenance Mode</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <span className="nav-label">Operations</span>
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
        <div className="alert-preview">
          <AlertCircle size={20} />
          <span>2 Critical Tasks</span>
        </div>
      </div>

      <style jsx="true">{`
        .technician-sidebar {
          width: 280px;
          height: calc(100vh - 40px);
          position: fixed;
          top: 20px;
          left: 20px;
          display: flex;
          flex-direction: column;
          padding: 35px 25px;
          z-index: 100;
          background: #1e293b;
          border-radius: 24px;
          color: white;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 15px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 30px;
        }

        .logo-wrapper {
          background: #10b981;
          padding: 8px;
          border-radius: 12px;
          color: white;
        }

        .title-info {
          display: flex;
          flex-direction: column;
        }

        .logo-text {
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .status {
          font-size: 0.7rem;
          color: #10b981;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-label {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin: 15px 0 10px 10px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px 20px;
          border-radius: 14px;
          color: #94a3b8;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-item .icon-wrapper {
          display: flex;
          align-items: center;
          transition: transform 0.3s;
        }

        .nav-item:hover {
          color: white;
          background: rgba(255,255,255,0.05);
        }

        .nav-item:hover .icon-wrapper {
          transform: translateX(3px);
        }

        .nav-item.active {
          background: #10b981;
          color: white;
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
        }

        .sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .alert-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }
      `}</style>
    </motion.aside>
  );
};

export default TechnicianSidebar;

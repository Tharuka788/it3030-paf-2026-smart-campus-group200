import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  CalendarClock, 
  Ticket, 
  Users, 
  LogOut,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSidebar = () => {
  const navItems = [
    { name: 'Overview', icon: <LayoutDashboard size={22} />, path: '/admin/dashboard' },
    { name: 'Facilities View', icon: <Building2 size={22} />, path: '/facilities' },
    { name: 'Facility Management', icon: <Settings size={22} />, path: '/admin/facilities' },
    { name: 'Booking Management', icon: <CalendarClock size={22} />, path: '/admin/bookings' },
    { name: 'Tickets Management', icon: <Ticket size={22} />, path: '/admin/tickets' },
    { name: 'User Managements', icon: <Users size={22} />, path: '/admin/users' },
  ];

  return (
    <motion.aside 
      className="admin-sidebar"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="admin-sidebar-header">
        <div className="admin-logo-wrapper">
          <ShieldCheck size={32} />
        </div>
        <div className="admin-title-info">
          <span className="admin-logo-text">Admin Portal</span>
          <span className="admin-status">Superuser Access</span>
        </div>
      </div>

      <nav className="admin-sidebar-nav">
        <span className="nav-label">Management</span>
        {navItems.map((item) => (
          <NavLink 
            key={item.name} 
            to={item.path} 
            className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          >
            <div className="icon-wrapper">{item.icon}</div>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="notifications-preview">
           <Bell size={20} />
           <span>3 New Alerts</span>
        </div>
      </div>

      <style jsx="true">{`
        .admin-sidebar {
          width: 280px;
          height: calc(100vh - 40px);
          position: fixed;
          top: 20px;
          left: 20px;
          display: flex;
          flex-direction: column;
          padding: 35px 25px;
          z-index: 100;
          background: #0f172a;
          border-radius: 24px;
          color: white;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .admin-sidebar-header {
          display: flex;
          align-items: center;
          gap: 15px;
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 30px;
        }

        .admin-logo-wrapper {
          background: #6366f1;
          padding: 8px;
          border-radius: 12px;
          color: white;
        }

        .admin-title-info {
          display: flex;
          flex-direction: column;
        }

        .admin-logo-text {
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: -0.5px;
        }

        .admin-status {
          font-size: 0.7rem;
          color: #10b981;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .admin-sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-label {
          font-size: 0.75rem;
          color: #475569;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin: 15px 0 10px 10px;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px 20px;
          border-radius: 14px;
          color: #94a3b8;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-nav-item .icon-wrapper {
          display: flex;
          align-items: center;
          transition: transform 0.3s;
        }

        .admin-nav-item:hover {
          color: white;
          background: rgba(255,255,255,0.05);
        }

        .admin-nav-item:hover .icon-wrapper {
          transform: translateX(3px);
        }

        .admin-nav-item.active {
          background: #6366f1;
          color: white;
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
        }

        .admin-sidebar-footer {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .notifications-preview {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 600;
        }


      `}</style>
    </motion.aside>
  );
};

export default AdminSidebar;

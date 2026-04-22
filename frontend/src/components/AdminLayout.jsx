import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Settings, Command, LogOut, User, ChevronDown } from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhoto');
    window.location.href = '/login';
  };

  return (
    <div className="admin-layout-container">
      <AdminSidebar />
      <main className="admin-main-content">
        <header className="admin-header glass-morphism">
          <div className="header-search">
            <Command size={18} className="search-icon" />
            <input type="text" placeholder="Search system records... (Ctrl + K)" />
          </div>
          
          <div className="header-actions">
            <button className="action-circle-btn">
              <Search size={20} />
            </button>
            <button className="action-circle-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            <button className="action-circle-btn">
              <Settings size={20} />
            </button>
            
            <div className="admin-profile-wrapper">
              <div 
                className={`admin-profile-section ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="admin-text">
                  <span className="admin-name">{localStorage.getItem('userName')}</span>
                  <span className="admin-role">System Admin</span>
                </div>
                <img src={localStorage.getItem('userPhoto') || `https://ui-avatars.com/api/?name=${localStorage.getItem('userName') || 'Admin'}&background=6366f1&color=fff`} alt="Admin" className="admin-avatar" />
                <ChevronDown size={16} className={`admin-chevron ${isDropdownOpen ? 'rotate' : ''}`} />
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    className="admin-dropdown glass-morphism"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="admin-dropdown-header">
                      <p className="admin-dropdown-name">{localStorage.getItem('userName')}</p>
                      <p className="admin-dropdown-role">Root Administrator</p>
                    </div>
                    <div className="admin-dropdown-divider"></div>
                    <button className="admin-dropdown-item" onClick={() => window.location.href = '/profile'}>
                      <User size={18} />
                      <span>Admin Profile</span>
                    </button>
                    <button className="admin-dropdown-item" onClick={() => window.location.href = '/admin/settings'}>
                      <Settings size={18} />
                      <span>System Settings</span>
                    </button>
                    <div className="admin-dropdown-divider"></div>
                    <button className="admin-dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <section className="admin-content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="admin-page-wrapper"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <style jsx="true">{`
        .admin-layout-container {
          min-height: 100vh;
          display: flex;
          background: #f1f5f9;
          padding: 20px;
          gap: 20px;
        }

        .admin-main-content {
          flex: 1;
          margin-left: 280px; 
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .admin-header {
          padding: 15px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 20px;
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(255,255,255,0.8);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-search {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #f8fafc;
          padding: 10px 20px;
          border-radius: 12px;
          width: 350px;
          border: 1px solid #e2e8f0;
        }

        .search-icon {
          color: #94a3b8;
        }

        .header-search input {
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          font-size: 0.9rem;
          color: #1e293b;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .action-circle-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          color: #64748b;
          border: 1px solid #e2e8f0;
          position: relative;
          transition: all 0.2s;
        }

        .action-circle-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
          transform: translateY(-2px);
        }

        .notification-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
        }

        .admin-profile-wrapper {
          position: relative;
          z-index: 1001;
        }

        .admin-profile-section {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 8px 15px;
          border-left: 1px solid #e2e8f0;
          margin-left: 5px;
          cursor: pointer;
          transition: all 0.3s;
          border-radius: 12px;
        }

        .admin-profile-section:hover, .admin-profile-section.active {
          background: #f8fafc;
        }

        .admin-text {
          display: flex;
          flex-direction: column;
          text-align: right;
        }

        .admin-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1e293b;
        }

        .admin-role {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .admin-avatar {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          object-fit: cover;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .admin-chevron {
          color: #94a3b8;
          transition: transform 0.3s;
        }

        .admin-chevron.rotate {
          transform: rotate(180deg);
        }

        .admin-dropdown {
          position: absolute;
          top: calc(100% + 15px);
          right: 0;
          width: 260px;
          background: white;
          border-radius: 16px;
          padding: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid #e2e8f0;
          z-index: 10000;
        }

        .admin-dropdown-header {
          padding: 8px 12px 12px;
        }

        .admin-dropdown-name {
          font-weight: 700;
          color: #0f172a;
          font-size: 1rem;
        }

        .admin-dropdown-role {
          font-size: 0.75rem;
          color: #6366f1;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .admin-dropdown-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 10px 0;
        }

        .admin-dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          color: #475569;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .admin-dropdown-item:hover {
          background: #f8fafc;
          color: #6366f1;
          transform: translateX(4px);
        }

        .admin-dropdown-item.logout {
          color: #ef4444;
          margin-top: 5px;
        }

        .admin-dropdown-item.logout:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .admin-content-area {
          flex: 1;
        }

        .admin-page-wrapper {
          min-height: calc(100vh - 150px);
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;

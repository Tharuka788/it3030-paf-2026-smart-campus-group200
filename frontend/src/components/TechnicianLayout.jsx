import React, { useState } from 'react';
import TechnicianSidebar from './TechnicianSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Settings, Command, LogOut, User, ChevronDown, Wrench, RefreshCw } from 'lucide-react';

const TechnicianLayout = ({ children }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhoto');
    window.location.href = '/login';
  };

  return (
    <div className="tech-layout-container">
      <TechnicianSidebar />
      <main className="tech-main-content">
        <header className="tech-header glass-morphism">
          <div className="header-search">
            <Wrench size={18} className="search-icon" />
            <input type="text" placeholder="Search maintenance logs..." />
          </div>
          
          <div className="header-actions">
            <button className="action-circle-btn" onClick={() => window.location.reload()} title="Refresh">
              <RefreshCw size={20} />
            </button>
            <button className="action-circle-btn">
              <Search size={20} />
            </button>
            <button className="action-circle-btn">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </button>
            
            <div className="profile-wrapper">
              <div 
                className={`profile-section ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="profile-text">
                  <span className="profile-name">{localStorage.getItem('userName')}</span>
                  <span className="profile-role">Technician</span>
                </div>
                <img src={localStorage.getItem('userPhoto') || `https://ui-avatars.com/api/?name=${localStorage.getItem('userName') || 'Tech'}&background=10b981&color=fff`} alt="Tech" className="profile-avatar" />
                <ChevronDown size={16} className={`chevron ${isDropdownOpen ? 'rotate' : ''}`} />
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div 
                    className="profile-dropdown glass-morphism"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="dropdown-header">
                      <p className="dropdown-name">{localStorage.getItem('userName')}</p>
                      <p className="dropdown-role">Campus Technician</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={() => window.location.href = '/profile'}>
                      <User size={18} />
                      <span>My Profile</span>
                    </button>
                    <button className="dropdown-item" onClick={() => window.location.href = '/technician/settings'}>
                      <Settings size={18} />
                      <span>Tech Settings</span>
                    </button>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={18} />
                      <span>Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <section className="tech-content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="tech-page-wrapper"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <style jsx="true">{`
        .tech-layout-container {
          min-height: 100vh;
          display: flex;
          background: #f8fafc;
          padding: 20px;
          gap: 20px;
        }

        .tech-main-content {
          flex: 1;
          margin-left: 280px; 
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .tech-header {
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
          background: #f1f5f9;
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
          background: #f1f5f9;
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
          background: #10b981;
          border-radius: 50%;
          border: 2px solid white;
        }

        .profile-wrapper {
          position: relative;
          z-index: 1001;
        }

        .profile-section {
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

        .profile-section:hover, .profile-section.active {
          background: #f1f5f9;
        }

        .profile-text {
          display: flex;
          flex-direction: column;
          text-align: right;
        }

        .profile-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1e293b;
        }

        .profile-role {
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 600;
        }

        .profile-avatar {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          object-fit: cover;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .chevron {
          color: #94a3b8;
          transition: transform 0.3s;
        }

        .chevron.rotate {
          transform: rotate(180deg);
        }

        .profile-dropdown {
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

        .dropdown-header {
          padding: 8px 12px 12px;
        }

        .dropdown-name {
          font-weight: 700;
          color: #0f172a;
          font-size: 1rem;
        }

        .dropdown-role {
          font-size: 0.75rem;
          color: #10b981;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dropdown-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 10px 0;
        }

        .dropdown-item {
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

        .dropdown-item:hover {
          background: #f1f5f9;
          color: #10b981;
          transform: translateX(4px);
        }

        .dropdown-item.logout {
          color: #ef4444;
          margin-top: 5px;
        }

        .dropdown-item.logout:hover {
          background: #fef2f2;
          color: #ef4444;
        }

        .tech-content-area {
          flex: 1;
        }

        .tech-page-wrapper {
          min-height: calc(100vh - 150px);
        }
      `}</style>
    </div>
  );
};

export default TechnicianLayout;

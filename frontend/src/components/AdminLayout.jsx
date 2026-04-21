import React from 'react';
import AdminSidebar from './AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Settings, Command } from 'lucide-react';

const AdminLayout = ({ children }) => {
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
            <div className="admin-profile-section">
              <div className="admin-text">
                <span className="admin-name">{localStorage.getItem('userName')}</span>
                <span className="admin-role">System Admin</span>
              </div>
              <img src={localStorage.getItem('userPhoto')} alt="Admin" className="admin-avatar" />
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

        .admin-profile-section {
          display: flex;
          align-items: center;
          gap: 15px;
          padding-left: 15px;
          border-left: 1px solid #e2e8f0;
          margin-left: 5px;
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

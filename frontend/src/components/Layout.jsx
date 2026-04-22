import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';

const Layout = ({ children }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhoto');
    window.location.href = '/login';
  };

  return (
    <div className="layout-container">
      <Sidebar />
      <main className="main-content">
        <header className="main-header glass-morphism animate-fade-in">
           <div className="header-left">
             <h2 className="header-title">Welcome back, <span className="username-accent">{localStorage.getItem('userName') || 'Student'} 👋</span></h2>
             <p className="header-date">{new Date().toDateString()}</p>
           </div>
           <div className="header-right">
             <div className="profile-dropdown-container">
               <div 
                 className={`profile-pill glass-morphism ${isDropdownOpen ? 'active' : ''}`}
                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
               >
                 <img src={localStorage.getItem('userPhoto') || `https://ui-avatars.com/api/?name=${localStorage.getItem('userName') || 'Student'}&background=6366f1&color=fff`} alt="Profile" />
                 <span>{localStorage.getItem('userName') || 'Student'}</span>
                 <ChevronDown size={18} className={`chevron-icon ${isDropdownOpen ? 'rotate' : ''}`} />
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
                       <p className="user-name">{localStorage.getItem('userName') || 'Student'}</p>
                       <p className="user-role">{localStorage.getItem('userRole') === 'ROLE_ADMIN' ? 'Administrator' : 'Student'}</p>
                     </div>
                     <div className="dropdown-divider"></div>
                     <button className="dropdown-item" onClick={() => window.location.href = '/profile'}>
                       <User size={18} />
                       <span>My Profile</span>
                     </button>
                     <button className="dropdown-item" onClick={() => window.location.href = '/settings'}>
                       <Settings size={18} />
                       <span>Settings</span>
                     </button>
                     <div className="dropdown-divider"></div>
                     <button className="dropdown-item logout" onClick={handleLogout}>
                       <LogOut size={18} />
                       <span>Logout</span>
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
           </div>
        </header>

        <section className="content-area">
          <AnimatePresence mode="wait">
             <motion.div
               key={window.location.pathname}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
               className="page-wrapper"
             >
               {children}
             </motion.div>
          </AnimatePresence>
        </section>
      </main>

      <style jsx="true">{`
        .layout-container {
          min-height: 100vh;
          display: flex;
          background: var(--bg-dark);
          padding: 20px;
          gap: 20px;
        }

        .main-content {
          flex: 1;
          margin-left: 280px; 
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .main-header {
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-radius: 20px;
          background: white;
          box-shadow: var(--box-shadow);
          border: 1px solid var(--glass-border);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .header-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #334155;
        }

        .username-accent {
          color: #0ea5e9;
        }

        .header-date {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-top: 5px;
        }

        .profile-dropdown-container {
          position: relative;
          z-index: 1001;
        }

        .profile-pill {
          padding: 6px 12px 6px 6px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid transparent;
        }

        .profile-pill img {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 2px solid var(--primary);
          object-fit: cover;
          background: #f1f5f9;
        }

        .profile-pill:hover, .profile-pill.active {
          background: rgba(255, 255, 255, 0.5);
          border-color: var(--glass-border);
          transform: translateY(-2px);
        }

        .chevron-icon {
          color: #64748b;
          transition: transform 0.3s;
        }

        .chevron-icon.rotate {
          transform: rotate(180deg);
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 15px);
          right: 0;
          width: 240px;
          background: white;
          border-radius: 16px;
          padding: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid var(--glass-border);
          z-index: 10000;
        }

        .dropdown-header {
          padding: 10px 15px;
        }

        .user-name {
          font-weight: 700;
          color: #1e293b;
          font-size: 0.95rem;
          margin-bottom: 2px;
        }

        .user-role {
          font-size: 0.75rem;
          color: #64748b;
          font-weight: 500;
        }

        .dropdown-divider {
          height: 1px;
          background: #f1f5f9;
          margin: 8px 0;
        }

        .dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 15px;
          border-radius: 10px;
          color: #475569;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .dropdown-item:hover {
          background: #f8fafc;
          color: var(--primary);
        }

        .dropdown-item.logout {
          color: #ef4444;
        }

        .dropdown-item.logout:hover {
          background: rgba(239, 68, 68, 0.05);
          color: #ef4444;
        }

        .content-area {
          flex: 1;
        }

        .page-wrapper {
          min-height: calc(100vh - 160px);
        }
      `}</style>
    </div>
  );
};

export default Layout;

import React from "react";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";

const Layout = ({ children, user, onLogout }) => {
  const displayName = user?.displayName || "Student";
  const avatarUrl =
    user?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`;

  return (
    <div className="layout-container">
      <Sidebar onLogout={onLogout} />
      <main className="main-content">
        <header className="main-header glass-morphism animate-fade-in">
          <div className="header-left">
            <h2 className="header-title">
              Welcome back,{" "}
              <span className="gradient-text">{displayName} 👋</span>
            </h2>
            <p className="header-date">{new Date().toDateString()}</p>
          </div>
          <div className="header-right">
            <div className="profile-pill glass-morphism">
              <img src={avatarUrl} alt="Profile" />
              <span>{displayName}</span>
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

      <style>{`
        .layout-container {
          min-height: 100vh;
          display: flex;
          background: #0f172a;
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
          border-radius: 16px;
        }

        .header-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-main);
        }

        .header-date {
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-top: 5px;
        }

        .profile-pill {
          padding: 6px 15px 6px 6px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: transform 0.3s;
        }

        .profile-pill img {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 2px solid var(--primary);
        }

        .profile-pill:hover {
          transform: translateY(-2px);
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

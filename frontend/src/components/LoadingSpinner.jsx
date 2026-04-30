import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ fullPage = false }) => {
  const containerStyle = fullPage ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    zIndex: 9999
  } : {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    width: '100%'
  };

  return (
    <div style={containerStyle}>
      <div className="spinner-wrapper">
        <motion.div
          className="spinner-outer"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
        <motion.div
          className="spinner-inner"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        />
        <div className="spinner-text">Loading</div>
      </div>

      <style jsx="true">{`
        .spinner-wrapper {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .spinner-outer {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-top-color: #6366f1;
          border-bottom-color: #0ea5e9;
          border-radius: 50%;
        }

        .spinner-inner {
          position: absolute;
          width: 85%;
          height: 85%;
          border: 2px solid transparent;
          border-left-color: #10b981;
          border-right-color: #f59e0b;
          border-radius: 50%;
        }

        .spinner-text {
          font-weight: 700;
          font-size: 0.85rem;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 2px;
          z-index: 10;
          background: white;
          padding: 0 5px;
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;

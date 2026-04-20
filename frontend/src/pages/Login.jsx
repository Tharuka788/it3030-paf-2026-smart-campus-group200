import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, LogIn } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleGoogleLogin = async () => {
     try {
       const result = await signInWithPopup(auth, googleProvider);
       const user = result.user;
       // Extract name from email
       const extractedName = user.email ? user.email.split('@')[0] : 'Student';

       // Store user info in localStorage
       localStorage.setItem('isAuthenticated', 'true');
       localStorage.setItem('userEmail', user.email);
       localStorage.setItem('userName', extractedName);
       localStorage.setItem('userPhoto', user.photoURL);
       
       // Navigate to dashboard without full reload
       navigate('/dashboard');
     } catch (err) {
       console.error("Google sign in error", err);
       setError("Failed to sign in with Google. Please try again.");
     }
  };

  return (
    <div className="login-container">
      <div className="login-overlay"></div>
      <motion.div 
        className="login-card glass-morphism animate-fade-in"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="logo-section">
          <GraduationCap size={64} className="logo-icon" />
          <h1 className="gradient-text">Smart Campus</h1>
          <p className="subtitle">Seamless Access to Campus Resources</p>
        </div>

        <div className="auth-section">
          {error && <p className="error-msg">{error}</p>}
          <p className="auth-msg">Sign in to manage your bookings and access smart services.</p>
          <button 
            className="google-btn" 
            onClick={handleGoogleLogin}
          >
            <LogIn size={20} />
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="footer-links">
          <span>Forgot password?</span>
          <span>Contact Support</span>
        </div>
      </motion.div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
	  display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
          position: relative;
          overflow: hidden;
          padding: 20px;
        }

        .login-overlay {
          position: absolute;
          width: 100%;
          height: 100%;
          background: url('https://www.transparenttextures.com/patterns/carbon-fibre.png');
          opacity: 0.05;
          pointer-events: none;
        }

        .login-card {
          max-width: 450px;
          width: 100%;
          padding: 60px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
z-index: 10;
        }

        .logo-section h1 {
          font-size: 3rem;
          font-weight: 700;
          margin: 15px 0 5px;
        }

        .logo-icon {
          color: var(--primary);
          filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.4));
        }

        .subtitle {
          color: var(--text-muted);
          font-size: 1.1rem;
          font-weight: 300;
        }

        .auth-msg {
          color: var(--text-muted);
          margin-bottom: 25px;
          font-size: 0.95rem;
        }

        .error-msg {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          padding: 10px;
          border-radius: 8px;
          margin-bottom: 15px;
          font-size: 0.9rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .google-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
          color: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-weight: 500;
          font-size: 1.125rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .google-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
        }

        .footer-links {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .footer-links span {
          cursor: pointer;
          transition: color 0.3s;
        }

        .footer-links span:hover {
          color: var(--primary);
        }
      `}</style>
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { userService } from '../services/api';
import { Mail, Lock, ArrowRight, LogIn } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const successMsg = location.state?.message;

  const handleManualLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { data: dbUser } = await userService.login({
        ...formData,
        email: formData.email.toLowerCase()
      });
      storeUser(dbUser);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const storeUser = (dbUser) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userEmail', dbUser.email);
    localStorage.setItem('userName', dbUser.fullName);
    localStorage.setItem('userPhoto', dbUser.pictureUrl || `https://ui-avatars.com/api/?name=${dbUser.fullName}&background=6366f1&color=fff`);
    localStorage.setItem('userRole', dbUser.role);
    
    if (dbUser.role === 'ROLE_ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
     try {
       const result = await signInWithPopup(auth, googleProvider);
       const user = result.user;
       
       const { data: dbUser } = await userService.syncUser({
         email: user.email.toLowerCase(),
         fullName: user.displayName || user.email.split('@')[0],
         pictureUrl: user.photoURL
       });

       storeUser(dbUser);
     } catch (err) {
       console.error("Google sign in error", err);
       const errorMsg = err.response?.data?.message || err.message || "Failed to sign in with Google. Please try again.";
       setError(errorMsg);
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
          <GraduationCap size={54} className="logo-icon" />
          <h1 className="gradient-text" style={{ fontSize: '2.5rem' }}>Smart Campus</h1>
          <p className="subtitle">Seamless Access to Resources</p>
        </div>

        <div className="auth-section">
          {successMsg && <p style={{color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '15px'}}>{successMsg}</p>}
          {error && <p className="error-msg">{error}</p>}
          
          <form onSubmit={handleManualLogin} className="login-form">
            <div className="input-group">
              <label><Mail size={16} /> Email</label>
              <input 
                type="email" 
                placeholder="name@campus.edu" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="input-group">
              <label><Lock size={16} /> Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                required 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            <button type="submit" className="manual-login-btn" disabled={loading}>
              {loading ? 'Signing in...' : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="divider">
            <span>OR</span>
          </div>

          <button 
            className="google-btn" 
            onClick={handleGoogleLogin}
            type="button"
          >
            <LogIn size={20} />
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="footer-links">
          <p>New here? <Link to="/register" style={{color: 'var(--primary)', fontWeight: 600}}>Create Account</Link></p>
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

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: left;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .input-group input {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 15px;
          color: #1e293b;
          transition: all 0.3s;
          font-family: inherit;
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--primary);
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .manual-login-btn {
          margin-top: 10px;
          padding: 14px;
          background: white;
          color: #0f172a;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .manual-login-btn:hover {
          background: #f1f5f9;
          transform: translateY(-2px);
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 10px 0;
          color: var(--text-muted);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .divider::before, .divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--glass-border);
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
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          font-weight: 500;
          font-size: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .google-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--primary);
        }

        .footer-links {
          margin-top: 10px;
          font-size: 0.95rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default Login;

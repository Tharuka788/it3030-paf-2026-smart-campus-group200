import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';
import { userService } from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await userService.register({
        ...formData,
        email: formData.email.toLowerCase()
      });
      // After registration, redirect to login
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <motion.div 
        className="login-card glass-morphism"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="login-header">
          <GraduationCap size={48} className="logo-icon" />
          <h1 className="gradient-text">Create Account</h1>
          <p>Join the Smart Campus community</p>
        </div>

        {error && (
          <div className="error-box animate-shake">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label><User size={18} /> Full Name</label>
            <input 
              type="text" 
              placeholder="Enter your name" 
              required 
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label><Mail size={18} /> Email Address</label>
            <input 
              type="email" 
              placeholder="name@campus.edu" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label><Lock size={18} /> Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Creating Account...' : (
              <>
                <span>Register</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </motion.div>

      <style jsx="true">{`
        .login-page {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-dark);
          background-image: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.15) 0%, transparent 40%),
                            radial-gradient(circle at 90% 80%, rgba(14, 165, 233, 0.15) 0%, transparent 40%);
        }

        .login-card {
          width: 100%;
          max-width: 440px;
          padding: 50px;
          border-radius: 30px;
          text-align: center;
        }

        .login-header {
          margin-bottom: 40px;
        }

        .logo-icon {
          color: var(--primary);
          margin-bottom: 20px;
        }

        .login-header h1 {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .login-header p {
          color: var(--text-muted);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          text-align: left;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.95rem;
        }

        .input-group input {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 15px;
          color: #1e293b;
          font-family: inherit;
          transition: all 0.3s;
        }

        .input-group input:focus {
          outline: none;
          border-color: var(--primary);
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .login-btn {
          margin-top: 10px;
          padding: 16px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
          color: white;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
        }
        
        .login-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .error-box {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
        }

        .login-footer {
          margin-top: 30px;
          color: var(--text-muted);
        }

        .login-footer a {
          color: var(--primary);
          font-weight: 600;
          text-decoration: none;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Register;

import React, { useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, FileText, Send } from 'lucide-react';
import { bookingService } from '../services/api';

const NewBooking = () => {
  const [formData, setFormData] = useState({
    resourceId: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
    userEmail: 'student@campus.edu', // Mock for now
    userName: 'Campus Student',     // Mock for now
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await bookingService.createBooking(formData);
      setSuccess(true);
      setFormData({
        resourceId: '',
        startTime: '',
        endTime: '',
        purpose: '',
        expectedAttendees: '',
        userEmail: 'student@campus.edu',
        userName: 'Campus Student',
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="new-booking-container">
        <motion.div 
          className="form-card glass-morphism animate-fade-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="form-header">
            <h2 className="gradient-text">New Resource Booking</h2>
            <p>Request access to campus facilities and equipment.</p>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="input-row">
              <div className="input-group">
                <label><MapPin size={18} /> Resource ID</label>
                <input 
                  type="text" 
                  name="resourceId" 
                  value={formData.resourceId}
                  onChange={handleChange}
                  placeholder="e.g. LAB-101" 
                  required 
                />
              </div>
              <div className="input-group">
                <label><Calendar size={18} /> Expected Attendees</label>
                <input 
                  type="number" 
                  name="expectedAttendees" 
                  value={formData.expectedAttendees}
                  onChange={handleChange}
                  placeholder="e.g. 50" 
                  required 
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label><Calendar size={18} /> Start Date & Time</label>
                <input 
                  type="datetime-local" 
                  name="startTime" 
                  value={formData.startTime}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="input-group">
                <label><Clock size={18} /> End Date & Time</label>
                <input 
                  type="datetime-local" 
                  name="endTime" 
                  value={formData.endTime}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="input-group">
              <label><FileText size={18} /> Purpose</label>
              <textarea 
                name="purpose" 
                value={formData.purpose}
                onChange={handleChange}
                placeholder="Describe why you need this resource..." 
                rows="4" 
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <Send size={20} />
                  <span>Submit Request</span>
                </>
              )}
            </button>

            {success && (
              <motion.div 
                className="success-msg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                Booking request submitted successfully!
              </motion.div>
            )}
          </form>
        </motion.div>
      </div>

      <style jsx>{`
        .new-booking-container {
          max-width: 800px;
          margin: 0 auto;
          padding-bottom: 50px;
        }

        .form-card {
          padding: 40px;
          border-radius: 20px;
        }

        .form-header {
          margin-bottom: 40px;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 25px;
        }

        .form-header h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .form-header p {
          color: var(--text-muted);
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .input-row {
          display: flex;
          gap: 20px;
        }

        .input-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.95rem;
        }

        input, textarea {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 15px;
          color: white;
          font-family: inherit;
          transition: all 0.3s;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
        }

        .submit-btn {
          margin-top: 20px;
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

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .success-msg {
          margin-top: 20px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 15px;
          border-radius: 12px;
          text-align: center;
          font-weight: 500;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        @media (max-width: 600px) {
          .input-row { flex-direction: column; }
        }
      `}</style>
    </Layout>
  );
};

export default NewBooking;

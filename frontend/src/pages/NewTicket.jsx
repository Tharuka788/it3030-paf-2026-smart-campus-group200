import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicLayout from '../components/DynamicLayout';
import { motion } from 'framer-motion';
import { Send, AlertCircle, MessageSquare, ChevronLeft } from 'lucide-react';
import { ticketService } from '../services/api';

const NewTicket = () => {
  const [formData, setFormData] = useState({
    subject: '',
    category: 'IT Support',
    priority: 'MEDIUM',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const ticketData = {
        ...formData,
        userEmail: localStorage.getItem('userEmail'),
        userName: localStorage.getItem('userName'),
      };
      await ticketService.createTicket(ticketData);
      navigate('/tickets/my');
    } catch (err) {
      setError('Failed to create ticket. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DynamicLayout>
      <div className="new-ticket-page">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} /> Back to Tickets
        </button>

        <header className="page-header">
          <h1 className="gradient-text">Create Support Ticket</h1>
          <p>Submit a request for assistance or report an issue.</p>
        </header>

        <form className="ticket-form glass-morphism" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Subject</label>
            <input 
              type="text" 
              required
              placeholder="Briefly describe the issue"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="IT Support">IT Support</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Administration">Administration</option>
                <option value="Facilities">Facilities</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select 
                value={formData.priority}
                onChange={(e) => setFormData({...formData, priority: e.target.value})}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Detailed Description</label>
            <textarea 
              rows="6"
              required
              placeholder="Provide as much detail as possible..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Submitting...' : (
              <>
                <Send size={18} /> Submit Ticket
              </>
            )}
          </button>
        </form>
      </div>

      <style jsx="true">{`
        .new-ticket-page {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
        }
        .page-header h1 { font-size: 2rem; font-weight: 800; margin-bottom: 5px; }
        .page-header p { color: #64748b; }

        .ticket-form {
          background: white;
          padding: 40px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-weight: 600; color: #334155; font-size: 0.95rem; }
        
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        input, select, textarea {
          padding: 12px 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          outline: none;
          font-size: 1rem;
          color: #1e293b;
        }
        input:focus, select:focus, textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }

        .submit-btn {
          background: #6366f1;
          color: white;
          padding: 16px;
          border-radius: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 10px;
        }
        .submit-btn:hover:not(:disabled) { background: #4f46e5; transform: translateY(-2px); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

        .error-message { background: #fee2e2; color: #ef4444; padding: 12px; border-radius: 10px; font-weight: 600; }
      `}</style>
    </DynamicLayout>
  );
};

export default NewTicket;

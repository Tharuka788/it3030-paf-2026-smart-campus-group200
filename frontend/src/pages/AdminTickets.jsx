import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ticketService } from '../services/api';
import { motion } from 'framer-motion';
import { 
  Ticket, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Filter,
  Activity,
  Phone,
  Mail
} from 'lucide-react';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchAllTickets = async () => {
    setLoading(true);
    try {
      const response = await ticketService.getAllTickets();
      setTickets(response.data);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTickets();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await ticketService.updateStatus(id, status);
      fetchAllTickets();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredTickets = filter === 'ALL' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  return (
    <AdminLayout>
      <div className="admin-tickets-page">
        <header className="page-header">
          <div className="header-text">
            <h2>Support Management</h2>
            <p>Monitor and resolve system-wide support requests and maintenance tickets.</p>
          </div>
          <div className="header-filters">
            <Filter size={18} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </header>

        {loading ? (
          <div className="admin-loader">Loading tickets...</div>
        ) : (
          <div className="admin-tickets-grid">
            {filteredTickets.map((ticket) => (
              <motion.div 
                key={ticket.id}
                className="admin-ticket-card glass-morphism"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="card-header">
                  <div className="category-group">
                    <span className="ticket-category">{ticket.category}</span>
                    <span className="ticket-subcategory"> / {ticket.subcategory}</span>
                  </div>
                  <span className={`status-pill ${(ticket.status || 'OPEN').toLowerCase()}`}>
                    {(ticket.status || 'OPEN').replace('_', ' ')}
                  </span>
                </div>

                <h3 className="ticket-subject">{ticket.subject}</h3>
                <p className="ticket-desc-excerpt">{ticket.detailedDescription?.substring(0, 100)}{ticket.detailedDescription?.length > 100 ? '...' : ''}</p>
                
                <div className="ticket-meta">
                  <div className="meta-row">
                    <div className="meta-item">
                      <User size={14} />
                      <span>{ticket.userName} ({ticket.departmentName})</span>
                    </div>
                    <div className="meta-item">
                      <Clock size={14} />
                      <span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : 'Pending'}</span>
                    </div>
                  </div>
                  <div className="meta-row">
                    <div className="meta-item">
                      <AlertCircle size={14} className={`priority-${ticket.priority?.toLowerCase()}`} />
                      <span>{ticket.priority} Priority</span>
                    </div>
                    <div className="meta-item">
                      <Activity size={14} />
                      <span>Impact: {ticket.impact}</span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <div className="contact-info">
                    <Phone size={14} /> {ticket.contactNumber} | <Mail size={14} /> {ticket.email}
                  </div>
                  <select 
                    className="status-select"
                    value={ticket.status} 
                    onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style jsx="true">{`
        .admin-tickets-page {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .header-text h2 { font-size: 1.8rem; font-weight: 700; color: #1e293b; }
        .header-text p { color: #64748b; }
        
        .header-filters {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          padding: 8px 15px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        .header-filters select { border: none; outline: none; font-weight: 600; color: #475569; }
        
        .category-group { display: flex; align-items: center; gap: 4px; }
        .ticket-subcategory { font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; }

        .admin-tickets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .admin-ticket-card {
          padding: 24px;
          background: white;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .card-header { display: flex; justify-content: space-between; align-items: center; }
        .ticket-category { font-size: 0.75rem; font-weight: 700; color: #6366f1; text-transform: uppercase; }
        
        .status-pill { padding: 4px 10px; border-radius: 50px; font-size: 0.7rem; font-weight: 700; }
        .status-pill.open { background: #fee2e2; color: #ef4444; }
        .status-pill.in_progress { background: #fef3c7; color: #d97706; }
        .status-pill.resolved { background: #dcfce7; color: #16a34a; }

        .ticket-subject { font-size: 1.15rem; font-weight: 700; color: #1e293b; margin: 0; }
        .ticket-desc-excerpt { font-size: 0.9rem; color: #64748b; line-height: 1.5; margin: 0; }
        
        .ticket-meta { display: flex; flex-direction: column; gap: 10px; padding: 15px 0; border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9; }
        .meta-row { display: flex; justify-content: space-between; align-items: center; }
        .meta-item { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #475569; font-weight: 500; }
        
        .priority-high { color: #ef4444; }
        .priority-medium { color: #f59e0b; }
        .priority-low { color: #10b981; }

        .card-actions { display: flex; flex-direction: column; gap: 15px; margin-top: 5px; }
        .contact-info { font-size: 0.8rem; color: #94a3b8; font-weight: 600; display: flex; align-items: center; gap: 6px; }
        .status-select {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-weight: 700;
          color: #1e293b;
          outline: none;
          transition: all 0.2s;
        }
        .status-select:focus { border-color: #6366f1; background: white; }
      `}</style>
    </AdminLayout>
  );
};

export default AdminTickets;

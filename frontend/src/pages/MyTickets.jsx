import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { 
  Ticket, 
  Plus, 
  Filter,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  X,
  ExternalLink,
  FileText as FileIcon,
  Building,
  User,
  Mail,
  Phone
} from 'lucide-react';

import { ticketService, IMAGE_BASE_URL } from '../services/api';

const MyTickets = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          const response = await ticketService.getTicketsByUser(userEmail);
          setTickets(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch tickets:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTickets();
  }, []);

  const filteredTickets = tickets.filter(t => {
    if (filterStatus === 'All') return true;
    const normalizedStatus = t.status?.replace('_', ' ').toUpperCase();
    return normalizedStatus === filterStatus.toUpperCase();
  });

  const getStatusStyle = (status) => {
    const normalized = status?.replace('_', ' ').toUpperCase();
    switch (normalized) {
      case 'OPEN': return { bg: '#dbeafe', color: '#1e40af' };
      case 'IN PROGRESS': return { bg: '#fef3c7', color: '#d97706' };
      case 'RESOLVED': return { bg: '#dcfce7', color: '#10b981' };
      case 'CLOSED': return { bg: '#f1f5f9', color: '#64748b' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#94a3b8';
    }
  };

  return (
    <Layout>
      <div className="tickets-container">
        <header className="page-header">
          <div className="header-titles">
            <h1 className="charcoal-text">My Support Tickets</h1>
            <p className="charcoal-muted">Track and manage your campus assistance requests.</p>
          </div>
          <button className="btn-primary new-ticket-btn" onClick={() => navigate('/tickets/new')}>
            <Plus size={18} /> New Ticket
          </button>
        </header>

        <section className="stats-grid">
          <div className="stat-card glass-morphism">
            <div className="stat-icon-wrapper blue-icon">
              <Ticket size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Tickets</span>
              <span className="stat-value">{tickets.length}</span>
            </div>
          </div>
          <div className="stat-card glass-morphism">
            <div className="stat-icon-wrapper yellow-icon">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">In Progress</span>
              <span className="stat-value">
                {tickets.filter(t => t.status?.replace('_', ' ').toUpperCase() === 'IN PROGRESS').length}
              </span>
            </div>
          </div>
          <div className="stat-card glass-morphism">
            <div className="stat-icon-wrapper green-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Resolved</span>
              <span className="stat-value">
                {tickets.filter(t => t.status?.toUpperCase() === 'RESOLVED').length}
              </span>
            </div>
          </div>
        </section>

        <section className="tickets-section">
          <div className="section-header">
            <h2 className="section-title">Ticket List</h2>
            <div className="filters">
              <Filter size={18} className="filter-icon" />
              {['All', 'Open', 'In Progress', 'Resolved'].map(status => (
                <button 
                  key={status}
                  className={`filter-pill ${filterStatus === status ? 'active' : ''}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="tickets-list">
            {filteredTickets.length === 0 ? (
              <div className="empty-state glass-morphism">
                <h3>No tickets found</h3>
                <p>You don't have any support requests matching this filter.</p>
              </div>
            ) : (
              <div className="tickets-grid">
                {filteredTickets.map((ticket, index) => {
                  const statusStyle = getStatusStyle(ticket.status);
                  return (
                    <motion.div 
                      key={ticket.id}
                      className="ticket-card glass-morphism"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="ticket-header">
                        <span className="ticket-id">{ticket.id}</span>
                        <span className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          {ticket.status}
                        </span>
                      </div>

                      <h3 className="ticket-subject">{ticket.subject}</h3>
                      
                      <div className="ticket-details">
                        <div className="detail-item">
                          <AlertCircle size={14} style={{ color: getPriorityColor(ticket.priority) }} />
                          <span>{ticket.priority} Priority</span>
                        </div>
                        <div className="detail-item">
                          <MessageSquare size={14} />
                          <span>{ticket.category}</span>
                        </div>
                        <div className="detail-item">
                          <Clock size={14} />
                          <span>
                            {ticket.updatedAt 
                              ? `Updated ${new Date(ticket.updatedAt).toLocaleDateString()}` 
                              : `Created ${new Date(ticket.createdAt).toLocaleDateString()}`}
                          </span>
                        </div>
                      </div>

                      {ticket.adminComments && (
                        <div className="card-admin-note-preview">
                          <MessageSquare size={12} />
                          <p>{ticket.adminComments.length > 60 ? `${ticket.adminComments.substring(0, 60)}...` : ticket.adminComments}</p>
                        </div>
                      )}

                      <div className="ticket-footer">
                        <button 
                          className="view-details-btn"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* User Detail Modal */}
        {selectedTicket && (
          <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
            <motion.div 
              className="ticket-detail-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <header className="modal-header">
                <div className="modal-title-group">
                  <div className="id-badge">#{selectedTicket.id?.substring(0, 8)}</div>
                  <h2>Ticket Overview</h2>
                </div>
                <button className="close-modal-btn" onClick={() => setSelectedTicket(null)}>
                  <X size={24} />
                </button>
              </header>

              <div className="modal-body-scrollable">
                <div className="modal-grid-balanced">
                  {/* Left Side: Submission Content */}
                  <div className="modal-side-column">
                    <section className="detail-section">
                      <div className="section-label">YOUR SUBMISSION</div>
                      <div className="info-group mb-20">
                        <label>Subject (Short Description)</label>
                        <h1 className="full-subject">{selectedTicket.subject}</h1>
                      </div>
                      <div className="info-group">
                        <label>Detailed Description</label>
                        <div className="full-description">
                          {selectedTicket.detailedDescription}
                        </div>
                      </div>
                    </section>

                    <section className="detail-section highlight-box">
                      <div className="section-label">CLASSIFICATION & IMPACT</div>
                      <div className="side-by-side-info">
                        <div className="info-group">
                          <label>Category</label>
                          <span>{selectedTicket.category}</span>
                        </div>
                        <div className="info-group">
                          <label>Subcategory</label>
                          <span>{selectedTicket.subcategory}</span>
                        </div>
                      </div>
                      <div className="side-by-side-info mt-15">
                        <div className="info-group">
                          <label>Priority Level</label>
                          <span className={`priority-text priority-${selectedTicket.priority?.toLowerCase()}`}>
                            {selectedTicket.priority}
                          </span>
                        </div>
                        <div className="info-group">
                          <label>Impact Level</label>
                          <span>{selectedTicket.impact}</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Right Side: Admin Response & Meta */}
                  <div className="modal-side-column">
                    {selectedTicket.adminComments ? (
                      <section className="detail-section admin-response-highlight">
                        <div className="section-label">OFFICIAL RESPONSE FROM ADMIN</div>
                        <div className="admin-msg-content">
                          <div className="msg-header">
                            <MessageSquare size={18} />
                            <span>Institutional Feedback</span>
                          </div>
                          <p className="msg-text">{selectedTicket.adminComments}</p>
                        </div>
                        <div className="status-meta">
                          <label>Current Status:</label>
                          <span className={`status-pill status-${selectedTicket.status?.toLowerCase()}`}>
                            {selectedTicket.status?.replace('_', ' ')}
                          </span>
                        </div>
                      </section>
                    ) : (
                      <section className="detail-section highlight-box pending-box">
                        <div className="section-label">ADMIN STATUS</div>
                        <div className="pending-content">
                          <Clock size={32} />
                          <p>Your request is currently {selectedTicket.status?.replace('_', ' ')}. An administrator will provide feedback shortly.</p>
                        </div>
                      </section>
                    )}

                    <section className="detail-section">
                      <div className="section-label">SUBMISSION DETAILS</div>
                      <div className="meta-list">
                        <div className="meta-row">
                          <label>User Name</label>
                          <span>{selectedTicket.userName}</span>
                        </div>
                        <div className="meta-row">
                          <label>Department</label>
                          <span>{selectedTicket.departmentName}</span>
                        </div>
                        <div className="meta-row">
                          <label>Submitted On</label>
                          <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    </section>

                    {selectedTicket.attachmentPaths?.length > 0 && (
                      <section className="detail-section">
                        <div className="section-label">ATTACHMENTS ({selectedTicket.attachmentPaths.length})</div>
                        <div className="attachments-list-vertical">
                          {selectedTicket.attachmentPaths.map((path, idx) => {
                            const cleanPath = path.replace(/\\/g, '/');
                            const fileName = cleanPath.split('/').pop();
                            const fullUrl = `${IMAGE_BASE_URL}/${cleanPath}`;
                            
                            return (
                              <div key={idx} className="attachment-row-item">
                                <div className="attachment-preview-mini">
                                  {path.toLowerCase().endsWith('.png') ? (
                                    <img src={fullUrl} alt="attachment" />
                                  ) : (
                                    <FileIcon size={18} />
                                  )}
                                </div>
                                <div className="attachment-details">
                                  <span className="file-name-text">{fileName}</span>
                                  <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="view-action-btn">
                                    Open Image <ExternalLink size={12} />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .tickets-container {
          display: flex;
          flex-direction: column;
          gap: 35px;
          padding-bottom: 50px;
          color: #334155;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-titles h1.charcoal-text {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: #334155;
        }

        .charcoal-muted {
          color: #64748b;
          font-size: 1.05rem;
        }

        .new-ticket-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #0ea5e9;
          color: white;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.2);
        }

        .new-ticket-btn:hover {
          background: #0284c7;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(14, 165, 233, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 25px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid var(--glass-border);
          box-shadow: var(--box-shadow);
        }

        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .blue-icon { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
        .yellow-icon { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .green-icon { background: rgba(16, 185, 129, 0.15); color: #10b981; }

        .stat-info { display: flex; flex-direction: column; gap: 4px; }
        .stat-label { color: #94a3b8; font-size: 0.9rem; font-weight: 500; }
        .stat-value { font-size: 1.8rem; font-weight: 700; color: #334155; }

        .tickets-section { display: flex; flex-direction: column; gap: 25px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; }
        .section-title { font-size: 1.4rem; font-weight: 600; color: #334155; }

        .filters { display: flex; align-items: center; gap: 12px; }
        .filter-icon { color: #94a3b8; margin-right: 5px; }
        .filter-pill {
          background: #f1f5f9;
          border: 1px solid transparent;
          color: #64748b;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-pill:hover {
          background: #e2e8f0;
          color: #334155;
        }
        .filter-pill.active {
          background: #dbeafe;
          border-color: #bfdbfe;
          color: #1e3a8a;
        }

        .tickets-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .ticket-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #f1f5f9;
          box-shadow: var(--box-shadow);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ticket-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--box-shadow-hover);
          border-color: #e2e8f0;
        }

        .ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ticket-id {
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .status-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 8px;
          letter-spacing: 0.05em;
        }

        .ticket-subject {
          font-size: 1.1rem;
          font-weight: 600;
          color: #334155;
          line-height: 1.4;
        }

        .ticket-details {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 4px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #94a3b8;
          font-size: 0.9rem;
        }
        .detail-item span {
          font-weight: 500;
        }

        .card-admin-note-preview {
          margin-top: 15px;
          background: #f8fafc;
          border-left: 3px solid #6366f1;
          padding: 10px 12px;
          border-radius: 8px;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .card-admin-note-preview p {
          margin: 0;
          font-size: 0.8rem;
          color: #475569;
          font-style: italic;
          line-height: 1.4;
        }

        .card-admin-note-preview svg {
          color: #6366f1;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .admin-response-section {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 12px;
          padding: 15px;
          margin-top: 15px;
        }

        .response-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #0369a1;
          font-weight: 700;
          font-size: 0.85rem;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .response-text {
          margin: 0;
          font-size: 0.95rem;
          color: #075985;
          line-height: 1.5;
        }

        .ticket-footer {
          margin-top: 8px;
          padding-top: 16px;
          border-top: 1px solid #f1f5f9;
        }

        .view-details-btn {
          width: 100%;
          padding: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          color: #334155;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-details-btn:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        .empty-state {
          padding: 60px 40px;
          text-align: center;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #f1f5f9;
          box-shadow: var(--box-shadow);
        }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr; }
          .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .section-header { flex-direction: column; align-items: flex-start; gap: 15px; }
        }

        /* Modal Styles */
        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(12px);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px;
          z-index: 1000;
        }

        .ticket-detail-modal {
          background: white;
          width: 100%;
          max-width: 1100px;
          max-height: 90vh;
          border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .modal-header {
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
        }

        .modal-title-group { display: flex; align-items: center; gap: 15px; }
        .modal-title-group h2 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #1e293b; }
        .id-badge { background: #f1f5f9; padding: 4px 10px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; color: #64748b; }
        
        .close-modal-btn { 
          background: #f1f5f9; border: none; padding: 8px; border-radius: 12px; 
          cursor: pointer; transition: all 0.2s; color: #64748b;
        }
        .close-modal-btn:hover { background: #fee2e2; color: #ef4444; }

        .modal-body-scrollable { padding: 0; overflow-y: auto; flex: 1; }
        .modal-grid-balanced { display: grid; grid-template-columns: 1fr 1fr; }
        .modal-side-column { padding: 32px; display: flex; flex-direction: column; gap: 30px; }
        .modal-side-column:first-child { border-right: 1px solid #f1f5f9; }
        
        .section-label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; letter-spacing: 0.1em; margin-bottom: 15px; }
        .highlight-box { background: #f8fafc; padding: 24px; border-radius: 20px; border: 1px solid #f1f5f9; }
        
        .full-subject { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin: 0 0 5px 0; line-height: 1.2; }
        .full-description { font-size: 1rem; color: #475569; line-height: 1.6; white-space: pre-wrap; }

        .side-by-side-info { display: flex; gap: 30px; }
        .info-group { flex: 1; display: flex; flex-direction: column; gap: 5px; }
        .info-group label { font-size: 0.75rem; color: #64748b; font-weight: 600; }
        .info-group span { font-weight: 700; color: #1e293b; font-size: 1rem; }
        .mt-15 { margin-top: 15px; }
        .mb-20 { margin-bottom: 20px; }

        .admin-response-highlight { background: #eff6ff; padding: 24px; border-radius: 20px; border: 1px solid #bfdbfe; }
        .admin-msg-content { background: white; padding: 16px; border-radius: 14px; border: 1px solid #dbeafe; margin-bottom: 15px; }
        .msg-header { display: flex; align-items: center; gap: 10px; color: #1d4ed8; font-weight: 800; font-size: 0.9rem; margin-bottom: 8px; }
        .msg-text { margin: 0; color: #1e3a8a; line-height: 1.5; font-size: 1rem; }
        
        .status-meta { display: flex; align-items: center; gap: 10px; }
        .status-meta label { font-size: 0.8rem; font-weight: 700; color: #1e40af; }
        .status-pill { padding: 4px 12px; border-radius: 99px; font-weight: 800; font-size: 0.75rem; text-transform: uppercase; }
        .status-open { background: #dbeafe; color: #1e40af; }
        .status-in_progress { background: #fef3c7; color: #92400e; }
        .status-resolved { background: #dcfce7; color: #166534; }
        .status-closed { background: #f1f5f9; color: #475569; }

        .pending-box { display: flex; flex-direction: column; align-items: center; text-align: center; color: #64748b; }
        .pending-content { padding: 20px 0; display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .pending-content p { font-size: 0.9rem; font-weight: 500; margin: 0; }

        .meta-list { display: flex; flex-direction: column; gap: 12px; }
        .meta-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px dashed #e2e8f0; }
        .meta-row:last-child { border-bottom: none; }
        .meta-row label { font-size: 0.75rem; font-weight: 600; color: #94a3b8; }
        .meta-row span { font-size: 0.9rem; font-weight: 700; color: #334155; }

        .attachments-list-vertical { display: flex; flex-direction: column; gap: 12px; }
        .attachment-row-item { display: flex; align-items: center; gap: 15px; padding: 12px; background: white; border-radius: 12px; border: 1px solid #f1f5f9; }
        .attachment-preview-mini { width: 40px; height: 40px; background: #e2e8f0; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .attachment-preview-mini img { width: 100%; height: 100%; object-fit: cover; }
        .attachment-details { flex: 1; display: flex; flex-direction: column; }
        .file-name-text { font-size: 0.85rem; font-weight: 600; color: #1e293b; }
        .view-action-btn { font-size: 0.75rem; font-weight: 700; color: #6366f1; text-decoration: none; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
      `}</style>
    </Layout>
  );
};

export default MyTickets;

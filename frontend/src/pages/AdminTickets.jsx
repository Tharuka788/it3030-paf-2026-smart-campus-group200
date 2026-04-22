import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { ticketService, IMAGE_BASE_URL } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Filter,
  Activity,
  Phone,
  Mail,
  X,
  ExternalLink,
  FileIcon,
  Building,
  ChevronRight
} from 'lucide-react';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [modalStatus, setModalStatus] = useState('');
  const [updating, setUpdating] = useState(false);

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

  const handleStatusUpdate = async (id, status, commentToUse) => {
    setUpdating(true);
    try {
      await ticketService.updateStatus(id, status, commentToUse || adminComment);
      await fetchAllTickets();
      // Update selected ticket state if modal is open
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(prev => ({ 
          ...prev, 
          status, 
          adminComments: commentToUse || adminComment 
        }));
        // We don't clear adminComment here anymore, let the user see it's saved
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (selectedTicket) {
      setAdminComment(selectedTicket.adminComments || '');
      setModalStatus(selectedTicket.status || 'OPEN');
    } else {
      setAdminComment('');
      setModalStatus('');
    }
  }, [selectedTicket]);

  const filteredTickets = filter === 'ALL' 
    ? tickets 
    : tickets.filter(t => t.status?.toUpperCase() === filter);

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
          <div className="admin-tickets-list">
            {filteredTickets.map((ticket) => (
              <motion.div 
                key={ticket.id}
                className="admin-ticket-card glass-morphism"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="card-content-layout">
                  <div className="main-info">
                    <div className="card-header">
                      <div className="category-group">
                        <span className="ticket-category">{ticket.category}</span>
                        <span className="ticket-subcategory"> / {ticket.subcategory}</span>
                      </div>
                      <span className={`status-pill ${(ticket.status || 'OPEN').toLowerCase()}`}>
                        {(ticket.status || 'OPEN').replace('_', ' ')}
                      </span>
                    </div>

                    <div className="subject-row">
                      <h3 className="ticket-subject">{ticket.subject}</h3>
                      <ChevronRight size={18} className="arrow-icon" />
                    </div>
                    <p className="ticket-desc-excerpt">{ticket.detailedDescription?.substring(0, 150)}{ticket.detailedDescription?.length > 150 ? '...' : ''}</p>
                    
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
                        <div className="meta-item">
                          <AlertCircle size={14} className={`priority-${ticket.priority?.toLowerCase()}`} />
                          <span>{ticket.priority} Priority</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="side-actions" onClick={(e) => e.stopPropagation()}>
                    <div className="contact-info">
                      <div className="contact-item"><Phone size={14} /> {ticket.contactNumber}</div>
                      <div className="contact-item"><Mail size={14} /> {ticket.email}</div>
                    </div>
                    <div className="status-update-box" onClick={(e) => e.stopPropagation()}>
                      <label>Update Status</label>
                      <select 
                        className="status-select"
                        value={ticket.status} 
                        onChange={(e) => handleStatusUpdate(ticket.id, e.target.value, '')}
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTicket && (
          <div className="modal-backdrop" onClick={() => setSelectedTicket(null)}>
            <motion.div 
              className="ticket-detail-modal"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <header className="modal-header">
                <div className="modal-title-group">
                  <div className="id-badge">#{selectedTicket.id?.substring(0, 8)}</div>
                  <h2>Ticket Details</h2>
                </div>
                <button className="close-modal-btn" onClick={() => setSelectedTicket(null)}>
                  <X size={24} />
                </button>
              </header>

              <div className="modal-body-scrollable">
                <div className="modal-grid-balanced">
                  {/* Left Side: Ticket Content */}
                  <div className="modal-side-column">
                    <section className="detail-section">
                      <div className="section-label">TICKET CORE INFORMATION</div>
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
                          <label>Priority level</label>
                          <span className={`p-text priority-${selectedTicket.priority?.toLowerCase()}`}>
                            {selectedTicket.priority}
                          </span>
                        </div>
                        <div className="info-group">
                          <label>Impact</label>
                          <span>{selectedTicket.impact}</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Right Side: User & Attachments */}
                  <div className="modal-side-column">
                    <section className="detail-section highlight-box">
                      <div className="section-label">REQUSTER CONTACT INFORMATION</div>
                      <div className="user-detail-card">
                        <div className="contact-list-detailed">
                          <div className="detail-item-row">
                            <label>User Name</label>
                            <span>{selectedTicket.userName}</span>
                          </div>
                          <div className="detail-item-row">
                            <label>Department Name</label>
                            <span>{selectedTicket.departmentName}</span>
                          </div>
                          <div className="detail-item-row">
                            <label>Email Address</label>
                            <span>{selectedTicket.email}</span>
                          </div>
                          <div className="detail-item-row">
                            <label>Contact Number</label>
                            <span>{selectedTicket.contactNumber}</span>
                          </div>
                          <div className="detail-item-row">
                            <label>Submission Time</label>
                            <span>{selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : 'N/A'}</span>
                          </div>
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
                                    Open PNG/File <ExternalLink size={12} />
                                  </a>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    <section className="detail-section status-footer-section">
                      <div className="section-label">ADMIN MANAGEMENT</div>
                      
                      <div className="admin-comment-input-group">
                        <label>Admin Feedback / Resolution Notes</label>
                        <textarea 
                          placeholder="Type a message to the user here..."
                          value={adminComment}
                          onChange={(e) => setAdminComment(e.target.value)}
                          className="admin-comment-textarea"
                        />
                      </div>

                      <div className="status-control-wrapper">
                        <label>Modify Ticket Status</label>
                        <select 
                          className="modal-status-select-large"
                          value={modalStatus} 
                          onChange={(e) => setModalStatus(e.target.value)}
                        >
                          <option value="OPEN">Open</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="CLOSED">Closed</option>
                        </select>
                      </div>

                      <button 
                        className={`save-update-btn ${updating ? 'updating' : ''}`}
                        onClick={() => handleStatusUpdate(selectedTicket.id, modalStatus)}
                        disabled={updating}
                      >
                        {updating ? (
                          <>
                            <Activity size={18} className="spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle size={18} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </section>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx="true">{`
        .admin-tickets-page {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        .page-header { display: flex; justify-content: space-between; align-items: center; }
        .header-text h2 { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin: 0; }
        .header-text p { color: #64748b; margin: 5px 0 0 0; }
        
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

        .admin-tickets-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .admin-ticket-card {
          background: white;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .admin-ticket-card:hover { 
          transform: translateY(-4px) scale(1.01); 
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); 
          border-color: #6366f1;
        }

        .subject-row { display: flex; justify-content: space-between; align-items: center; }
        .arrow-icon { color: #cbd5e1; transition: transform 0.2s; }
        .admin-ticket-card:hover .arrow-icon { color: #6366f1; transform: translateX(5px); }
        
        .card-content-layout {
          display: flex;
          gap: 30px;
          padding: 24px;
        }
        .main-info { flex: 1; display: flex; flex-direction: column; gap: 12px; }
        .side-actions { 
          width: 250px; 
          padding-left: 30px; 
          border-left: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 20px;
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

        .contact-info { font-size: 0.8rem; color: #94a3b8; font-weight: 600; display: flex; flex-direction: column; gap: 6px; }
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
        
        .full-subject { font-size: 1.8rem; font-weight: 800; color: #1e293b; margin: 0 0 15px 0; line-height: 1.2; }
        .full-description { font-size: 1rem; color: #475569; line-height: 1.6; white-space: pre-wrap; }

        .side-by-side-info { display: flex; gap: 30px; }
        .info-group { flex: 1; display: flex; flex-direction: column; gap: 5px; }
        .info-group label { font-size: 0.75rem; color: #64748b; font-weight: 600; }
        .info-group span { font-weight: 700; color: #1e293b; font-size: 1rem; }
        .mt-15 { margin-top: 15px; }

        .user-detail-card { display: flex; flex-direction: column; gap: 20px; }
        .contact-list-detailed { display: flex; flex-direction: column; gap: 15px; }
        .detail-item-row { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #f1f5f9; }
        .detail-item-row:last-child { border-bottom: none; }
        .detail-item-row label { font-size: 0.75rem; color: #64748b; font-weight: 700; width: 140px; }
        .detail-item-row span { font-weight: 700; color: #1e293b; font-size: 0.95rem; text-align: right; flex: 1; }

        .attachments-list-vertical { display: flex; flex-direction: column; gap: 12px; }
        .attachment-row-item { display: flex; align-items: center; gap: 15px; padding: 12px; background: white; border-radius: 12px; border: 1px solid #f1f5f9; }
        .attachment-preview-mini { width: 40px; height: 40px; background: #e2e8f0; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
        .attachment-preview-mini img { width: 100%; height: 100%; object-fit: cover; }
        .attachment-details { flex: 1; display: flex; flex-direction: column; }
        .file-name-text { font-size: 0.85rem; font-weight: 600; color: #1e293b; }
        .view-action-btn { font-size: 0.75rem; font-weight: 700; color: #6366f1; text-decoration: none; display: flex; align-items: center; gap: 4px; margin-top: 2px; }

        .admin-comment-input-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
        .admin-comment-input-group label { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
        .admin-comment-textarea {
          width: 100%; height: 100px; padding: 12px; border-radius: 14px; border: 2px solid #e2e8f0;
          background: #f8fafc; font-size: 0.95rem; color: #1e293b; resize: none; outline: none; transition: all 0.2s;
        }
        .admin-comment-textarea:focus { border-color: #6366f1; background: white; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }

        .mb-20 { margin-bottom: 20px; }
        .status-footer-section { margin-top: auto; padding-top: 30px; border-top: 1px dashed #e2e8f0; }
        .status-control-wrapper { display: flex; flex-direction: column; gap: 10px; }
        .status-control-wrapper label { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
        .modal-status-select-large { 
          width: 100%; padding: 14px; border-radius: 14px; border: 2px solid #e2e8f0; 
          background: white; font-weight: 800; cursor: pointer; color: #1e293b; font-size: 1rem;
          margin-bottom: 15px;
        }

        .save-update-btn {
          width: 100%; padding: 16px; border-radius: 16px; border: none;
          background: #6366f1; color: white; font-weight: 800; font-size: 1rem;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.3s; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .save-update-btn:hover { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(99, 102, 241, 0.4); }
        .save-update-btn:active { transform: translateY(0); }
        .save-update-btn:disabled { background: #94a3b8; cursor: not-allowed; transform: none; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </AdminLayout>
  );
};

export default AdminTickets;

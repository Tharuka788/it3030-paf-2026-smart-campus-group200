import React, { useState } from 'react';
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
  MessageSquare
} from 'lucide-react';

const MyTickets = () => {
  const [filterStatus, setFilterStatus] = useState('All');
  const navigate = useNavigate();

  // Mock data for tickets
  const [tickets] = useState([
    {
      id: 'TKT-001',
      subject: 'Wi-Fi connectivity issue in Library',
      category: 'IT Support',
      status: 'OPEN',
      priority: 'HIGH',
      createdAt: '2024-04-18T10:30:00Z',
      lastUpdate: '2 hours ago'
    },
    {
      id: 'TKT-002',
      subject: 'Broken desk in Lecture Hall 04',
      category: 'Maintenance',
      status: 'IN PROGRESS',
      priority: 'MEDIUM',
      createdAt: '2024-04-15T14:20:00Z',
      lastUpdate: '1 day ago'
    },
    {
      id: 'TKT-003',
      subject: 'Library card replacement request',
      category: 'Administration',
      status: 'RESOLVED',
      priority: 'LOW',
      createdAt: '2024-04-10T09:00:00Z',
      lastUpdate: '3 days ago'
    }
  ]);

  const filteredTickets = tickets.filter(t => 
    filterStatus === 'All' ? true : t.status === filterStatus.toUpperCase()
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN': return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' };
      case 'IN PROGRESS': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' };
      case 'RESOLVED': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' };
      case 'CLOSED': return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' };
      default: return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' };
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
            <h1 className="text-white">My Support Tickets</h1>
            <p>Track and manage your campus assistance requests.</p>
          </div>
          <button className="btn-primary new-ticket-btn" onClick={() => {}}>
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
              <span className="stat-value">{tickets.filter(t => t.status === 'IN PROGRESS').length}</span>
            </div>
          </div>
          <div className="stat-card glass-morphism">
            <div className="stat-icon-wrapper green-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Resolved</span>
              <span className="stat-value">{tickets.filter(t => t.status === 'RESOLVED').length}</span>
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
                          <span>Updated {ticket.lastUpdate}</span>
                        </div>
                      </div>

                      <div className="ticket-footer">
                        <button className="view-details-btn">View Details</button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      <style jsx="true">{`
        .tickets-container {
          display: flex;
          flex-direction: column;
          gap: 35px;
          padding-bottom: 50px;
          color: white;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-titles h1 {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: #ffffff;
        }

        .header-titles p {
          color: #94a3b8;
          font-size: 1.05rem;
        }

        .new-ticket-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #3b82f6;
          color: white;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }

        .new-ticket-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(59, 130, 246, 0.4);
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
          border-radius: 16px;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
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
        .stat-value { font-size: 1.8rem; font-weight: 700; color: white; }

        .tickets-section { display: flex; flex-direction: column; gap: 25px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; }
        .section-title { font-size: 1.4rem; font-weight: 600; color: white; }

        .filters { display: flex; align-items: center; gap: 12px; }
        .filter-icon { color: #94a3b8; margin-right: 5px; }
        .filter-pill {
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #94a3b8;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .filter-pill.active {
          background: rgba(59, 130, 246, 0.15);
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .tickets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 25px;
        }

        .ticket-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-radius: 16px;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s;
        }

        .ticket-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
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
          color: white;
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

        .ticket-footer {
          margin-top: 8px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .view-details-btn {
          width: 100%;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-details-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .empty-state {
          padding: 60px 40px;
          text-align: center;
          border-radius: 16px;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: 1fr; }
          .page-header { flex-direction: column; align-items: flex-start; gap: 15px; }
          .section-header { flex-direction: column; align-items: flex-start; gap: 15px; }
        }
      `}</style>
    </Layout>
  );
};

export default MyTickets;

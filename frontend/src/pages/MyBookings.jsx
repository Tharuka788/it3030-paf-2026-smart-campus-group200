import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Filter,
  Plus,
  Users,
  FileText,
  CheckCircle,
  CalendarDays
} from 'lucide-react';
import { bookingService } from '../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) {
        setLoading(false);
        return;
      }
      const response = await bookingService.getBookingsByUser(userEmail);
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
       try {
         await bookingService.deleteBooking(id);
         setBookings(bookings.filter(b => b.id !== id));
       } catch (err) {
         console.error('Failed to delete booking:', err);
       }
    }
  };

  const filteredBookings = bookings.filter(b => 
    filterStatus === 'All' ? true : b.status === filterStatus.toUpperCase()
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return '#10b981'; // green
      case 'PENDING': return '#d97706'; // golden-orange
      case 'REJECTED': return '#ef4444'; // red
      case 'CANCELLED': return '#64748b'; // slate/gray
      default: return '#64748b';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'APPROVED': return '#dcfce7'; // light green
      case 'PENDING': return '#fef3c7'; // light golden-orange
      case 'REJECTED': return '#fee2e2'; // light red
      case 'CANCELLED': return '#f1f5f9'; // light gray
      default: return '#f1f5f9';
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'PENDING').length,
    approved: bookings.filter(b => b.status === 'APPROVED').length
  };

  return (
    <Layout>
      <div className="bookings-container">
        <header className="page-header">
           <div className="header-titles">
             <h1 className="charcoal-text">My Bookings</h1>
             <p className="charcoal-muted">Manage your university resource reservations.</p>
           </div>
           <button className="btn-primary new-booking-btn" onClick={() => navigate('/bookings/new')}>
             <Plus size={18} /> New Booking
           </button>
        </header>

        <section className="stats-grid">
          <div className="stat-card glass-morphism">
            <div className="stat-icon-wrapper blue-icon">
               <CalendarDays size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Bookings</span>
              <span className="stat-value gold-text">{stats.total}</span>
            </div>
          </div>
          <div className="stat-card glass-morphism">
            <div className="stat-icon-wrapper yellow-icon">
               <Clock size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Pending Approval</span>
              <span className="stat-value golden-yellow-text">{stats.pending}</span>
            </div>
          </div>
          <div className="stat-card glass-morphism">
            <div className="stat-icon-wrapper green-icon">
               <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Approved Bookings</span>
              <span className="stat-value green-text">{stats.approved}</span>
            </div>
          </div>
        </section>

        <section className="recent-activity-section">
          <div className="section-header">
            <h2 className="section-title">Recent Activity</h2>
            <div className="filters">
              <Filter size={18} className="filter-icon" />
              {['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map(status => (
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

          <div className="bookings-list">
             {loading ? (
               <div className="loading-spinner">Loading your bookings...</div>
             ) : filteredBookings.length === 0 ? (
               <div className="empty-state glass-morphism">
                 <h3>No bookings found</h3>
                 <p>You haven't made any resource requests yet.</p>
               </div>
             ) : (
               <div className="bookings-grid">
                 {filteredBookings.map((booking, index) => (
                   <motion.div 
                     key={booking.id}
                     className="booking-card glass-morphism"
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: index * 0.05 }}
                   >
                      <div className="card-header">
                         <h3 className="room-name">{booking.resourceName || booking.resourceId || 'Resource Name'}</h3>
                         <span className="status-badge" style={{ backgroundColor: getStatusBg(booking.status), color: getStatusColor(booking.status) }}>
                            {booking.status === 'PENDING' ? 'Pending' : booking.status === 'APPROVED' ? 'Approved' : booking.status === 'REJECTED' ? 'Rejected' : 'Cancelled'}
                         </span>
                      </div>

                      <div className="card-body">
                         <div className="info-row">
                            <Calendar size={16} className="info-icon" /> 
                            <span>{new Date(booking.startTime).toLocaleDateString('en-CA')}</span>
                         </div>
                         <div className="info-row">
                            <Clock size={16} className="info-icon" /> 
                            <span>{new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         </div>
                         <div className="info-row">
                            <Users size={16} className="info-icon" />
                            <span>{booking.expectedAttendees || 0} Attendees</span>
                         </div>
                         <div className="info-row purpose-row">
                            <FileText size={16} className="info-icon" />
                            <span>{booking.purpose}</span>
                         </div>
                      </div>

                      {booking.status === 'PENDING' && (
                        <button className="cancel-booking-btn" onClick={(e) => { e.stopPropagation(); handleDelete(booking.id); }}>
                           Cancel Booking
                        </button>
                      )}
                   </motion.div>
                 ))}
               </div>
             )}
          </div>
        </section>
      </div>

      <style jsx="true">{`
        .bookings-container {
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

        .new-booking-btn {
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

        .new-booking-btn:hover {
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
          border-radius: 16px;
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

        .blue-icon {
          background: rgba(6, 182, 212, 0.15);
          color: #06b6d4;
        }

        .yellow-icon {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .green-icon {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stat-label {
          color: var(--text-muted, #94a3b8);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
        }

        .gold-text { color: #d4af37; }
        .golden-yellow-text { color: #f59e0b; }
        .green-text { color: #10b981; }

        .recent-activity-section {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-title {
          font-size: 1.4rem;
          font-weight: 600;
          color: #334155;
        }

        .filters {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filter-icon {
          color: var(--text-muted, #94a3b8);
          margin-right: 5px;
        }

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

        .bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 25px;
        }

        .booking-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #f1f5f9;
          box-shadow: var(--box-shadow);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .booking-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--box-shadow-hover);
          border-color: #e2e8f0;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .room-name {
          font-size: 1.15rem;
          font-weight: 600;
          color: #334155;
          margin: 0;
        }

        .status-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 12px;
          letter-spacing: 0.5px;
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .info-row {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #64748b;
          font-size: 0.95rem;
        }

        .info-icon {
          color: #0ea5e9;
          min-width: 16px;
        }

        .purpose-row {
          margin-top: 8px;
          padding-top: 14px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          align-items: flex-start;
        }
        
        .purpose-row .info-icon {
          margin-top: 2px;
        }

        .cancel-booking-btn {
          margin-top: auto;
          background: transparent;
          color: #ef4444;
          border: none;
          padding: 8px 0;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          width: fit-content;
          text-decoration: underline;
        }

        .cancel-booking-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        .empty-state {
          padding: 80px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 15px;
          border-radius: 16px;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .empty-state h3 { font-size: 1.4rem; color: #334155; }
        .empty-state p { color: var(--text-muted, #94a3b8); }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }
          .filters {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </Layout>
  );
};

export default MyBookings;

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
      // Mocking user email for now
      const response = await bookingService.getBookingsByUser('student@campus.edu');
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
      case 'PENDING': return '#f59e0b'; // yellow/orange
      case 'REJECTED': return '#ef4444'; // red
      case 'CANCELLED': return '#94a3b8'; // slate/gray
      default: return '#94a3b8';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'APPROVED': return 'rgba(16, 185, 129, 0.15)';
      case 'PENDING': return 'rgba(245, 158, 11, 0.15)';
      case 'REJECTED': return 'rgba(239, 68, 68, 0.15)';
      case 'CANCELLED': return 'rgba(148, 163, 184, 0.15)';
      default: return 'rgba(148, 163, 184, 0.15)';
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
             <h1 className="text-white">My Bookings</h1>
             <p>Manage your university resource reservations.</p>
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
              <span className="stat-value">{stats.total}</span>
            </div>
          </div>
          <div className="stat-card glass-morphism">
            <div className="stat-icon-wrapper yellow-icon">
               <Clock size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Pending Approval</span>
              <span className="stat-value">{stats.pending}</span>
            </div>
          </div>
          <div className="stat-card glass-morphism">
            <div className="stat-icon-wrapper green-icon">
               <CheckCircle size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Approved Bookings</span>
              <span className="stat-value">{stats.approved}</span>
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
                         <h3 className="room-name">{booking.resourceId || 'Resource Name'}</h3>
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
          color: var(--text-muted, #94a3b8);
          font-size: 1.05rem;
        }

        .new-booking-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #06b6d4;
          color: #0f172a;
          font-weight: 600;
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 20px rgba(6, 182, 212, 0.3);
        }

        .new-booking-btn:hover {
          background: #0891b2;
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(6, 182, 212, 0.4);
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
          color: white;
        }

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
          color: white;
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
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--text-muted, #94a3b8);
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-pill:hover {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .filter-pill.active {
          background: rgba(6, 182, 212, 0.15);
          border-color: #06b6d4;
          color: #06b6d4;
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
          border-radius: 16px;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.3s;
        }

        .booking-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .room-name {
          font-size: 1.15rem;
          font-weight: 600;
          color: white;
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
          color: #cbd5e1;
          font-size: 0.95rem;
        }

        .info-icon {
          color: #06b6d4;
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
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 10px;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          width: 100%;
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

        .empty-state h3 { font-size: 1.4rem; color: white; }
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

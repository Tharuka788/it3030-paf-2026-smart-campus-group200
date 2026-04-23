import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { bookingService } from '../services/api';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  CalendarClock, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User,
  MapPin,
  Filter
} from 'lucide-react';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');

  const fetchAllBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingService.getAllBookings();
      setBookings(response.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const handleStatusUpdate = async (id, status, reasonText = null) => {
    try {
      await bookingService.updateStatus(id, status, reasonText);
      setRejectingId(null);
      setReason('');
      fetchAllBookings();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filteredBookings = filter === 'ALL' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  return (
    <AdminLayout>
      <div className="admin-bookings-page">
        <header className="page-header">
          <div className="header-text">
            <h2>Booking Management</h2>
            <p>Review and manage all resource reservations across the campus.</p>
          </div>
          <div className="header-filters">
            <Filter size={18} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </header>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="admin-bookings-grid">
            {filteredBookings.map((booking) => (
              <motion.div 
                key={booking.id}
                className="admin-booking-card glass-morphism"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="card-header">
                  <div className="user-info">
                    <div className="avatar-small">
                       {booking.userName.charAt(0)}
                    </div>
                    <div className="user-details">
                      <span className="user-name">{booking.userName}</span>
                      <span className="user-email">{booking.userEmail}</span>
                    </div>
                  </div>
                  <span className={`status-pill ${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="card-body">
                  <div className="resource-info">
                    <MapPin size={18} />
                    <h3>{booking.resourceName || booking.resourceId}</h3>
                  </div>
                  <div className="details-grid">
                    <div className="detail-item">
                      <CalendarClock size={16} />
                      <span>{new Date(booking.startTime).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>{new Date(booking.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                  <div className="purpose-box">
                    <p>{booking.purpose}</p>
                  </div>
                </div>

                <div className="card-actions">
                  {booking.status === 'PENDING' ? (
                    <div className="action-wrapper">
                      {rejectingId === booking.id ? (
                        <div className="rejection-form">
                          <textarea 
                            placeholder="Type rejection reason..." 
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            autoFocus
                          />
                          <div className="rejection-actions">
                             <button className="confirm-reject-btn" onClick={() => handleStatusUpdate(booking.id, 'REJECTED', reason)}>
                               Reject Booking
                             </button>
                             <button className="cancel-reject-btn" onClick={() => { setRejectingId(null); setReason(''); }}>
                               Cancel
                             </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <button className="approve-btn" onClick={() => handleStatusUpdate(booking.id, 'APPROVED')}>
                            <CheckCircle size={18} /> Approve
                          </button>
                          <button className="reject-btn" onClick={() => setRejectingId(booking.id)}>
                            <XCircle size={18} /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  ) : (
                    <button className="status-change-btn" onClick={() => handleStatusUpdate(booking.id, 'PENDING')}>
                      Reset to Pending
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style jsx="true">{`
        .admin-bookings-page {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
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
        
        .admin-bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .admin-booking-card {
          padding: 24px;
          background: white;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 5px;
        }
        .user-info { display: flex; align-items: center; gap: 12px; }
        .avatar-small {
          width: 36px;
          height: 36px;
          background: #6366f1;
          color: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .user-details { display: flex; flex-direction: column; }
        .user-name { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
        .user-email { font-size: 0.75rem; color: #64748b; }

        .status-pill { padding: 4px 10px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; }
        .status-pill.pending { background: #fef3c7; color: #d97706; }
        .status-pill.approved { background: #dcfce7; color: #16a34a; }
        .status-pill.rejected { background: #fee2e2; color: #ef4444; }

        .resource-info { display: flex; align-items: center; gap: 10px; color: #1e293b; margin-bottom: 5px; }
        .resource-info h3 { font-size: 1.2rem; font-weight: 700; }
        
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .detail-item { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 0.85rem; }
        .detail-item :global(svg) { color: #6366f1; }

        .purpose-box { background: #f8fafc; padding: 12px; border-radius: 12px; font-size: 0.85rem; color: #475569; min-height: 60px; }

        .card-actions { display: flex; gap: 10px; margin-top: 5px; }
        .approve-btn, .reject-btn, .status-change-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.2s;
          font-size: 0.9rem;
        }
        .approve-btn { background: #16a34a; color: white; }
        .approve-btn:hover { background: #15803d; transform: translateY(-2px); }
        .reject-btn { background: #f1f5f9; color: #ef4444; border: 1px solid #fee2e2; }
        .reject-btn:hover { background: #fee2e2; transform: translateY(-2px); }
        .status-change-btn { background: #f1f5f9; color: #64748b; font-size: 0.8rem; }
        .status-change-btn:hover { background: #e2e8f0; }

        .action-wrapper { width: 100%; display: flex; gap: 10px; }
        .rejection-form { width: 100%; display: flex; flex-direction: column; gap: 10px; }
        .rejection-form textarea {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #fee2e2;
          background: #fef2f2;
          font-family: inherit;
          font-size: 0.9rem;
          outline: none;
        }
        .rejection-actions { display: flex; gap: 10px; }
        .confirm-reject-btn {
          flex: 2;
          background: #ef4444;
          color: white;
          padding: 10px;
          border-radius: 10px;
          font-weight: 600;
        }
        .cancel-reject-btn {
          flex: 1;
          background: #f1f5f9;
          color: #64748b;
          padding: 10px;
          border-radius: 10px;
          font-weight: 600;
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminBookings;

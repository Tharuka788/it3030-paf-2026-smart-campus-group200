import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { bookingService } from '../services/api';
import { motion } from 'framer-motion';
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

  const handleStatusUpdate = async (id, status) => {
    try {
      await bookingService.updateStatus(id, status);
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
          <div className="admin-loader">Loading bookings...</div>
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
                    <User size={16} />
                    <span>{booking.userName}</span>
                  </div>
                  <span className={`status-pill ${booking.status.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </div>

                <div className="card-body">
                  <div className="resource-info">
                    <MapPin size={18} />
                    <h3>{booking.resourceId}</h3>
                  </div>
                  <div className="time-info">
                    <Clock size={16} />
                    <span>{new Date(booking.startTime).toLocaleString()}</span>
                  </div>
                  <div className="purpose-info">
                    <p>{booking.purpose}</p>
                  </div>
                </div>

                <div className="card-actions">
                  {booking.status === 'PENDING' && (
                    <>
                      <button className="approve-btn" onClick={() => handleStatusUpdate(booking.id, 'APPROVED')}>
                        <CheckCircle size={18} /> Approve
                      </button>
                      <button className="reject-btn" onClick={() => handleStatusUpdate(booking.id, 'REJECTED')}>
                        <XCircle size={18} /> Reject
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
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
        }
        .user-info { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 0.85rem; }
        .status-pill { padding: 4px 10px; border-radius: 50px; font-size: 0.75rem; font-weight: 700; }
        .status-pill.pending { background: #fef3c7; color: #d97706; }
        .status-pill.approved { background: #dcfce7; color: #16a34a; }
        .status-pill.rejected { background: #fee2e2; color: #ef4444; }

        .resource-info { display: flex; align-items: center; gap: 10px; color: #1e293b; }
        .resource-info h3 { font-size: 1.1rem; font-weight: 600; }
        .time-info { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 0.9rem; }
        .purpose-info { background: #f8fafc; padding: 10px; border-radius: 10px; font-size: 0.85rem; color: #475569; }

        .card-actions { display: flex; gap: 10px; margin-top: 10px; }
        .approve-btn, .reject-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .approve-btn { background: #16a34a; color: white; }
        .approve-btn:hover { background: #15803d; }
        .reject-btn { background: #f1f5f9; color: #ef4444; border: 1px solid #fee2e2; }
        .reject-btn:hover { background: #fee2e2; }
      `}</style>
    </AdminLayout>
  );
};

export default AdminBookings;

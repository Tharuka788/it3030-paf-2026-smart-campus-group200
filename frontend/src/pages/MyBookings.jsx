import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Clock, 
  Trash2, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { bookingService } from '../services/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    b.resourceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return '#10b981';
      case 'PENDING': return '#f59e0b';
      case 'REJECTED': return '#ef4444';
      default: return '#94a3b8';
    }
  };

  return (
    <Layout>
      <div className="bookings-container">
        <header className="page-header">
           <h1 className="gradient-text">My Bookings</h1>
           <p>Manage and track your resource requests.</p>
        </header>

        <section className="controls glass-morphism">
          <div className="search-box">
             <Search size={20} className="search-icon" />
             <input 
               type="text" 
               placeholder="Search by room or purpose..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
          </div>
          <button className="filter-btn">
             <Filter size={20} />
             <span>Filter</span>
          </button>
        </section>

        <section className="bookings-list">
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
                       <span className="room-name"><MapPin size={16} /> {booking.resourceId}</span>
                       <span className="status-badge" style={{ backgroundColor: `${getStatusColor(booking.status)}15`, color: getStatusColor(booking.status) }}>
                          {booking.status}
                       </span>
                    </div>

                    <div className="card-body">
                       <h4>{booking.purpose}</h4>
                       <div className="time-info">
                          <p><Calendar size={14} /> {new Date(booking.startTime).toLocaleDateString()}</p>
                          <p><Clock size={14} /> {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                       </div>
                    </div>

                    <div className="card-footer">
                       <button className="details-btn">
                          View Details <ChevronRight size={16} />
                       </button>
                       <button className="delete-btn" onClick={() => handleDelete(booking.id)}>
                          <Trash2 size={18} />
                       </button>
                    </div>
                 </motion.div>
               ))}
             </div>
           )}
        </section>
      </div>

      <style jsx>{`
        .bookings-container {
          display: flex;
          flex-direction: column;
          gap: 30px;
          padding-bottom: 50px;
        }

        .page-header h1 {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 5px;
        }

        .page-header p {
          color: var(--text-muted);
        }

        .controls {
          padding: 15px 25px;
          display: flex;
          gap: 20px;
          border-radius: 14px;
        }

        .search-box {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 15px;
          color: var(--text-muted);
        }

        .search-box input {
          width: 100%;
          padding: 12px 12px 12px 50px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          color: white;
          font-family: inherit;
          transition: all 0.3s;
        }

        .search-box input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--primary);
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 25px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          color: var(--text-main);
          font-weight: 500;
          transition: all 0.3s;
        }

        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .bookings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 25px;
        }

        .booking-card {
          padding: 25px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          border-radius: 18px;
          transition: all 0.3s;
        }

        .booking-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.5);
          border-color: rgba(99, 102, 241, 0.3);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .room-name {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--primary);
          background: rgba(99, 102, 241, 0.1);
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .status-badge {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        .card-body h4 {
          font-size: 1.15rem;
          margin-bottom: 12px;
          color: var(--text-main);
        }

        .time-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: var(--text-muted);
          font-size: 0.9rem;
        }

        .time-info p {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .card-footer {
          margin-top: auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }

        .details-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--text-muted);
          transition: color 0.3s;
        }

        .details-btn:hover {
          color: var(--primary);
        }

        .delete-btn {
          padding: 8px;
          color: #ef4444;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .delete-btn:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .empty-state {
          padding: 100px 40px;
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .empty-state h3 { font-size: 1.5rem; }
        .empty-state p { color: var(--text-muted); }
      `}</style>
    </Layout>
  );
};

export default MyBookings;

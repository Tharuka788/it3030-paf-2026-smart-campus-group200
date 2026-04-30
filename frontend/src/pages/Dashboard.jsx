import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicLayout from '../components/DynamicLayout';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { bookingService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
          const response = await bookingService.getBookingsByUser(userEmail);
          setBookings(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const stats = [
    { 
      name: 'Total Bookings', 
      value: bookings.length.toString(), 
      icon: <Clock size={24} />, 
      color: '#6366f1' 
    },
    { 
      name: 'Approved', 
      value: bookings.filter(b => b.status === 'APPROVED').length.toString(), 
      icon: <CheckCircle size={24} />, 
      color: '#10b981' 
    },
    { 
      name: 'Pending', 
      value: bookings.filter(b => b.status === 'PENDING').length.toString(), 
      icon: <Clock size={24} />, 
      color: '#f59e0b' 
    },
    { 
      name: 'Rejected', 
      value: bookings.filter(b => b.status === 'REJECTED').length.toString(), 
      icon: <XCircle size={24} />, 
      color: '#ef4444' 
    },
  ];

  return (
    <DynamicLayout>
      <div className="dashboard-content">
        <section className="stats-grid">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.name}
              className="stat-card glass-morphism"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                {stat.icon}
              </div>
              <div className="stat-info">
                <h3>{stat.name}</h3>
                <p className="stat-value">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </section>

        <section className="recent-activity">
           <div className="section-header">
             <h3 className="section-title">Recent Bookings</h3>
             <button className="view-all-btn">
               View All <ArrowUpRight size={16} />
             </button>
           </div>

           <div className="activity-list glass-morphism">
              {loading ? (
                <LoadingSpinner />
              ) : bookings.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent bookings found.</div>
              ) : (
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Room</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id}>
                        <td><span className="room-badge">{booking.resourceId}</span></td>
                        <td>{new Date(booking.startTime).toLocaleDateString()}</td>
                        <td>
                          {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                          {new Date(booking.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <span className={`status-pill ${booking.status.toLowerCase()}`}>
                            {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td>
                          <button className="action-btn" onClick={() => navigate('/bookings/my')}>Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
           </div>
        </section>

        <motion.button 
          className="fab-btn"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus size={28} />
        </motion.button>
      </div>

      <style jsx="true">{`
        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 20px;
        }

        .stat-card {
          padding: 25px;
          display: flex;
          align-items: center;
          gap: 20px;
          border-radius: 16px;
        }

        .stat-icon {
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
        }

        .stat-info h3 {
          font-size: 0.95rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-main);
          margin-top: 5px;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
        }

        .view-all-btn {
          color: var(--primary);
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: transform 0.3s;
        }

        .view-all-btn:hover {
          transform: translateX(5px);
        }

        .activity-list {
          padding: 20px;
          min-height: 300px;
        }

        .activity-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .activity-table th {
          padding: 15px;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 500;
          border-bottom: 1px solid var(--glass-border);
        }

        .activity-table td {
          padding: 20px 15px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .room-badge {
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          padding: 5px 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .status-pill {
          padding: 5px 12px;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-pill.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-pill.approved { background: rgba(16, 185, 129, 0.1); color: #10b981; }

        .action-btn {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-main);
          padding: 6px 15px;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .action-btn:hover {
          background: var(--primary);
        }

        .fab-btn {
          position: fixed;
          bottom: 40px;
          right: 40px;
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
          color: white;
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
      `}</style>
    </DynamicLayout>
  );
};

export default Dashboard;

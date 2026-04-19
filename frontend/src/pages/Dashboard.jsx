import React from 'react';
import Layout from '../components/Layout';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const stats = [
    { name: 'Total Bookings', value: '12', icon: <Clock size={24} />, color: '#6366f1' },
    { name: 'Approved', value: '8', icon: <CheckCircle size={24} />, color: '#10b981' },
    { name: 'Pending', value: '3', icon: <Clock size={24} />, color: '#f59e0b' },
    { name: 'Rejected', value: '1', icon: <XCircle size={24} />, color: '#ef4444' },
  ];

  return (
    <Layout>
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
                  {[1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td><span className="room-badge">Room 30{i}</span></td>
                      <td>Oct {12 + i}, 2023</td>
                      <td>10:00 AM - 12:00 PM</td>
                      <td>
                        <span className={`status-pill ${i === 1 ? 'pending' : 'approved'}`}>
                          {i === 1 ? 'Pending' : 'Approved'}
                        </span>
                      </td>
                      <td>
                        <button className="action-btn">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    </Layout>
  );
};

export default Dashboard;

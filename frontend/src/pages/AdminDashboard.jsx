import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { motion } from 'framer-motion';
import { 
  Users, 
  Building2, 
  CalendarCheck, 
  ShieldAlert,
  ArrowUpRight,
  Activity,
  BarChart3
} from 'lucide-react';
import { facilityService, bookingService } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFacilities: 0,
    activeBookings: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        // In a real app, these would be dedicated admin stat endpoints
        // For now, we'll derive some from existing services
        const [facilitiesRes, bookingsRes] = await Promise.all([
          facilityService.getAllFacilities(),
          bookingService.getAllBookings()
        ]);

        setStats({
          totalUsers: 124, // Mocked for now
          totalFacilities: facilitiesRes.data.length,
          activeBookings: bookingsRes.data.filter(b => b.status === 'APPROVED').length,
          pendingApprovals: bookingsRes.data.filter(b => b.status === 'PENDING').length
        });
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const statCards = [
    { name: 'Total Users', value: stats.totalUsers, icon: <Users size={24} />, color: '#6366f1' },
    { name: 'Facilities', value: stats.totalFacilities, icon: <Building2 size={24} />, color: '#10b981' },
    { name: 'Approved Bookings', value: stats.activeBookings, icon: <CalendarCheck size={24} />, color: '#0ea5e9' },
    { name: 'Pending Requests', value: stats.pendingApprovals, icon: <ShieldAlert size={24} />, color: '#f59e0b' },
  ];

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <header className="dashboard-header">
          <div className="header-text">
            <h1 className="gradient-text">Admin Command Center</h1>
            <p>System-wide overview and infrastructure management.</p>
          </div>
          <div className="system-status">
            <Activity size={18} className="pulse" />
            <span>System Online</span>
          </div>
        </header>

        <section className="stats-grid">
          {statCards.map((stat, index) => (
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
              <div className="stat-content">
                <h3>{stat.name}</h3>
                <div className="value-row">
                  <span className="stat-value">{stat.value}</span>
                  <span className="trend-up">+12%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        <div className="dashboard-grid">
          <section className="main-panel glass-morphism">
            <div className="panel-header">
              <div className="panel-title">
                <BarChart3 size={20} />
                <h3>Recent System Activity</h3>
              </div>
              <button className="text-btn">View Detailed Logs <ArrowUpRight size={16} /></button>
            </div>
            
            <div className="placeholder-content">
              <div className="empty-state">
                <Activity size={48} />
                <h4>No critical alerts today</h4>
                <p>Infrastructure is running smoothly across all campuses.</p>
              </div>
            </div>
          </section>

          <aside className="side-panel glass-morphism">
             <h3>Quick Actions</h3>
             <div className="action-list">
               <button className="action-item" onClick={() => navigate('/admin/facilities')}>
                 <Building2 size={18} /> Add New Facility
               </button>
               <button className="action-item" onClick={() => navigate('/admin/users')}>
                 <Users size={18} /> Manage Permissions
               </button>
               <button className="action-item">
                 <ShieldAlert size={18} /> Security Audit
               </button>
             </div>
          </aside>
        </div>
      </div>

      <style jsx>{`
        .admin-dashboard {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .header-text h1 {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .header-text p {
          color: #64748b;
          font-size: 1.1rem;
        }

        .system-status {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f0fdf4;
          color: #16a34a;
          padding: 8px 16px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.85rem;
          border: 1px solid #bcf0da;
        }

        .pulse {
          animation: pulse-animation 2s infinite;
        }

        @keyframes pulse-animation {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 25px;
        }

        .stat-card {
          padding: 24px;
          display: flex;
          align-items: flex-start;
          gap: 18px;
          border-radius: 20px;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content h3 {
          font-size: 0.9rem;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .value-row {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 800;
          color: #1e293b;
        }

        .trend-up {
          color: #16a34a;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 30px;
        }

        .main-panel, .side-panel {
          padding: 30px;
          border-radius: 24px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #6366f1;
        }

        .panel-title h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e293b;
        }

        .text-btn {
          color: #6366f1;
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .placeholder-content {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border-radius: 16px;
          border: 2px dashed #e2e8f0;
        }

        .empty-state {
          text-align: center;
          color: #94a3b8;
        }

        .empty-state h4 {
          color: #1e293b;
          margin: 15px 0 5px;
        }

        .side-panel h3 {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 25px;
        }

        .action-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .action-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          color: #475569;
          font-weight: 600;
          transition: all 0.3s;
        }

        .action-item:hover {
          border-color: #6366f1;
          color: #6366f1;
          background: #f5f3ff;
          transform: translateY(-2px);
        }

        @media (max-width: 1000px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminDashboard;

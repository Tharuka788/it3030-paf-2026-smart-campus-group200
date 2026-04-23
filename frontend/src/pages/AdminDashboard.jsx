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
  BarChart3,
  Ticket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { facilityService, bookingService, ticketService } from '../services/api';
import { Ticket as TicketIcon } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  LabelList
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFacilities: 0,
    activeBookings: 0,
    pendingApprovals: 0,
    totalTickets: 0,
    activeTickets: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const [facilitiesRes, bookingsRes, ticketsRes] = await Promise.all([
          facilityService.getAllFacilities(),
          bookingService.getAllBookings(),
          ticketService.getAllTickets()
        ]);

        setStats({
          totalUsers: 124, 
          totalFacilities: facilitiesRes.data.length,
          activeBookings: bookingsRes.data.filter(b => b.status === 'APPROVED').length,
          pendingApprovals: bookingsRes.data.filter(b => b.status === 'PENDING').length,
          totalTickets: ticketsRes.data.length,
          activeTickets: ticketsRes.data.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
        });

        // Sort by update time and take latest 5
        const sortedBookings = [...bookingsRes.data].sort((a, b) => 
          new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
        ).slice(0, 5);
        
        const sortedTickets = [...ticketsRes.data].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 5);

        setRecentBookings(sortedBookings);
        setRecentTickets(sortedTickets);
        setFacilities(facilitiesRes.data);

      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  const processAnalytics = () => {
    // Status Distribution
    const statusData = [
      { name: 'Approved', value: stats.activeBookings, color: '#10b981' },
      { name: 'Pending', value: stats.pendingApprovals, color: '#f59e0b' },
      { name: 'Rejected', value: recentBookings.filter(b => b.status === 'REJECTED').length, color: '#ef4444' },
    ].filter(d => d.value > 0);

    // Facility Status/Health Breakdown
    const facilityStatusData = [
      { name: 'Available', value: facilities.filter(f => f.status === 'ACTIVE' || f.status === 'IN_STOCK').length, color: '#10b981' },
      { name: 'Maintenance', value: facilities.filter(f => f.status === 'MAINTENANCE').length, color: '#6366f1' },
      { name: 'Out of Stock', value: facilities.filter(f => f.status === 'OUT_OF_STOCK').length, color: '#f59e0b' },
      { name: 'Unavailable', value: facilities.filter(f => f.status === 'OUT_OF_SERVICE').length, color: '#ef4444' },
    ].filter(d => d.value > 0);

    return { statusData, facilityStatusData };
  };

  const { statusData, facilityStatusData } = processAnalytics();

  const statCards = [
    { name: 'Total Users', value: stats.totalUsers, icon: <Users size={24} />, color: '#6366f1' },
    { name: 'Facilities', value: stats.totalFacilities, icon: <Building2 size={24} />, color: '#10b981' },
    { name: 'Approved Bookings', value: stats.activeBookings, icon: <CalendarCheck size={24} />, color: '#0ea5e9' },
    { name: 'Support Tickets', value: stats.totalTickets, icon: <TicketIcon size={24} />, color: '#f59e0b' },
    { name: 'Active Issues', value: stats.activeTickets, icon: <ShieldAlert size={24} />, color: '#ef4444' },
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

        <section className="analytics-section">
          <div className="section-header">
            <h2 className="section-title">Booking Analytics</h2>
            <p>System performance and usage trends.</p>
          </div>
          
          <div className="analytics-grid">
            <motion.div 
              className="chart-card glass-morphism"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="chart-header">
                <h4>Booking Distribution</h4>
                <p>Status breakdown of all requests</p>
              </div>
              <div className="chart-body" style={{ height: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                {statusData.map(item => (
                  <div key={item.name} className="legend-item">
                    <span className="dot" style={{ backgroundColor: item.color }}></span>
                    <span className="label">{item.name}</span>
                    <span className="val">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              className="chart-card glass-morphism"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="chart-header">
                <h4>Facility Health</h4>
                <p>Status breakdown of campus resources</p>
              </div>
              <div className="chart-body" style={{ height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={facilityStatusData} layout="vertical" margin={{ left: 20, right: 30 }}>
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                      width={100}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[0, 10, 10, 0]}
                      barSize={30}
                    >
                      {facilityStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                      <LabelList dataKey="value" position="right" fill="#64748b" fontSize={12} fontWeight={700} offset={10} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="main-panel glass-morphism">
            <div className="panel-header">
              <div className="panel-title">
                <BarChart3 size={20} />
                <h3>Recent Bookings</h3>
              </div>
              <button className="text-btn" onClick={() => navigate('/admin/bookings')}>
                Manage All <ArrowUpRight size={16} />
              </button>
            </div>
            
            <div className="bookings-table-container">
              {loading ? (
                <div className="table-loader">
                  <LoadingSpinner />
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="empty-state">
                  <Activity size={48} />
                  <h4>No bookings yet</h4>
                  <p>All resource schedules are currently empty.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Resource</th>
                      <th>Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>
                          <div className="user-cell">
                            <span className="u-name">{booking.userName}</span>
                            <span className="u-email">{booking.userEmail}</span>
                          </div>
                        </td>
                        <td><span className="res-tag">{booking.resourceName || booking.resourceId}</span></td>
                        <td>{new Date(booking.startTime).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-pill-small ${(booking.status || 'PENDING').toLowerCase()}`}>
                            {booking.status || 'PENDING'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
                <button className="action-item" onClick={() => navigate('/admin/tickets')}>
                  <Ticket size={18} /> Support Queue
                </button>
                <button className="action-item">
                  <ShieldAlert size={18} /> Security Audit
                </button>
              </div>
           </aside>
        </div>

        <div className="dashboard-grid mt-30">
          <section className="main-panel glass-morphism">
            <div className="panel-header">
              <div className="panel-title">
                <Ticket size={20} />
                <h3>Recent Support Tickets</h3>
              </div>
              <button className="text-btn" onClick={() => navigate('/admin/tickets')}>
                View All Queue <ArrowUpRight size={16} />
              </button>
            </div>

            <div className="bookings-table-container">
              {loading ? (
                <div className="table-loader">
                  <LoadingSpinner />
                </div>
              ) : recentTickets.length === 0 ? (
                <div className="empty-state">
                  <Ticket size={48} />
                  <h4>No active tickets</h4>
                  <p>System is running smoothly without reported issues.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTickets.map((ticket) => (
                      <tr key={ticket.id} onClick={() => navigate('/admin/tickets')} style={{ cursor: 'pointer' }}>
                        <td>
                          <div className="user-cell">
                            <span className="u-name">{ticket.subject}</span>
                            <span className="u-email">From: {ticket.userName}</span>
                          </div>
                        </td>
                        <td><span className="res-tag">{ticket.category}</span></td>
                        <td>
                          <span className={`priority-text priority-${ticket.priority?.toLowerCase()}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`status-pill-small ${(ticket.status || 'OPEN').toLowerCase()}`}>
                            {ticket.status?.replace('_', ' ') || 'OPEN'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>

      <style jsx="true">{`
        .admin-dashboard {
          display: flex;
          flex-direction: column;
          gap: 30px;
          padding-bottom: 50px;
        }

        .mt-30 { margin-top: 30px; }

        .priority-text { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
        .priority-high { color: #ef4444; }
        .priority-medium { color: #f59e0b; }
        .priority-low { color: #10b981; }

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

        .text-btn:hover { color: var(--primary-hover); }
        
        .bookings-table-container {
          min-height: 300px;
        }

        .admin-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0 10px;
        }

        .admin-table th {
          text-align: left;
          padding: 10px 15px;
          color: #94a3b8;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
        }

        .admin-table td {
          padding: 15px;
          background: #f8fafc;
          border-top: 1px solid #f1f5f9;
          border-bottom: 1px solid #f1f5f9;
        }

        .admin-table td:first-child { border-left: 1px solid #f1f5f9; border-radius: 12px 0 0 12px; }
        .admin-table td:last-child { border-right: 1px solid #f1f5f9; border-radius: 0 12px 12px 0; }

        .user-cell { display: flex; flex-direction: column; }
        .u-name { font-weight: 600; color: #1e293b; font-size: 0.95rem; }
        .u-email { font-size: 0.75rem; color: #64748b; }

        .res-tag {
          background: #e0f2fe;
          color: #0369a1;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-pill-small {
          padding: 4px 10px;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-pill-small.pending { background: #fef3c7; color: #d97706; }
        .status-pill-small.approved { background: #dcfce7; color: #16a34a; }
        .status-pill-small.rejected { background: #fee2e2; color: #ef4444; }

        .table-loader {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          color: #94a3b8;
          padding: 40px 0;
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

        .analytics-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }

        .chart-card {
          padding: 25px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .chart-header h4 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .chart-header p {
          font-size: 0.85rem;
          color: #64748b;
        }

        .chart-legend {
          display: flex;
          justify-content: space-around;
          margin-top: 10px;
        }

        .legend-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .legend-item .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-item .label {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 600;
        }

        .legend-item .val {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1e293b;
        }

        @media (max-width: 1200px) {
          .analytics-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 1000px) {
          .dashboard-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminDashboard;

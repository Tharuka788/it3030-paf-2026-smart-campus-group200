import React, { useState, useEffect } from 'react';
import TechnicianLayout from '../components/TechnicianLayout';
import { motion } from 'framer-motion';
import { 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowUpRight,
  Activity,
  ClipboardList,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { facilityService, ticketService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const TechnicianDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pendingTickets: 0,
    inProgress: 0,
    completedToday: 0,
    criticalAlerts: 0,
    maintenanceFacilities: 0,
    totalFacilities: 0
  });
  const [activeTasks, setActiveTasks] = useState([]);
  const [maintenanceResources, setMaintenanceResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTechStats = async () => {
    try {
      // Fetch facilities to calculate health
      const { data: facilities } = await facilityService.getAllFacilities();
      const inMaintenance = facilities.filter(f => f.status === 'MAINTENANCE');
      setMaintenanceResources(inMaintenance);

      setStats({
        pendingTickets: 8,
        inProgress: 3,
        completedToday: 5,
        criticalAlerts: 2,
        maintenanceFacilities: inMaintenance.length,
        totalFacilities: facilities.length
      });

      // Mock active tasks
      setActiveTasks([
        { id: '1', title: 'AC Repair - Lab 01', priority: 'CRITICAL', status: 'IN_PROGRESS', location: 'Computing Block' },
        { id: '2', title: 'Projector Maintenance', priority: 'HIGH', status: 'PENDING', location: 'Hall A' },
        { id: '3', title: 'Network Socket Fix', priority: 'MEDIUM', status: 'PENDING', location: 'Library' },
        { id: '4', title: 'Light Replacement', priority: 'LOW', status: 'COMPLETED', location: 'Cafeteria' },
      ]);

    } catch (error) {
      console.error('Failed to update facility stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechStats();
  }, []);

  const handleRestore = async (facility) => {
    try {
      setLoading(true);
      await facilityService.updateFacility(facility.id, {
        status: 'ACTIVE'
      });
      showToast('Facility restored to active status!');
      fetchTechStats();
    } catch (err) {
      console.error('Failed to restore facility:', err);
      showToast('Error: Could not restore facility.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Active Tasks', value: stats.inProgress + stats.pendingTickets, icon: <Clock size={24} />, color: '#6366f1' },
    { name: 'Operational Health', value: `${stats.totalFacilities - stats.maintenanceFacilities}/${stats.totalFacilities}`, icon: <Activity size={24} />, color: '#10b981' },
    { name: 'In Maintenance', value: stats.maintenanceFacilities, icon: <AlertTriangle size={24} />, color: '#f59e0b' },
    { name: 'Critical Alerts', value: stats.criticalAlerts, icon: <Wrench size={24} />, color: '#ef4444' },
  ];

  return (
    <TechnicianLayout>
      <div className="tech-dashboard">
        <header className="dashboard-header">
          <div className="header-text">
            <h1 className="gradient-text">Technician Overview</h1>
            <p>Monitor facility health and manage maintenance requests.</p>
          </div>
          <div className="tech-status">
            <Wrench size={18} className="spin-slow" />
            <span>On Duty</span>
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
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        <div className="dashboard-grid">
          <section className="main-panel glass-morphism">
            <div className="panel-header">
              <div className="panel-title">
                <ClipboardList size={20} />
                <h3>Assigned Tasks</h3>
              </div>
              <button className="text-btn" onClick={() => navigate('/admin/tickets')}>
                View All <ArrowUpRight size={16} />
              </button>
            </div>
            
            <div className="tasks-container">
              {loading ? (
                <LoadingSpinner />
              ) : activeTasks.length === 0 ? (
                <div className="empty-state">
                  <h4>Clear Workspace!</h4>
                  <p>No maintenance tasks assigned to you right now.</p>
                </div>
              ) : (
                <div className="task-list">
                  {activeTasks.map((task) => (
                    <div key={task.id} className="task-item">
                      <div className="task-info">
                        <span className={`priority-indicator ${task.priority.toLowerCase()}`}></span>
                        <div className="task-details">
                          <h4>{task.title}</h4>
                          <span className="task-loc">{task.location}</span>
                        </div>
                      </div>
                      <div className="task-meta">
                        <span className={`status-tag ${task.status.toLowerCase()}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                        <button className="action-btn">Update</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="main-panel glass-morphism secondary">
            <div className="panel-header">
              <div className="panel-title">
                <AlertTriangle size={20} color="#f59e0b" />
                <h3>Quick Restore Queue</h3>
              </div>
              <span className="badge-count">{maintenanceResources.length} Resources Offline</span>
            </div>

            <div className="maintenance-list">
              {maintenanceResources.length === 0 ? (
                <div className="empty-state mini">
                  <CheckCircle size={32} color="#10b981" />
                  <p>All facilities are currently operational.</p>
                </div>
              ) : (
                maintenanceResources.map((fac) => (
                  <div key={fac.id} className="maintenance-item">
                    <div className="fac-info">
                      <div className="status-dot maintenance"></div>
                      <div>
                        <h4>{fac.name}</h4>
                        <p>{fac.location || 'Main Campus'}</p>
                      </div>
                    </div>
                    <button 
                      className="restore-btn"
                      onClick={() => handleRestore(fac)}
                    >
                      <CheckCircle size={14} /> Mark as Active
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>

          <aside className="side-panel glass-morphism">
             <h3>Maintenance Tools</h3>
             <div className="tool-list">
               <button className="tool-item">
                 <Wrench size={18} /> Diagnostics Tool
               </button>
               <button className="tool-item">
                 <ClipboardList size={18} /> Inventory Check
               </button>
               <button className="tool-item">
                 <AlertTriangle size={18} /> Report Outage
               </button>
             </div>
          </aside>
        </div>

        {/* Floating Toast Notification */}
        {toast && (
          <motion.div 
            className={`toast-notification ${toast.type}`}
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </div>

      <style jsx="true">{`
        .tech-dashboard {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .header-text h1 {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .tech-status {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ecfdf5;
          color: #059669;
          padding: 8px 16px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 0.85rem;
          border: 1px solid #a7f3d0;
        }

        .spin-slow {
          animation: spin 3s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 25px;
        }

        .stat-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 18px;
          border-radius: 20px;
        }

        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content h3 {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 1.6rem;
          font-weight: 800;
          color: #1e293b;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 30px;
          align-items: start;
        }

        .main-panel, .side-panel {
          padding: 30px;
          border-radius: 24px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .panel-title {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #10b981;
        }

        .panel-title h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
        }

        .task-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .task-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          transition: all 0.2s;
        }

        .task-item:hover {
          transform: translateX(5px);
          border-color: #10b981;
        }

        .task-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .priority-indicator {
          width: 4px;
          height: 35px;
          border-radius: 2px;
        }

        .priority-indicator.critical { background: #ef4444; }
        .priority-indicator.high { background: #f59e0b; }
        .priority-indicator.medium { background: #6366f1; }
        .priority-indicator.low { background: #94a3b8; }

        .task-details h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
        }

        .task-loc {
          font-size: 0.8rem;
          color: #64748b;
        }

        .task-meta {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .status-tag {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-tag.pending { background: #fef3c7; color: #d97706; }
        .status-tag.in_progress { background: #e0e7ff; color: #4338ca; }
        .status-tag.completed { background: #dcfce7; color: #15803d; }

        .action-btn {
          padding: 6px 12px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }

        .tool-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .tool-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          color: #475569;
          font-weight: 600;
          transition: all 0.2s;
          text-align: left;
        }

        .tool-item:hover {
          border-color: #10b981;
          color: #10b981;
          background: #f0fdf4;
        }

        .main-panel.secondary {
          margin-top: 30px;
          border-left: 4px solid #f59e0b;
        }

        .badge-count {
          padding: 4px 12px;
          background: #fffbeb;
          color: #d97706;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .maintenance-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .maintenance-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          background: white;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
        }

        .fac-info {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .status-dot.maintenance {
          width: 8px;
          height: 8px;
          background: #f59e0b;
          border-radius: 50%;
          box-shadow: 0 0 0 4px #fffbeb;
        }

        .fac-info h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .fac-info p {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
        }

        .restore-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #dcfce7;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 700;
          transition: all 0.2s;
        }

        .restore-btn:hover {
          background: #16a34a;
          color: white;
          transform: translateY(-2px);
        }

        .empty-state.mini {
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .empty-state.mini p {
          font-size: 0.9rem;
          font-weight: 600;
          color: #64748b;
        }

        .toast-notification {
          position: fixed;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          border-radius: 50px;
          background: #1e293b;
          color: white;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          z-index: 1000;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .toast-notification.success {
          border-left: 4px solid #10b981;
        }

        .toast-notification.error {
          border-left: 4px solid #ef4444;
        }
      `}</style>
    </TechnicianLayout>
  );
};

export default TechnicianDashboard;

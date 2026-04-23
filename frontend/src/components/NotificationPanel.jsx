import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Info, AlertTriangle, MessageSquare, Trash2 } from 'lucide-react';
import { notificationService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const userEmail = localStorage.getItem('userEmail');

  const fetchNotifications = async () => {
    if (!userEmail) return;
    try {
      const response = await notificationService.getNotifications(userEmail);
      setNotifications(response.data);
      setUnreadCount(response.data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [userEmail]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userEmail);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'BOOKING': return <Info size={18} className="icon-blue" />;
      case 'TICKET': return <MessageSquare size={18} className="icon-purple" />;
      case 'SYSTEM': return <AlertTriangle size={18} className="icon-yellow" />;
      default: return <Info size={18} />;
    }
  };

  return (
    <div className="notification-container">
      <div className="notification-trigger" onClick={() => setIsOpen(!isOpen)}>
        <Bell size={24} className={unreadCount > 0 ? 'bell-anim' : ''} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              className="notification-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              className="notification-panel glass-morphism"
              initial={{ opacity: 0, y: 10, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, x: 10, scale: 0.95 }}
            >
              <div className="panel-header">
                <h3>Notifications</h3>
                <div className="header-actions">
                   {unreadCount > 0 && (
                     <button onClick={handleMarkAllAsRead} className="mark-all-btn">Mark all as read</button>
                   )}
                   <button onClick={() => setIsOpen(false)} className="close-panel-btn"><X size={18} /></button>
                </div>
              </div>

              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="empty-notifications">
                    <Bell size={48} />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    >
                      <div className="notification-icon">
                        {getIcon(notification.type)}
                      </div>
                      <div className="notification-content">
                        <div className="notification-title-row">
                           <h4>{notification.title}</h4>
                           {!notification.read && <span className="unread-dot"></span>}
                        </div>
                        <p>{notification.message}</p>
                        <span className="notification-time">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx="true">{`
        .notification-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .notification-trigger {
          position: relative;
          cursor: pointer;
          color: #64748b;
          padding: 8px;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .notification-trigger:hover {
          background: #f1f5f9;
          color: #6366f1;
        }

        .notification-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          background: #ef4444;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 2px solid white;
        }

        .notification-panel {
          position: absolute;
          top: calc(100% + 15px);
          right: 0;
          width: 380px;
          max-height: 500px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          z-index: 10002;
          overflow: hidden;
        }

        .panel-header {
          padding: 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
        }

        .panel-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #1e293b;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mark-all-btn {
          font-size: 0.8rem;
          color: #6366f1;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
        }

        .close-panel-btn {
          color: #94a3b8;
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
        }

        .notification-list {
          overflow-y: auto;
          flex: 1;
        }

        .notification-item {
          padding: 16px 20px;
          display: flex;
          gap: 15px;
          border-bottom: 1px solid #f8fafc;
          cursor: pointer;
          transition: all 0.2s;
        }

        .notification-item:hover {
          background: #f8fafc;
        }

        .notification-item.unread {
          background: rgba(99, 102, 241, 0.03);
        }

        .notification-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .icon-blue { color: #3b82f6; }
        .icon-purple { color: #a855f7; }
        .icon-yellow { color: #f59e0b; }

        .notification-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .notification-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .notification-title-row h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1e293b;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          background: #6366f1;
          border-radius: 50%;
          margin-top: 5px;
        }

        .notification-content p {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.4;
        }

        .notification-time {
          font-size: 0.75rem;
          color: #94a3b8;
          margin-top: 4px;
        }

        .empty-notifications {
          padding: 60px 20px;
          text-align: center;
          color: #cbd5e1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .empty-notifications p {
          color: #94a3b8;
          font-weight: 500;
        }

        @keyframes bell-ring {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(15deg); }
          40% { transform: rotate(-15deg); }
          60% { transform: rotate(10deg); }
          80% { transform: rotate(-10deg); }
        }

        .bell-anim {
          animation: bell-ring 1s ease infinite;
          color: #f59e0b;
        }

        .notification-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10001;
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;

import React, { useState, useEffect } from 'react';
import { notificationService, bookingService, ticketService } from '../services/api';
import '../styles/NotificationPanel.css';

const NotificationPanel = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'bookings', 'tickets'

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const response = await notificationService.getNotifications(userId);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch user bookings
  const fetchBookings = async () => {
    if (!userId) return;
    try {
      const response = await bookingService.getBookingsByUser(userId);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  // Fetch user tickets
  const fetchTickets = async () => {
    if (!userId) return;
    try {
      const response = await ticketService.getTicketsByUser(userId);
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    if (!userId) return;
    try {
      const response = await notificationService.getUnreadCount(userId);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Fetch all data
  const fetchAll = async () => {
    if (!userId) return;
    setLoading(true);
    await Promise.all([fetchNotifications(), fetchBookings(), fetchTickets(), fetchUnreadCount()]);
    setLoading(false);
  };

  // Initial load and polling
  useEffect(() => {
    if (!userId) return;
    
    fetchAll();

    // Set up polling interval (every 30 seconds)
    const pollInterval = setInterval(() => {
      fetchAll();
    }, 30000);

    return () => clearInterval(pollInterval);
  }, [userId]);

  // Mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(
        notifications.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(
        notifications.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Format timestamp to relative time
  const formatTime = (datetime) => {
    if (!datetime) return '';
    const now = new Date();
    const created = new Date(datetime);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return created.toLocaleDateString();
  };

  // Format date for bookings
  const formatBookingDate = (datetime) => {
    if (!datetime) return '';
    const d = new Date(datetime);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatBookingTime = (datetime) => {
    if (!datetime) return '';
    const d = new Date(datetime);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BOOKING_CREATED':
        return '📋';
      case 'BOOKING_APPROVED':
        return '✅';
      case 'BOOKING_REJECTED':
        return '❌';
      case 'BOOKING_CANCELLED':
        return '🚫';
      case 'TICKET_CREATED':
        return '🎫';
      case 'TICKET_STATUS_CHANGED':
        return '🔄';
      case 'TICKET_COMMENTED':
        return '💬';
      case 'SYSTEM_ALERT':
        return '⚠️';
      default:
        return '🔔';
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      PENDING: { bg: '#fff3cd', color: '#856404', label: 'Pending' },
      APPROVED: { bg: '#d4edda', color: '#155724', label: 'Approved' },
      REJECTED: { bg: '#f8d7da', color: '#721c24', label: 'Rejected' },
      CANCELLED: { bg: '#e2e3e5', color: '#383d41', label: 'Cancelled' },
      OPEN: { bg: '#cce5ff', color: '#004085', label: 'Open' },
      IN_PROGRESS: { bg: '#fff3cd', color: '#856404', label: 'In Progress' },
      RESOLVED: { bg: '#d4edda', color: '#155724', label: 'Resolved' },
      CLOSED: { bg: '#e2e3e5', color: '#383d41', label: 'Closed' },
    };
    const style = statusStyles[status] || { bg: '#e2e3e5', color: '#383d41', label: status };
    return (
      <span className="status-badge" style={{ backgroundColor: style.bg, color: style.color }}>
        {style.label}
      </span>
    );
  };

  const totalCount = bookings.length + tickets.length;

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('.notification-panel-container')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="notification-panel-container">
      {/* Bell Icon Button */}
      <button
        className="notification-bell"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        🔔
        {(unreadCount > 0 || totalCount > 0) && (
          <span className="unread-badge">
            {unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : totalCount}
          </span>
        )}
      </button>

      {/* Notification Panel Dropdown */}
      {isOpen && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && activeTab === 'all' && (
              <button
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="notification-tabs">
            <button
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              🔔 Alerts
              {notifications.length > 0 && <span className="tab-count">{notifications.length}</span>}
            </button>
            <button
              className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              📋 Bookings
              {bookings.length > 0 && <span className="tab-count">{bookings.length}</span>}
            </button>
            <button
              className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
              onClick={() => setActiveTab('tickets')}
            >
              🎫 Tickets
              {tickets.length > 0 && <span className="tab-count">{tickets.length}</span>}
            </button>
          </div>

          <div className="notification-list">
            {loading && <p className="loading-text">Loading...</p>}

            {/* === ALL / NOTIFICATIONS TAB === */}
            {!loading && activeTab === 'all' && (
              <>
                {notifications.length === 0 && (
                  <p className="empty-text">No alerts yet</p>
                )}
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="notification-icon-wrapper">
                      {getNotificationIcon(notification.notificationType)}
                    </div>
                    
                    <div className="notification-content">
                      <p className="notification-title">{notification.title}</p>
                      <p className="notification-message">{notification.message}</p>
                      <p className="notification-time">{formatTime(notification.createdAt)}</p>
                    </div>

                    <button
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      title="Delete"
                    >
                      ✕
                    </button>

                    {!notification.read && <div className="unread-indicator"></div>}
                  </div>
                ))}
              </>
            )}

            {/* === BOOKINGS TAB === */}
            {!loading && activeTab === 'bookings' && (
              <>
                {bookings.length === 0 && (
                  <p className="empty-text">No bookings yet</p>
                )}
                {bookings.map(booking => (
                  <div key={booking.id} className="notification-item booking-item">
                    <div className="notification-icon-wrapper booking-icon">
                      📋
                    </div>
                    <div className="notification-content">
                      <div className="notification-title-row">
                        <p className="notification-title">{booking.resourceName || 'Resource Booking'}</p>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="notification-message">
                        {booking.purpose || 'No purpose specified'}
                      </p>
                      <p className="notification-meta">
                        📅 {formatBookingDate(booking.startTime)} &nbsp;
                        🕐 {formatBookingTime(booking.startTime)} - {formatBookingTime(booking.endTime)}
                      </p>
                      {booking.expectedAttendees && (
                        <p className="notification-meta">
                          👥 {booking.expectedAttendees} attendees
                        </p>
                      )}
                      <p className="notification-time">{formatTime(booking.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* === TICKETS TAB === */}
            {!loading && activeTab === 'tickets' && (
              <>
                {tickets.length === 0 && (
                  <p className="empty-text">No tickets yet</p>
                )}
                {tickets.map(ticket => (
                  <div key={ticket.id} className="notification-item ticket-item">
                    <div className="notification-icon-wrapper ticket-icon">
                      🎫
                    </div>
                    <div className="notification-content">
                      <div className="notification-title-row">
                        <p className="notification-title">{ticket.subject}</p>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="notification-message">{ticket.description}</p>
                      <p className="notification-meta">
                        📂 {ticket.category} &nbsp; | &nbsp;
                        🔥 {ticket.priority} priority
                      </p>
                      <p className="notification-time">{formatTime(ticket.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;

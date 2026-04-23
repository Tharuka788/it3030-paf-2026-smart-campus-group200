import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getAllBookings: () => api.get('/bookings'),
  getBookingsByUser: (email) => api.get(`/bookings/user/${email}`),
  getBookingsByResource: (resourceId) => api.get(`/bookings/resource/${resourceId}`),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status?status=${status}`),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
};

export const facilityService = {
  createFacility: (data) => api.post('/facilities', data),
  getAllFacilities: (params) => api.get('/facilities', { params }),
  getFacilityById: (id) => api.get(`/facilities/${id}`),
  updateFacility: (id, data) => api.put(`/facilities/${id}`, data),
  deleteFacility: (id) => api.delete(`/facilities/${id}`),
};

export const userService = {
  register: (data) => api.post('/users/register', data),
  login: (data) => api.post('/users/login', data),
  syncUser: (data) => api.post('/users/sync', data),
  getMe: (email) => api.get('/users/me', { params: { email } }),
};

export const ticketService = {
  createTicket: (data) => api.post('/tickets', data),
  getAllTickets: () => api.get('/tickets'),
  getTicketsByUser: (email) => api.get(`/tickets/user/${email}`),
  updateStatus: (id, status) => api.patch(`/tickets/${id}/status?status=${status}`),
};

export const notificationService = {
  getNotifications: (userId) => api.get('/notifications', { params: { userId } }),
  getUnreadCount: (userId) => api.get('/notifications/unread-count', { params: { userId } }),
  getUnreadNotifications: (userId) => api.get('/notifications/unread', { params: { userId } }),
  markAsRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllAsRead: (userId) => api.patch('/notifications/read-all', null, { params: { userId } }),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  deleteAllNotifications: (userId) => api.delete('/notifications', { params: { userId } }),
};

export default api;

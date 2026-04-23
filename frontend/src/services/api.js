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
  updateStatus: (id, status, reason) => {
    let url = `/bookings/${id}/status?status=${status}`;
    if (reason) url += `&reason=${encodeURIComponent(reason)}`;
    return api.patch(url);
  },
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
  getNotifications: (email) => api.get(`/notifications/user/${email}`),
  getUnreadCount: (email) => api.get(`/notifications/user/${email}/unread-count`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: (email) => api.patch(`/notifications/user/${email}/read-all`),
};

export default api;

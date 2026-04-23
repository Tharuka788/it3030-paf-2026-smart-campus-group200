import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
export const IMAGE_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const bookingService = {
  createBooking: (data) => api.post('/v1/bookings', data),
  getAllBookings: () => api.get('/v1/bookings'),
  getBookingsByUser: (email) => api.get(`/v1/bookings/user/${email}`),
  getBookingsByResource: (resourceId) => api.get(`/v1/bookings/resource/${resourceId}`),
  updateStatus: (id, status, reason) => {
    let url = `/v1/bookings/${id}/status?status=${status}`;
    if (reason) url += `&reason=${encodeURIComponent(reason)}`;
    return api.patch(url);
  },
  deleteBooking: (id) => api.delete(`/v1/bookings/${id}`),
};

export const facilityService = {
  createFacility: (data) => api.post('/v1/facilities', data),
  getAllFacilities: (params) => api.get('/v1/facilities', { params }),
  getFacilityById: (id) => api.get(`/v1/facilities/${id}`),
  updateFacility: (id, data) => api.put(`/v1/facilities/${id}`, data),
  deleteFacility: (id) => api.delete(`/v1/facilities/${id}`),
};

export const userService = {
  register: (data) => api.post('/v1/users/register', data),
  login: (data) => api.post('/v1/users/login', data),
  syncUser: (data) => api.post('/v1/users/sync', data),
  getMe: (email) => api.get('/v1/users/me', { params: { email } }),
};

export const ticketService = {
  createTicket: (formData) => api.post('/admin/tickets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAllTickets: () => api.get('/v1/tickets'),
  getTicketsByUser: (email) => api.get(`/v1/tickets/user/${email}`),
  updateStatus: (id, status, adminComments) => 
    api.patch(`/v1/tickets/${id}/status?status=${status}${adminComments ? `&adminComments=${encodeURIComponent(adminComments)}` : ''}`),
  deleteTicket: (id) => api.delete(`/v1/tickets/${id}`),
};

export const notificationService = {
  getNotifications: (email) => api.get(`/notifications/user/${email}`),
  getUnreadCount: (email) => api.get(`/notifications/user/${email}/unread-count`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: (email) => api.patch(`/notifications/user/${email}/read-all`),
};

export default api;

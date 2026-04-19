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

export default api;

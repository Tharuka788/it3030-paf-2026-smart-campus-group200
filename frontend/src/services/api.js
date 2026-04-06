import axios from "axios";
import { auth } from "./firebase";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    const idToken = await currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${idToken}`;
  }
  return config;
});

export const bookingService = {
  createBooking: (data) => api.post("/bookings", data),
  getAllBookings: () => api.get("/bookings"),
  getMyBookings: () => api.get("/bookings/user/me"),
  getBookingsByUser: (email) => api.get(`/bookings/user/${email}`),
  updateStatus: (id, status) =>
    api.patch(`/bookings/${id}/status?status=${status}`),
  deleteBooking: (id) => api.delete(`/bookings/${id}`),
};

export default api;

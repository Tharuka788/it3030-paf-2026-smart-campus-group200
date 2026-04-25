import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import DynamicLayout from '../components/DynamicLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, FileText, Send, AlertCircle, Info } from 'lucide-react';
import { bookingService, facilityService } from '../services/api';
import { format, parseISO, isSameDay, addDays } from 'date-fns';

const NewBooking = () => {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const urlResourceId = searchParams.get('resourceId');

  const [formData, setFormData] = useState({
    resourceId: '',
    resourceName: '',
    startTime: '',
    endTime: '',
    purpose: '',
    expectedAttendees: '',
    userEmail: localStorage.getItem('userEmail') || 'student@campus.edu',
    userName: localStorage.getItem('userName') || 'Campus Student',
  });

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const [fetchingAvailability, setFetchingAvailability] = useState(false);
  
  const minDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm");
  const maxDateTime = format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm");

  // Helper function to count words in the purpose field
  const countWords = (str) => {
    if (!str || str.trim() === '') return 0;
    return str.trim().split(/\s+/).length;
  };

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const { data } = await facilityService.getAllFacilities();
        setFacilities(data);
      } catch (err) {
        console.error('Failed to fetch facilities:', err);
      }
    };
    fetchFacilities();

    if (urlResourceId && !formData.resourceId) {
       setFormData(prev => ({ ...prev, resourceId: urlResourceId }));
    }
  }, [urlResourceId]);

  useEffect(() => {
    if (formData.resourceId) {
      fetchAvailability();
    }
  }, [formData.resourceId]);

  useEffect(() => {
    const checkResourceAndRedirect = async () => {
      if (urlResourceId) {
        try {
          const { data } = await facilityService.getFacilityById(urlResourceId);
          setFormData(prev => ({ ...prev, resourceName: data.name }));
          const type = data.type?.toUpperCase().replace(/[\s_]/g, '');
          if (type === 'LECTUREHALL') {
            navigate(`/bookings/hall?id=${urlResourceId}`);
          }
        } catch (err) {
          console.error('Failed to check resource type:', err);
        }
      }
    };
    checkResourceAndRedirect();
  }, [urlResourceId, navigate]);

  useEffect(() => {
    if (isEdit) {
      const fetchBookingData = async () => {
        setLoading(true);
        try {
          const { data } = await bookingService.getBookingById(id);
          setFormData({
            resourceId: data.resourceId,
            resourceName: data.resourceName,
            startTime: data.startTime,
            endTime: data.endTime,
            purpose: data.purpose,
            expectedAttendees: data.expectedAttendees,
            userEmail: data.userEmail,
            userName: data.userName,
          });
        } catch (err) {
          console.error('Failed to fetch booking:', err);
          setError('Failed to load booking details.');
        } finally {
          setLoading(false);
        }
      };
      fetchBookingData();
    }
  }, [id, isEdit]);

  const fetchAvailability = async () => {
    setFetchingAvailability(true);
    try {
      const response = await bookingService.getBookingsByResource(formData.resourceId);
      setExistingBookings(response.data);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
    } finally {
      setFetchingAvailability(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'resourceId') {
      const selected = facilities.find(f => f.id === value);
      setFormData({ 
        ...formData, 
        resourceId: value,
        resourceName: selected ? selected.name : '',
        location: selected ? selected.location : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const now = new Date();
    const nextWeek = addDays(now, 7);

    if (start < now) {
      setError("Cannot book a resource in the past.");
      setLoading(false);
      return;
    }

    if (start > nextWeek) {
      setError("Bookings can only be made up to 7 days in advance.");
      setLoading(false);
      return;
    }

    if (end <= start) {
      setError("End time must be after start time.");
      setLoading(false);
      return;
    }

    if (countWords(formData.purpose) > 100) {
      setError("Purpose must not exceed 100 words.");
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await bookingService.updateBooking(id, formData);
        setSuccess(true);
        setTimeout(() => navigate('/bookings/my'), 2000);
      } else {
        await bookingService.createBooking(formData);
        setSuccess(true);
        setFormData({
          ...formData,
          resourceId: '',
          startTime: '',
          endTime: '',
          purpose: '',
          expectedAttendees: '',
        });
        fetchAvailability();
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error('Booking failed:', err);
      const message = err.response?.data?.message || 'Failed to process booking. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getDayBookings = () => {
    if (!formData.startTime) return existingBookings.slice(0, 5);
    const selectedDate = parseISO(formData.startTime);
    return existingBookings.filter(b => isSameDay(parseISO(b.startTime), selectedDate));
  };

  return (
    <DynamicLayout>
      <div className="new-booking-container">
        <motion.div 
          className="form-card glass-morphism animate-fade-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="form-header">
            <h2 className="gradient-text">{isEdit ? 'Update Booking' : 'New Resource Booking'}</h2>
            <p>{isEdit ? 'Modify your existing resource reservation details.' : 'Request access to campus facilities and equipment with automated conflict checking.'}</p>
          </div>

          <div className="booking-grid">
            <form onSubmit={handleSubmit} className="booking-form">
              <div className="input-row">
                <div className="input-group">
                  <label><MapPin size={18} /> Booking Resources</label>
                  <select 
                    name="resourceId" 
                    value={formData.resourceId}
                    onChange={handleChange}
                    required 
                  >
                    <option value="" disabled>Select a resource</option>
                    {facilities.map(fac => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} ({fac.location || 'No Location'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label><Calendar size={18} /> Expected Attendees</label>
                  <input 
                    type="number" 
                    name="expectedAttendees" 
                    value={formData.expectedAttendees}
                    onChange={handleChange}
                    placeholder="e.g. 50" 
                    required 
                  />
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label><Calendar size={18} /> Start Date & Time</label>
                  <input 
                    type="datetime-local" 
                    name="startTime" 
                    value={formData.startTime}
                    onChange={handleChange}
                    min={minDateTime}
                    max={maxDateTime}
                    required 
                  />
                </div>
                <div className="input-group">
                  <label><Clock size={18} /> End Date & Time</label>
                  <input 
                    type="datetime-local" 
                    name="endTime" 
                    value={formData.endTime}
                    onChange={handleChange}
                    min={minDateTime}
                    max={maxDateTime}
                    required 
                  />
                </div>
              </div>

              <div className="input-group">
                <label><FileText size={18} /> Purpose</label>
                <textarea 
                  name="purpose" 
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Describe why you need this resource..." 
                  rows="3" 
                  required
                ></textarea>
                <div className={`word-count ${countWords(formData.purpose) > 100 ? 'text-danger' : ''}`}>
                  Words: {countWords(formData.purpose)}/100
                </div>
              </div>

              {error && (
                <motion.div 
                  className="error-msg"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </motion.div>
              )}

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Send size={20} />
                    <span>{isEdit ? 'Update Reservation' : 'Submit Request'}</span>
                  </>
                )}
              </button>

              <AnimatePresence>
                {success && (
                  <motion.div 
                    className="success-msg"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                  >
                    Booking {isEdit ? 'updated' : 'submitted'} successfully!
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            <div className="availability-sidebar">
              <div className="availability-header">
                <Info size={18} />
                <h3>Live Availability</h3>
              </div>
              
              {!formData.resourceId ? (
                <div className="empty-availability">
                  <p>Select a resource to see its availability timeline.</p>
                </div>
              ) : fetchingAvailability ? (
                <div className="loading-availability">
                  <div className="spinner"></div>
                  <p>Checking schedule...</p>
                </div>
              ) : (
                <div className="availability-list">
                  <p className="availability-subtitle">
                    {formData.startTime 
                      ? `Schedule for ${format(parseISO(formData.startTime), 'MMM dd, yyyy')}`
                      : 'Upcoming Bookings'}
                  </p>
                  
                  {getDayBookings().length === 0 ? (
                    <div className="no-bookings">
                      <p>No bookings found for this period. 30-min buffer will be applied after your booking.</p>
                    </div>
                  ) : (
                    <div className="timeline">
                      {getDayBookings().map((booking, index) => (
                        <motion.div 
                          key={booking.id || index}
                          className="timeline-item"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="time-range">
                            {format(parseISO(booking.startTime), 'HH:mm')} - {format(parseISO(booking.endTime), 'HH:mm')}
                          </div>
                          <div className="buffer-info">
                            +30m buffer required
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  
                  <div className="buffer-note">
                    <Info size={14} />
                    <span>A 30-minute buffer is automatically added between bookings for maintenance.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <style jsx="true">{`
        .new-booking-container {
          max-width: 1000px;
          margin: 0 auto;
          padding-bottom: 50px;
        }

        .form-card {
          padding: 40px;
          border-radius: 24px;
          background: white;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        }

        .form-header {
          margin-bottom: 35px;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 20px;
        }

        .form-header h2 {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .booking-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 40px;
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-row {
          display: flex;
          gap: 20px;
          width: 100%;
        }

        .input-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.9rem;
        }

        input, textarea, select {
          width: 100%;
          background: #f8fafc;
          border: 1px solid var(--glass-border);
          border-radius: 14px;
          padding: 14px;
          color: var(--text-main);
          font-family: inherit;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 45px;
        }

        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
          transform: translateY(-1px);
        }

        .error-msg {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          padding: 15px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.95rem;
          border: 1px solid rgba(239, 68, 68, 0.2);
        }

        .word-count {
          font-size: 0.8rem;
          text-align: right;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .text-danger {
          color: #ef4444 !important;
          font-weight: 600;
        }

        .submit-btn {
          margin-top: 10px;
          padding: 16px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
          color: white;
          border-radius: 14px;
          font-weight: 600;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.4s;
          box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(99, 102, 241, 0.4);
        }

        .success-msg {
          margin-top: 15px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 16px;
          border-radius: 14px;
          text-align: center;
          font-weight: 600;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        /* Availability Sidebar */
        .availability-sidebar {
          background: #f8fafc;
          border-radius: 20px;
          padding: 25px;
          border: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .availability-header {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--primary);
        }

        .availability-header h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
        }

        .availability-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 15px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .timeline-item {
          background: white;
          padding: 15px;
          border-radius: 12px;
          border-left: 4px solid var(--primary);
          box-shadow: 0 4px 10px rgba(0,0,0,0.03);
        }

        .time-range {
          font-weight: 600;
          font-size: 1.05rem;
        }

        .buffer-info {
          font-size: 0.8rem;
          color: #f59e0b;
          margin-top: 4px;
        }

        .buffer-note {
          margin-top: auto;
          display: flex;
          gap: 10px;
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
          background: rgba(99, 102, 241, 0.05);
          padding: 12px;
          border-radius: 10px;
        }

        .empty-availability, .no-bookings {
          text-align: center;
          color: var(--text-muted);
          padding: 40px 20px;
          font-size: 0.95rem;
        }

        .loading-availability {
          text-align: center;
          padding: 40px;
        }

        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(0,0,0,0.05);
          border-top-color: var(--primary);
          border-radius: 50%;
          margin: 0 auto 15px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 850px) {
          .booking-grid { grid-template-columns: 1fr; }
          .input-row { flex-direction: column; }
        }
      `}</style>
    </DynamicLayout>
  );
};

export default NewBooking;

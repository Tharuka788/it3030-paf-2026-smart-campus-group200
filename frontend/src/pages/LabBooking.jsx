import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DynamicLayout from '../components/DynamicLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  Users, 
  MapPin, 
  Info, 
  Clock,
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  AlertCircle,
  Cpu,
  MousePointer2
} from 'lucide-react';
import { facilityService, bookingService } from '../services/api';
import { format, addHours, addDays } from 'date-fns';

const LabBooking = () => {
  const [searchParams] = useSearchParams();
  const facilityId = searchParams.get('id') || searchParams.get('resourceId');
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [fetchingSeats, setFetchingSeats] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const minDateTime = format(new Date(), "yyyy-MM-dd'T'HH:mm");
  const maxDateTime = format(addDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm");

  // Helper to count words for validation
  const countWords = (str) => {
    if (!str || str.trim() === '') return 0;
    return str.trim().split(/\s+/).length;
  };

  const [formData, setFormData] = useState({
    purpose: '',
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:00"),
    endTime: format(addHours(new Date(), 2), "yyyy-MM-dd'T'HH:00"),
  });

  useEffect(() => {
    const fetchFacilityDetails = async () => {
      setLoading(true);
      try {
        const { data } = await facilityService.getFacilityById(facilityId);
        setFacility(data);
      } catch (err) {
        console.error('Failed to fetch facility:', err);
        setError('Failed to load facility details.');
      } finally {
        setLoading(false);
      }
    };

    if (facilityId) {
      fetchFacilityDetails();
    } else {
      navigate('/facilities');
    }
  }, [facilityId, navigate]);

  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!facilityId || !formData.startTime || !formData.endTime) return;
      
      setFetchingSeats(true);
      try {
        const { data } = await bookingService.getBookingsByResource(facilityId);
        const selectedStart = new Date(formData.startTime);
        const selectedEnd = new Date(formData.endTime);
        
        const overlappingBookings = data.filter(booking => {
          const bStart = new Date(booking.startTime);
          const bEnd = new Date(booking.endTime);
          const bufferStart = new Date(bStart.getTime() - 30 * 60000);
          const bufferEnd = new Date(bEnd.getTime() + 30 * 60000);
          return selectedStart < bufferEnd && selectedEnd > bufferStart;
        });
        
        const seats = [];
        overlappingBookings.forEach(b => {
          if (b.selectedSeats && b.selectedSeats.length > 0) {
            seats.push(...b.selectedSeats);
          }
        });

        setBookedSeats(seats);
        setSelectedSeats(prev => prev.filter(s => !seats.includes(s)));
      } catch (err) {
        console.error('Failed to fetch booked seats:', err);
      } finally {
        setFetchingSeats(false);
      }
    };

    fetchBookedSeats();
  }, [facilityId, formData.startTime, formData.endTime, step]);

  const handleSeatClick = (seatId) => {
    if (bookedSeats.includes(seatId)) return;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const handleConfirmBooking = async () => {
    if (selectedSeats.length === 0) {
      setError('Please select at least one workstation.');
      return;
    }
    if (!formData.purpose) {
      setError('Please provide a purpose for the booking.');
      return;
    }

    setBookingLoading(true);
    setError(null);

    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const now = new Date();
    const nextWeek = addDays(now, 7);

    // Block bookings in the past
    if (start < now) {
      setError("Cannot book a resource in the past.");
      setBookingLoading(false);
      return;
    }

    // Limit advance bookings to 7 days
    if (start > nextWeek) {
      setError("Bookings can only be made up to 7 days in advance.");
      setBookingLoading(false);
      return;
    }

    // Ensure logical time order
    if (end <= start) {
      setError("End time must be after start time.");
      setBookingLoading(false);
      return;
    }

    // Enforce 100-word limit on purpose
    if (countWords(formData.purpose) > 100) {
      setError("Purpose must not exceed 100 words.");
      setBookingLoading(false);
      return;
    }

    const bookingData = {
      resourceId: facilityId,
      resourceName: facility.name,
      userEmail: localStorage.getItem('userEmail') || 'student@campus.edu',
      userName: localStorage.getItem('userName') || 'Campus Student',
      startTime: formData.startTime,
      endTime: formData.endTime,
      purpose: formData.purpose,
      expectedAttendees: selectedSeats.length,
      selectedSeats: selectedSeats,
      location: facility.location
    };

    try {
      await bookingService.createBooking(bookingData);
      setSuccess(true);
      setTimeout(() => navigate('/bookings/my'), 2000);
    } catch (err) {
      console.error('Booking failed:', err);
      setError(err.response?.data?.message || 'Failed to create booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <DynamicLayout><div className="loader">Loading lab details...</div></DynamicLayout>;
  if (!facility) return <DynamicLayout><div className="error">Facility not found.</div></DynamicLayout>;

  // Render a column of PCs
  const renderPCColumn = (start, end) => {
    const pcs = [];
    for (let i = start; i <= end; i++) {
      const pcId = i.toString();
      const isBooked = bookedSeats.includes(pcId);
      const isSelected = selectedSeats.includes(pcId);
      
      pcs.push(
        <div 
          key={pcId}
          className={`pc-item ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleSeatClick(pcId)}
        >
          <div className="pc-icon-wrapper">
             <Monitor size={14} />
             {isBooked && <div className="status-dot occupied"></div>}
             {!isBooked && !isSelected && <div className="status-dot available"></div>}
          </div>
          <span className="pc-number">{pcId}</span>
        </div>
      );
    }
    return <div className="pc-column">{pcs}</div>;
  };

  return (
    <DynamicLayout>
      <div className="lab-booking-page">
        <header className="page-header">
           <div className="header-titles">
             <h1 className="gradient-text">{facility.name} Reservation</h1>
             <p className="subtitle"><Cpu size={16} /> Advanced Computer Science Laboratory • 60 High-End Workstations</p>
           </div>
           {selectedSeats.length > 0 && (
             <motion.div className="selection-summary-badge" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
               {selectedSeats.length} Workstations Selected
             </motion.div>
           )}
        </header>

        <div className="booking-stepper">
          <div className={`step-item ${step >= 1 ? 'active' : ''}`}>1. Details</div>
          <div className="step-connector"></div>
          <div className={`step-item ${step >= 2 ? 'active' : ''}`}>2. PC Selection</div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1" 
              className="step-container"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="details-card glass-morphism">
                 <div className="card-section">
                   <h3><Info size={20} /> Facility Information</h3>
                   <div className="info-grid">
                     <div className="info-item">
                       <label>Location</label>
                       <p><MapPin size={16} /> {facility.location || 'Technology Block B'}</p>
                     </div>
                     <div className="info-item">
                       <label>Capacity</label>
                       <p><Users size={16} /> {facility.capacity} Workstations</p>
                     </div>
                   </div>
                 </div>

                 <div className="card-section">
                   <h3><Clock size={20} /> Schedule Your Session</h3>
                   <div className="time-grid">
                     <div className="input-field">
                       <label>Start Time</label>
                       <input 
                         type="datetime-local" 
                         value={formData.startTime}
                         onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                         min={minDateTime}
                         max={maxDateTime}
                       />
                     </div>
                     <div className="input-field">
                       <label>End Time</label>
                       <input 
                         type="datetime-local" 
                         value={formData.endTime}
                         onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                         min={minDateTime}
                         max={maxDateTime}
                       />
                     </div>
                   </div>
                 </div>

                 <div className="card-section">
                   <h3><MousePointer2 size={20} /> Usage Details</h3>
                    <textarea 
                      placeholder="Specify the purpose of this lab session (e.g., Programming Lab Exam, Research Data Analysis)"
                      value={formData.purpose}
                      onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                      rows="3"
                    />
                    <div className={`word-count ${countWords(formData.purpose) > 100 ? 'text-danger' : ''}`}>
                      Words: {countWords(formData.purpose)}/100
                    </div>
                  </div>

                 <div className="card-actions">                   <button className="primary-btn" onClick={() => {
                     const start = new Date(formData.startTime);
                     const now = new Date();
                     const nextWeek = addDays(now, 7);

                     // Basic validation before switching to PC selection screen
                     if (start < now) {
                       setError("Cannot book a resource in the past.");
                       return;
                     }
                     if (start > nextWeek) {
                       setError("Bookings can only be made up to 7 days in advance.");
                       return;
                     }
                     if (new Date(formData.endTime) <= start) {
                       setError("End time must be after start time.");
                       return;
                     }
                     if (countWords(formData.purpose) > 100) {
                       setError("Purpose must not exceed 100 words.");
                       return;
                     }
                     setError(null);
                     setStep(2);
                   }}>

                     Next: Select PCs <ChevronRight size={18} />
                   </button>
                 </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2" 
              className="step-container"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="lab-visual-container glass-morphism">
                <div className="lab-legend">
                  <div className="legend-item"><span className="swatch available"></span> Available</div>
                  <div className="legend-item"><span className="swatch booked"></span> Booked</div>
                  <div className="legend-item"><span className="swatch selected"></span> Your Selection</div>
                </div>

                <div className="lab-layout">
                  {/* Left Block */}
                  <div className="lab-block">
                    {renderPCColumn(1, 15)}
                    <div className="block-divider"></div>
                    {renderPCColumn(16, 30)}
                  </div>

                  {/* Main Aisle */}
                  <div className="main-aisle">
                    <div className="aisle-line"></div>
                    <span>LAB AISLE</span>
                  </div>

                  {/* Right Block */}
                  <div className="lab-block">
                    {renderPCColumn(31, 45)}
                    <div className="block-divider"></div>
                    {renderPCColumn(46, 60)}
                  </div>
                </div>

                {error && <div className="error-message"><AlertCircle size={18} /> {error}</div>}
                {success && <div className="success-message"><CheckCircle size={18} /> Lab booking confirmed! Redirecting...</div>}

                <div className="action-footer">
                  <button className="secondary-btn" onClick={() => setStep(1)} disabled={bookingLoading}>
                    <ChevronLeft size={18} /> Back to Details
                  </button>
                  <button 
                    className="primary-btn" 
                    onClick={handleConfirmBooking}
                    disabled={bookingLoading || selectedSeats.length === 0}
                  >
                    {bookingLoading ? 'Processing...' : 'Confirm Reservation'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx="true">{`
        .lab-booking-page {
          max-width: 1200px;
          margin: 0 auto;
          padding-bottom: 60px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .subtitle {
          color: #64748b;
          font-size: 1.1rem;
          margin-top: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .selection-summary-badge {
          background: #f5f3ff;
          color: #7c3aed;
          padding: 10px 24px;
          border-radius: 50px;
          font-weight: 700;
          border: 1px solid #ddd6fe;
        }

        .booking-stepper {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 40px;
        }

        .step-item {
          padding: 10px 20px;
          border-radius: 12px;
          color: #94a3b8;
          font-weight: 600;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .step-item.active {
          background: #7c3aed;
          color: white;
          border-color: #7c3aed;
        }

        .step-connector {
          width: 60px;
          height: 2px;
          background: #e2e8f0;
        }

        .details-card {
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
          border-radius: 24px;
          background: white;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .card-section h3 {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: #1e293b;
        }

        .info-grid, .time-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        label {
          display: block;
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        input, textarea {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-family: inherit;
          font-size: 1rem;
          transition: all 0.3s;
        }

        input:focus, textarea:focus {
          outline: none;
          border-color: #7c3aed;
          background: white;
          box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
        }

        .card-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
        }

        .primary-btn {
          background: #7c3aed;
          color: white;
          padding: 14px 32px;
          border-radius: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
        }

        .primary-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(124, 58, 237, 0.3);
        }

        .secondary-btn {
          color: #64748b;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Lab Layout Styles */
        .lab-visual-container {
          padding: 40px;
          background: white;
          border-radius: 24px;
        }

        .lab-legend {
          display: flex;
          justify-content: center;
          gap: 30px;
          margin-bottom: 40px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 600;
          color: #64748b;
          font-size: 0.9rem;
        }

        .swatch {
          width: 20px;
          height: 20px;
          border-radius: 6px;
        }

        .swatch.available { border: 2px solid #10b981; }
        .swatch.booked { background: #f8fafc; border: 2px solid #e2e8f0; }
        .swatch.selected { background: #7c3aed; }

        .lab-layout {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-bottom: 40px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 30px;
          border: 1px solid #f1f5f9;
        }

        .lab-block {
          display: flex;
          gap: 15px;
          padding: 20px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
        }

        .pc-column {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pc-item {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          border: 2px solid #10b981;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .pc-item:hover:not(.booked) {
          transform: scale(1.1);
          box-shadow: 0 5px 15px rgba(16, 185, 129, 0.2);
        }

        .pc-item.booked {
          background: #f8fafc;
          border-color: #e2e8f0;
          color: #cbd5e1;
          cursor: not-allowed;
        }

        .pc-item.selected {
          background: #7c3aed;
          border-color: #7c3aed;
          color: white;
          box-shadow: 0 0 15px rgba(124, 58, 237, 0.4);
        }

        .pc-number {
          font-size: 0.65rem;
          font-weight: 800;
        }

        .status-dot {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .status-dot.available { background: #10b981; }
        .status-dot.occupied { background: #ef4444; }

        .block-divider {
          width: 2px;
          background: #f1f5f9;
          border-radius: 1px;
          margin: 10px 0;
        }

        .main-aisle {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .aisle-line {
          width: 4px;
          height: 100%;
          background: #e2e8f0;
          border-radius: 2px;
        }

        .main-aisle span {
          writing-mode: vertical-rl;
          text-orientation: mixed;
          font-size: 0.75rem;
          color: #94a3b8;
          letter-spacing: 4px;
          font-weight: 700;
        }

        .action-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #f1f5f9;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ef4444;
          background: #fef2f2;
          padding: 15px;
          border-radius: 14px;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .success-message {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #10b981;
          background: #f0fdf4;
          padding: 15px;
          border-radius: 14px;
          margin-bottom: 20px;
          font-weight: 600;
        }

        .word-count {
          font-size: 0.8rem;
          text-align: right;
          color: #64748b;
          margin-top: 4px;
        }

        .text-danger {
          color: #ef4444 !important;
          font-weight: 600;
        }
      `}</style>
    </DynamicLayout>
  );
};

export default LabBooking;

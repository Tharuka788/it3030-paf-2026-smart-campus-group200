import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DynamicLayout from '../components/DynamicLayout';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { 
  Users, 
  MapPin, 
  Info, 
  Clock,
  ChevronRight, 
  ChevronLeft, 
  CheckCircle,
  AlertCircle,
  Monitor,
  Layout as LayoutIcon,
  Building2
} from 'lucide-react';
import { facilityService, bookingService } from '../services/api';
import { format, addHours, addDays } from 'date-fns';

const HallBooking = () => {
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

  const countWords = (str) => {
    if (!str || str.trim() === '') return 0;
    return str.trim().split(/\s+/).length;
  };

  // Form data for booking
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
        
        // Filter bookings that overlap with the selected time
        const selectedStart = new Date(formData.startTime);
        const selectedEnd = new Date(formData.endTime);
        
        const overlappingBookings = data.filter(booking => {
          const bStart = new Date(booking.startTime);
          const bEnd = new Date(booking.endTime);
          
          // 30 min buffer
          const bufferStart = new Date(bStart.getTime() - 30 * 60000);
          const bufferEnd = new Date(bEnd.getTime() + 30 * 60000);
          
          return selectedStart < bufferEnd && selectedEnd > bufferStart;
        });
        
        // Extract all booked seats
        const seats = [];
        let wholeHallBooked = false;

        overlappingBookings.forEach(b => {
          if (b.selectedSeats && b.selectedSeats.length > 0) {
            seats.push(...b.selectedSeats);
          } else {
            // If a booking exists without specific seats, it's a whole-hall reservation
            wholeHallBooked = true;
          }
        });

        // If whole hall is booked, mark all possible seat numbers (1-64)
        if (wholeHallBooked) {
          for (let i = 1; i <= 64; i++) {
            seats.push(i.toString());
          }
        }

        setBookedSeats(seats);
        
        // Remove any already selected seats that are now booked
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
      setError('Please select at least one seat.');
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

    if (start < now) {
      setError("Cannot book a resource in the past.");
      setBookingLoading(false);
      return;
    }

    if (start > nextWeek) {
      setError("Bookings can only be made up to 7 days in advance.");
      setBookingLoading(false);
      return;
    }

    if (end <= start) {
      setError("End time must be after start time.");
      setBookingLoading(false);
      return;
    }

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

  if (loading) return <DynamicLayout><div className="loader">Loading facility details...</div></DynamicLayout>;
  if (!facility) return <DynamicLayout><div className="error">Facility not found.</div></DynamicLayout>;

  return (
    <DynamicLayout>
      <div className="hall-booking-page">
        <div className="booking-header">
          <div className="header-left">
            <h1 className="gradient-text">Smart Campus Classroom Booking</h1>
            <p className="hall-info">{facility.name} (Capacity {facility.capacity})</p>
          </div>
          {selectedSeats.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="selection-badge"
            >
              {selectedSeats.length} Seats Selected
            </motion.div>
          )}
        </div>

        <div className="booking-stepper">
          <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2</div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content detail-view"
            >
              <div className="glass-morphism detail-card">
                <div className="card-header">
                  <Info size={24} className="icon" />
                  <h2>Lecture Hall Details</h2>
                </div>
                
                <div className="detail-grid">
                  <div className="detail-item">
                    <label><LayoutIcon size={18} /> Hall ID</label>
                    <p>{facility.name}</p>
                  </div>
                  <div className="detail-item">
                    <label><Building2 size={18} /> Building</label>
                    <p>{facility.location || 'Science Block A'}</p>
                  </div>
                  <div className="detail-item">
                    <label><Users size={18} /> Max Capacity</label>
                    <p>{facility.capacity} Students</p>
                  </div>
                  <div className="detail-item">
                    <label><MapPin size={18} /> Type</label>
                    <p>{facility.type.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="description-section">
                  <label>Description</label>
                  <p>{facility.description || 'Modern lecture hall equipped with high-speed Wi-Fi, premium audio-visual systems, and ergonomic seating for an optimal learning experience.'}</p>
                </div>

                <div className="time-selection">
                  <div className="input-group">
                    <label>Start Time</label>
                    <input 
                      type="datetime-local" 
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      min={minDateTime}
                      max={maxDateTime}
                    />
                  </div>
                  <div className="input-group">
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

                <div className="input-group" style={{ marginTop: '20px' }}>
                    <label>Purpose of Booking</label>
                    <textarea 
                      placeholder="e.g. Supplementary Lecture for IT3030"
                      value={formData.purpose}
                      onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                      rows="2"
                    />
                    <div className={`word-count ${countWords(formData.purpose) > 100 ? 'text-danger' : ''}`}>
                      Words: {countWords(formData.purpose)}/100
                    </div>
                </div>

                <div className="card-footer">
                  <button className="next-btn" onClick={() => {
                    const start = new Date(formData.startTime);
                    const now = new Date();
                    const nextWeek = addDays(now, 7);

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
                    Next Step <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="step-content structure-view"
            >
              <div className="visual-container glass-morphism">
                <div className="selection-summary">
                  <div className="time-info">
                    <Clock size={18} />
                    <span>Viewing availability for: </span>
                    <strong>{format(new Date(formData.startTime), 'MMM d, h:mm a')} - {format(new Date(formData.endTime), 'h:mm a')}</strong>
                    <span className="buffer-badge">+30m buffer</span>
                  </div>
                  <button className="change-time-toggle" onClick={() => setStep(1)}>
                    Change Time
                  </button>
                </div>

                <div className="room-layout">
                  <div className="whiteboard-area">
                    <div className="whiteboard-line"></div>
                    <span>WHITEBOARD</span>
                  </div>

                  <div className="stage-area">
                    <div className="stage-box">
                       {fetchingSeats ? (
                         <div className="mini-loader">Checking seats...</div>
                       ) : (
                         <>
                           <Monitor size={20} />
                           <span>LECTURE STAGE</span>
                         </>
                       )}
                    </div>
                  </div>

                  <div className="seating-grid">
                    {/* Left Block */}
                    <div className="seat-block">
                      {Array.from({ length: 32 }, (_, i) => i + 1).map(num => (
                        <div 
                          key={num}
                          className={`seat ${bookedSeats.includes(num.toString()) ? 'booked' : ''} ${selectedSeats.includes(num.toString()) ? 'selected' : ''}`}
                          onClick={() => handleSeatClick(num.toString())}
                        >
                          {num}
                        </div>
                      ))}
                    </div>

                    {/* Right Block */}
                    <div className="seat-block">
                      {Array.from({ length: 32 }, (_, i) => i + 33).map(num => {
                        const isStorage = num > 60;
                        return (
                          <div 
                            key={num}
                            className={`seat ${isStorage ? 'storage' : ''} ${bookedSeats.includes(num.toString()) ? 'booked' : ''} ${selectedSeats.includes(num.toString()) ? 'selected' : ''}`}
                            onClick={() => !isStorage && handleSeatClick(num.toString())}
                          >
                            {isStorage ? '✕' : num}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="legend">
                  <div className="legend-item"><span className="dot available"></span> [Available]</div>
                  <div className="legend-item"><span className="dot booked"></span> [Already Booked]</div>
                  <div className="legend-item"><span className="dot selected"></span> [Your Selection]</div>
                  <div className="legend-item"><span className="dot accessible"></span> [Accessible]</div>
                  <div className="legend-item"><span className="dot storage"></span> [Storage]</div>
                </div>

                {error && <div className="error-msg"><AlertCircle size={18} /> {error}</div>}
                {success && <div className="success-msg"><CheckCircle size={18} /> Booking successful! Redirecting...</div>}

                <div className="action-bar">
                  <button className="back-btn" onClick={() => setStep(1)} disabled={bookingLoading}>
                    <ChevronLeft size={20} /> Back
                  </button>
                  <button 
                    className="confirm-btn" 
                    onClick={handleConfirmBooking}
                    disabled={bookingLoading || selectedSeats.length === 0}
                  >
                    {bookingLoading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style jsx="true">{`
          .hall-booking-page {
            max-width: 1200px;
            margin: 0 auto;
            padding-bottom: 80px;
          }

          .booking-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }

          .hall-info {
            color: var(--text-muted);
            font-size: 1.1rem;
            margin-top: 5px;
          }

          .selection-badge {
            background: rgba(236, 72, 153, 0.15);
            color: #f472b6;
            padding: 8px 20px;
            border-radius: 50px;
            font-weight: 600;
            border: 1px solid rgba(236, 72, 153, 0.3);
            box-shadow: 0 0 15px rgba(236, 72, 153, 0.2);
          }

          .selection-summary {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 20px;
            background: rgba(255, 255, 255, 0.03);
            border-bottom: 1px solid var(--glass-border);
            margin: -20px -30px 25px -30px;
            border-radius: 24px 24px 0 0;
          }

          .time-info {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.95rem;
            color: var(--text-muted);
          }

          .time-info strong {
            color: white;
            margin-left: 5px;
          }

          .change-time-toggle {
            font-size: 0.85rem;
            color: var(--primary);
            font-weight: 600;
            text-decoration: underline;
            background: none;
            border: none;
            padding: 0;
            cursor: pointer;
          }

          .booking-stepper {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 15px;
            margin-bottom: 40px;
          }

          .step-indicator {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--glass-border);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            color: var(--text-muted);
            transition: all 0.3s;
          }

          .step-indicator.active {
            background: var(--primary);
            color: white;
            border-color: var(--primary);
            box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
          }

          .step-line {
            width: 100px;
            height: 2px;
            background: rgba(255,255,255,0.05);
          }

          .step-line.active {
            background: var(--primary);
          }

          /* Detail View */
          .detail-card {
            padding: 40px;
            border-radius: 24px;
            max-width: 800px;
            margin: 0 auto;
          }

          .card-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 30px;
            color: var(--primary);
          }

          .card-header h2 {
            font-size: 1.5rem;
            margin: 0;
            color: var(--text-main);
          }

          .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-bottom: 30px;
          }

          .detail-item label {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-muted);
            font-size: 0.9rem;
            margin-bottom: 8px;
          }

          .detail-item p {
            font-size: 1.2rem;
            font-weight: 600;
            margin: 0;
          }

          .description-section {
            margin-bottom: 30px;
            padding-top: 20px;
            border-top: 1px solid var(--glass-border);
          }

          .description-section label {
            color: var(--text-muted);
            font-size: 0.9rem;
            display: block;
            margin-bottom: 10px;
          }

          .description-section p {
            line-height: 1.6;
            color: var(--text-main);
          }

          .time-selection {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 20px;
          }

          .input-group label {
            display: block;
            margin-bottom: 8px;
            color: var(--text-muted);
            font-size: 0.9rem;
          }

          .input-group input, .input-group textarea {
            width: 100%;
            background: white;
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 12px;
            color: var(--text-main);
            outline: none;
            transition: all 0.3s;
          }

          .input-group input:focus, .input-group textarea:focus {
            border-color: var(--primary);
            box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
          }

          .card-footer {
            margin-top: 40px;
            display: flex;
            justify-content: flex-end;
          }

          .next-btn {
            background: var(--primary);
            color: white;
            padding: 14px 30px;
            border-radius: 12px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.3s;
          }

          .next-btn:hover {
            transform: translateX(5px);
            box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4);
          }

          /* Structure View */
          .visual-container {
            padding: 20px 30px;
            border-radius: 24px;
            background: white;
            box-shadow: var(--box-shadow);
            border: 1px solid var(--glass-border);
          }

          .room-layout {
            background: #ffffff;
            border-radius: 20px;
            padding: 25px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 25px;
            border: 1px solid rgba(0,0,0,0.06);
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
            margin-bottom: 25px;
          }

          .whiteboard-area {
            width: 60%;
            text-align: center;
          }

          .whiteboard-line {
            height: 4px;
            background: #64748b;
            border-radius: 2px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 5px;
          }

          .whiteboard-area span {
            font-size: 0.8rem;
            letter-spacing: 4px;
            color: var(--text-muted);
          }

          .stage-area {
            width: 40%;
          }

          .stage-box {
            background: white;
            border: 1px solid var(--glass-border);
            padding: 12px 25px;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            color: var(--text-muted);
          }

          .seating-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            width: 100%;
            max-width: 750px;
          }

          .seat-block {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }

          .seat {
            aspect-ratio: 1;
            background: #ffffff;
            border: 1.5px solid #06b6d4;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: 600;
            color: #06b6d4;
            cursor: pointer;
            transition: all 0.2s;
          }

          .seat:hover:not(.booked):not(.storage) {
            transform: scale(1.1);
            box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
          }

          .seat.booked {
            background: #f1f5f9;
            border-color: #cbd5e1;
            color: #94a3b8;
            cursor: not-allowed;
            position: relative;
            overflow: hidden;
          }

          .seat.booked::after {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: repeating-linear-gradient(
              45deg,
              transparent,
              transparent 5px,
              rgba(0, 0, 0, 0.05) 5px,
              rgba(0, 0, 0, 0.05) 10px
            );
          }

          .seat.selected {
            background: #ec4899;
            border-color: #ec4899;
            color: white;
            box-shadow: 0 0 15px rgba(236, 72, 153, 0.5);
          }

          .seat.storage {
            background: rgba(255,255,255,0.05);
            border-color: rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.2);
            cursor: default;
          }

          .legend {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 15px;
            margin-bottom: 25px;
          }

          .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
            color: var(--text-muted);
          }

          .dot {
            width: 16px;
            height: 16px;
            border-radius: 4px;
            border: 1px solid transparent;
          }

          .dot.available { border-color: #06b6d4; background: rgba(6, 182, 212, 0.1); }
          .dot.booked { border-color: #cbd5e1; background: #f1f5f9; }
          .dot.selected { background: #ec4899; }
          .dot.accessible { border-color: #14b8a6; background: rgba(20, 184, 166, 0.1); }
          .dot.storage { border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); }

          .action-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 20px;
            border-top: 1px solid var(--glass-border);
          }

          .back-btn {
            display: flex;
            align-items: center;
            gap: 5px;
            color: var(--text-muted);
            transition: color 0.3s;
          }

          .back-btn:hover { color: var(--text-main); }

          .confirm-btn {
            background: var(--primary);
            color: white;
            padding: 14px 40px;
            border-radius: 12px;
            font-weight: 700;
            transition: all 0.3s;
          }

          .confirm-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
          }

          .confirm-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .error-msg {
            color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
            padding: 12px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
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

          .success-msg {
            color: #10b981;
            background: rgba(16, 185, 129, 0.1);
            padding: 12px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .loader, .mini-loader {
            text-align: center;
            padding: 10px;
            font-size: 0.9rem;
            color: var(--primary);
          }

          .loader {
            padding: 100px;
            font-size: 1.2rem;
          }

          @media (max-width: 900px) {
            .seating-grid {
              grid-template-columns: 1fr;
              gap: 20px;
            }
            .detail-grid {
              grid-template-columns: 1fr;
            }
          }
          .buffer-badge {
            font-size: 0.75rem;
            background: #fffbeb;
            color: #d97706;
            padding: 2px 8px;
            border-radius: 4px;
            border: 1px solid #fef3c7;
            margin-left: 10px;
            font-weight: 600;
          }
        `}</style>
      </div>
    </DynamicLayout>
  );
};

export default HallBooking;

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, PlusCircle, Trash2, MapPin, Tag, Box, Info, ShieldAlert } from 'lucide-react';
import { facilityService } from '../services/api';

const ManageFacility = () => {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    type: 'ROOM',
    capacity: '',
    location: '',
    status: 'ACTIVE',
    description: '',
    availabilityWindows: []
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editId) {
      setLoading(true);
      facilityService.getFacilityById(editId).then(({ data }) => {
        setFormData({
            ...data,
            capacity: data.capacity || '',
            availabilityWindows: data.availabilityWindows || []
        });
      }).catch(err => {
        console.error(err);
        alert('Failed to fetch facility data');
      }).finally(() => {
        setLoading(false);
      });
    }
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'type') {
        if (value === 'EQUIPMENT' && !['IN_STOCK', 'OUT_OF_STOCK'].includes(prev.status)) {
          newData.status = 'IN_STOCK';
        } else if (value !== 'EQUIPMENT' && !['ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'].includes(prev.status)) {
          newData.status = 'ACTIVE';
        }
      }
      return newData;
    });
  };

  const handleWindowChange = (index, field, value) => {
    const updatedWindows = [...formData.availabilityWindows];
    updatedWindows[index] = { ...updatedWindows[index], [field]: value };
    setFormData({ ...formData, availabilityWindows: updatedWindows });
  };

  const addWindow = () => {
    setFormData({
      ...formData,
      availabilityWindows: [...formData.availabilityWindows, { dayOfWeek: 'Monday', startTime: '08:00', endTime: '18:00' }]
    });
  };

  const removeWindow = (index) => {
    setFormData({
      ...formData,
      availabilityWindows: formData.availabilityWindows.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const payload = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null
      };

      if (editId) {
        await facilityService.updateFacility(editId, payload);
      } else {
        await facilityService.createFacility(payload);
      }
      navigate('/admin/facilities');
    } catch (err) {
      console.error(err);
      alert('Action failed. Check console.');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="new-booking-container">
        <motion.div 
          className="form-card glass-morphism animate-fade-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="form-header">
            <h2 className="gradient-text">{editId ? 'Edit Facility' : 'Add New Facility'}</h2>
            <p>Define resource details to add it to the catalogue.</p>
          </div>

          {loading && editId && !formData.name ? (
            <p style={{color: 'var(--text-muted)'}}>Loading data...</p>
          ) : (
            <form onSubmit={handleSubmit} className="booking-form">
              <div className="input-row">
                <div className="input-group" style={{flex: 2}}>
                  <label><Box size={18} /> Facility Name</label>
                  <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Auditorium A" />
                </div>
                <div className="input-group" style={{flex: 1}}>
                  <label><Tag size={18} /> Type</label>
                  <select name="type" value={formData.type} onChange={handleChange}>
                      <option value="ROOM">Room</option>
                      <option value="LECTURE_HALL">Lecture Hall</option>
                      <option value="LAB">Laboratory</option>
                      <option value="EQUIPMENT">Equipment</option>
                      <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="input-row">
                {formData.type !== 'EQUIPMENT' && (
                  <div className="input-group" style={{flex: 2}}>
                    <label><MapPin size={18} /> Location</label>
                    <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Building 1, 3rd Floor" />
                  </div>
                )}
                <div className="input-group" style={{flex: 1}}>
                  <label><Info size={18} /> {formData.type === 'EQUIPMENT' ? 'Quantity' : 'Capacity'}</label>
                  <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} placeholder={formData.type === 'EQUIPMENT' ? 'e.g. 10' : 'e.g. 50'} />
                </div>
                <div className="input-group" style={{flex: 1}}>
                  <label><ShieldAlert size={18} /> Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                      {formData.type === 'EQUIPMENT' ? (
                          <>
                              <option value="IN_STOCK">In Stock</option>
                              <option value="OUT_OF_STOCK">Out of Stock</option>
                          </>
                      ) : (
                          <>
                              <option value="ACTIVE">Active</option>
                              <option value="OUT_OF_SERVICE">Out of Service</option>
                              <option value="MAINTENANCE">Maintenance</option>
                          </>
                      )}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label><Info size={18} /> Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="3" placeholder="Additional details, features..."></textarea>
              </div>

              <div className="availability-box">
                <div className="availability-header">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>
                    <Tag size={18} /> Availability Windows
                  </label>
                  <button type="button" onClick={addWindow} className="add-window-btn">
                      <PlusCircle size={16} /> Add Slot
                  </button>
                </div>
                {formData.availabilityWindows.length === 0 ? (
                    <p className="no-windows">No specific availability windows added. Default is always available.</p>
                ) : (
                    <div className="windows-list">
                        {formData.availabilityWindows.map((win, idx) => (
                            <div key={idx} className="window-item">
                                <select value={win.dayOfWeek} onChange={(e) => handleWindowChange(idx, 'dayOfWeek', e.target.value)}>
                                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                                <input type="time" value={win.startTime} onChange={(e) => handleWindowChange(idx, 'startTime', e.target.value)} />
                                <span className="to-text">to</span>
                                <input type="time" value={win.endTime} onChange={(e) => handleWindowChange(idx, 'endTime', e.target.value)} />
                                <button type="button" onClick={() => removeWindow(idx)} className="del-btn">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Saving...' : (
                  <>
                    <Save size={20} />
                    <span>Save Facility</span>
                  </>
                )}
              </button>
              
              <button type="button" className="cancel-btn" onClick={() => navigate('/facilities')}>
                Cancel
              </button>
            </form>
          )}
        </motion.div>
      </div>

      <style jsx="true">{`
        .new-booking-container {
          max-width: 800px;
          margin: 0 auto;
          padding-bottom: 50px;
        }

        .form-card {
          padding: 40px;
          border-radius: 20px;
        }

        .form-header {
          margin-bottom: 40px;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 25px;
        }

        .form-header h2 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .form-header p {
          color: var(--text-muted);
        }

        .booking-form {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .input-row {
          display: flex;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.95rem;
        }

        input, textarea, select {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 15px;
          color: white;
          font-family: inherit;
          transition: all 0.3s;
        }
        
        select option {
          background: #1e293b;
          color: white;
        }

        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
        }

        .availability-box {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          padding: 20px;
        }

        .availability-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .add-window-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid var(--glass-border);
          padding: 8px 15px;
          border-radius: 8px;
          font-size: 0.9rem;
          transition: background 0.3s;
        }
        
        .add-window-btn:hover { background: rgba(255, 255, 255, 0.2); }

        .no-windows { color: var(--text-muted); font-size: 0.9rem; margin: 0; }

        .windows-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .window-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .window-item select, .window-item input {
          padding: 10px;
        }
        
        .to-text { color: var(--text-muted); font-size: 0.9rem; }
        
        .del-btn {
          color: #ef4444; padding: 10px; border-radius: 8px; background: rgba(239, 68, 68, 0.1); transition: 0.3s;
        }
        .del-btn:hover { background: rgba(239, 68, 68, 0.2); }

        .submit-btn {
          margin-top: 20px;
          padding: 16px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
          color: white;
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
        }

        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .cancel-btn {
          padding: 16px;
          background: transparent;
          color: var(--text-muted);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.3s;
        }
        .cancel-btn:hover { background: rgba(255, 255, 255, 0.05); color: white; }

        @media (max-width: 600px) {
          .input-row { flex-direction: column; }
          .window-item { flex-direction: column; align-items: stretch; }
        }
      `}</style>
    </>
  );
};

export default ManageFacility;

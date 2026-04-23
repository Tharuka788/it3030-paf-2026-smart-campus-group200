import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, PlusCircle, Trash2, MapPin, Tag, Box, Info, ShieldAlert, ArrowLeft, Calendar } from 'lucide-react';
import { facilityService } from '../services/api';

import DynamicLayout from '../components/DynamicLayout';

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
      navigate('/facilities');
    } catch (err) {
      console.error(err);
      alert('Action failed. Check console.');
      setLoading(false);
    }
  };

  return (
    <DynamicLayout>
      <div className="manage-container">
      <button className="back-btn" onClick={() => navigate('/facilities')}>
        <ArrowLeft size={18} /> Back to Catalogue
      </button>

      <motion.div 
        className="form-card glass-morphism animate-fade-in"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="form-header">
          <h2 className="gradient-text">{editId ? 'Edit Facility' : 'Add New Facility'}</h2>
          <p className="text-muted">Define resource details to add it to the catalogue.</p>
        </div>

        {loading && editId && !formData.name ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading resource data...</p>
          </div>
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
                    <option value="ROOM">Room / Meeting Room</option>
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="LAB">Laboratory / PC Lab</option>
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
                <label><Calendar size={18} /> Availability Windows</label>
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

            <div className="form-footer">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Saving...' : (
                  <>
                    <Save size={20} />
                    <span>{editId ? 'Update Facility' : 'Create Facility'}</span>
                  </>
                )}
              </button>
              <button type="button" className="cancel-btn" onClick={() => navigate('/facilities')}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </motion.div>

      <style jsx="true">{`
        .manage-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px 0 60px 0;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 25px;
          transition: color 0.3s;
        }

        .back-btn:hover { color: #4f46e5; }

        .form-card {
          padding: 40px;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 20px;
          box-shadow: var(--box-shadow);
        }

        .form-header {
          margin-bottom: 35px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f1f5f9;
        }

        .form-header h2 {
          font-size: 2.2rem;
          font-weight: 800;
          margin-bottom: 8px;
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
          gap: 8px;
        }

        .input-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #475569;
          font-weight: 600;
          font-size: 0.9rem;
        }

        input, textarea, select {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 12px 15px;
          color: #1e293b;
          font-family: inherit;
          font-weight: 500;
          transition: all 0.3s;
        }

        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }

        .availability-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          padding: 25px;
        }

        .availability-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .availability-header label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          color: #1e293b;
        }

        .add-window-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: white;
          color: #4f46e5;
          border: 1px solid #e2e8f0;
          padding: 8px 15px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .add-window-btn:hover { 
          background: #4f46e5; 
          color: white;
          border-color: #4f46e5;
        }

        .no-windows { color: #94a3b8; font-size: 0.9rem; text-align: center; font-style: italic; }

        .windows-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .window-item {
          display: flex;
          align-items: center;
          gap: 10px;
          background: white;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #f1f5f9;
        }

        .window-item select, .window-item input {
          padding: 8px;
          border-radius: 8px;
          font-size: 0.9rem;
        }
        
        .to-text { color: #94a3b8; font-weight: 600; }
        
        .del-btn {
          color: #ef4444; 
          padding: 8px; 
          border-radius: 8px; 
          background: #fee2e2; 
          transition: 0.3s;
          margin-left: auto;
        }
        .del-btn:hover { background: #fecaca; }

        .form-footer {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .submit-btn {
          flex: 2;
          padding: 16px;
          background: #4f46e5;
          color: white;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.4);
          background: #4338ca;
        }

        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .cancel-btn {
          flex: 1;
          padding: 16px;
          background: white;
          color: #64748b;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s;
        }
        .cancel-btn:hover { background: #f8fafc; color: #1e293b; }

        @media (max-width: 768px) {
          .input-row { flex-direction: column; }
          .window-item { flex-direction: column; align-items: stretch; }
          .form-footer { flex-direction: column; }
        }
      `}</style>
      </div>
    </DynamicLayout>
  );
};

export default ManageFacility;

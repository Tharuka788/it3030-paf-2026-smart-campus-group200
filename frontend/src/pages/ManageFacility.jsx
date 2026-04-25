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
  const [errors, setErrors] = useState({});

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

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Facility name is required.';
    if (formData.type !== 'EQUIPMENT' && !formData.location.trim()) newErrors.location = 'Location is required.';
    if (!formData.capacity) {
      newErrors.capacity = 'Capacity is required.';
    } else if (parseInt(formData.capacity) < 1) {
      newErrors.capacity = 'Capacity must be at least 1.';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Clear error for this field as user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
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

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // stop submission
    }

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
              <div className="input-group">
                <label><Box size={18} /> Facility Name <span className="required-star">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Auditorium A"
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>
              <div className="input-group">
                <label><Tag size={18} /> Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="ROOM">Meeting Room</option>
                    <option value="LECTURE_HALL">Lecture Hall</option>
                    <option value="LAB">Laboratory / PC Lab</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="AUDITORIUM">Auditorium</option>
                    <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="input-row three-col">
              {formData.type !== 'EQUIPMENT' && (
                <div className="input-group">
                  <label><MapPin size={18} /> Location <span className="required-star">*</span></label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Building 1, 3rd Floor"
                    className={errors.location ? 'input-error' : ''}
                  />
                  {errors.location && <span className="error-msg">{errors.location}</span>}
                </div>
              )}
              <div className="input-group">
                <label><Info size={18} /> {formData.type === 'EQUIPMENT' ? 'Quantity' : 'Capacity'} <span className="required-star">*</span></label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder={formData.type === 'EQUIPMENT' ? 'e.g. 10' : 'e.g. 50'}
                  min="1"
                  className={errors.capacity ? 'input-error' : ''}
                />
                {errors.capacity && <span className="error-msg">{errors.capacity}</span>}
              </div>
              <div className="input-group">
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
          max-width: 1000px;
          margin: 0 auto;
          padding: 10px 20px 60px 20px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #6366f1;
          font-weight: 700;
          background: #f5f3ff;
          border: none;
          padding: 10px 18px;
          border-radius: 12px;
          margin-bottom: 25px;
          cursor: pointer;
          transition: all 0.3s;
          width: fit-content;
        }

        .back-btn:hover { 
          transform: translateX(-5px); 
          background: #e0e7ff; 
        }

        .form-card {
          padding: 45px;
          background: white;
          border: 1px solid #f1f5f9;
          border-radius: 28px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);
          position: relative;
          overflow: hidden;
        }

        .form-header {
          margin-bottom: 40px;
          padding-bottom: 25px;
          border-bottom: 1px solid #f1f5f9;
        }

        .form-header h2 {
          font-size: 2.4rem;
          font-weight: 850;
          margin-bottom: 10px;
          letter-spacing: -0.02em;
        }

        .text-muted { color: #64748b; font-size: 1.05rem; }

        .booking-form {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
        }

        .input-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 25px;
        }

        .input-row.three-col {
          grid-template-columns: 2fr 1fr 1fr;
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
          color: #1e293b;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .input-group label svg {
          color: #94a3b8;
        }

        input, textarea, select {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px 18px;
          color: #1e293b;
          font-family: inherit;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        input:focus, textarea:focus, select:focus {
          outline: none;
          border-color: #6366f1;
          background: white;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
          transform: translateY(-1px);
        }

        input.input-error {
          border-color: #ef4444;
          background: #fff5f5;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .error-msg {
          color: #ef4444;
          font-size: 0.82rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: -4px;
        }

        .required-star {
          color: #ef4444;
          margin-left: 2px;
        }

        textarea {
          resize: vertical;
          min-height: 120px;
        }

        .availability-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 30px;
          margin-top: 10px;
        }

        .availability-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .availability-header label {
          display: flex;
          align-items: center;
          gap: 12px;
          font-weight: 800;
          font-size: 1.1rem;
          color: #0f172a;
        }

        .add-window-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #6366f1;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 700;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }
        
        .add-window-btn:hover { 
          transform: translateY(-2px);
          background: #4f46e5;
          box-shadow: 0 8px 15px rgba(99, 102, 241, 0.3);
        }

        .no-windows { 
          color: #94a3b8; 
          font-size: 0.95rem; 
          text-align: center; 
          padding: 20px;
          border: 2px dashed #e2e8f0;
          border-radius: 14px;
        }

        .windows-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .window-item {
          display: grid;
          grid-template-columns: 2fr 1fr auto 1fr auto;
          align-items: center;
          gap: 15px;
          background: white;
          padding: 15px 20px;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .window-item select, .window-item input {
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 0.95rem;
          background: #fff;
        }
        
        .to-text { color: #94a3b8; font-weight: 700; font-size: 0.9rem; }
        
        .del-btn {
          color: #ef4444; 
          width: 40px;
          height: 40px;
          border-radius: 10px; 
          background: #fef2f2; 
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          border: 1px solid #fee2e2;
        }
        .del-btn:hover { 
          background: #ef4444; 
          color: white; 
          transform: scale(1.05);
        }

        .form-footer {
          display: flex;
          gap: 20px;
          padding-top: 20px;
          margin-top: 10px;
          border-top: 1px solid #f1f5f9;
        }

        .submit-btn {
          flex: 2;
          padding: 18px;
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 16px;
          font-weight: 800;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 20px 30px -10px rgba(99, 102, 241, 0.5);
          background: #4f46e5;
        }

        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .cancel-btn {
          flex: 1;
          padding: 18px;
          background: white;
          color: #64748b;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          font-weight: 700;
          transition: all 0.3s;
        }
        .cancel-btn:hover { background: #f8fafc; color: #1e293b; border-color: #cbd5e1; }

        .loading-state {
          padding: 60px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f1f5f9;
          border-top: 4px solid #6366f1;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .input-row, .input-row.three-col { grid-template-columns: 1fr; }
          .window-item { grid-template-columns: 1fr; }
          .form-footer { flex-direction: column; }
          .form-card { padding: 25px; }
        }
      `}</style>
      </div>
    </DynamicLayout>
  );
};

export default ManageFacility;

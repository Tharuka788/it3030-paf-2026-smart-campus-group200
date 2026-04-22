import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  AlertCircle, 
  ChevronLeft, 
  User, 
  Building, 
  Phone, 
  Mail, 
  Tag, 
  Layers, 
  AlertOctagon, 
  Activity, 
  Paperclip,
  CheckCircle2,
  X,
  FileText
} from 'lucide-react';
import { ticketService } from '../services/api';

const Section = ({ title, icon: Icon, children }) => (
  <motion.div 
    className="form-section glass-morphism"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="section-title">
      <Icon size={20} className="section-icon" />
      <h3>{title}</h3>
    </div>
    <div className="section-content">
      {children}
    </div>
  </motion.div>
);

const NewTicket = () => {
  const [formData, setFormData] = useState({
    subject: '',
    detailedDescription: '',
    userName: localStorage.getItem('userName') || '',
    departmentName: '',
    contactNumber: '',
    email: localStorage.getItem('userEmail') || '',
    category: '',
    subcategory: '',
    priority: 'MEDIUM',
    impact: 'INDIVIDUAL'
  });

  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const categories = {
    'IT Support': ['Network/Wi-Fi', 'Hardware', 'Software', 'Account Access', 'Security'],
    'Maintenance': ['Electrical', 'Plumbing', 'HVAC', 'Furniture', 'Civil'],
    'Administration': ['Fees/Finance', 'Exams/Results', 'Records', 'Logistics'],
    'Facilities': ['Cleaning', 'Room Setup', 'Equipment', 'Events']
  };

  const impacts = ['INDIVIDUAL', 'DEPARTMENT', 'ORGANIZATION'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'category' ? { subcategory: '' } : {})
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check if adding these would exceed the limit of 3
    const potentialTotal = attachments.length + files.length;
    if (potentialTotal > 3) {
      alert('You can only upload a maximum of 3 attachments.');
      return;
    }

    const validFiles = files.filter(file => {
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      const isValidType = file.type === 'image/png';
      return isValidSize && isValidType;
    });

    if (validFiles.length !== files.length) {
      alert('Only PNG files under 5MB are allowed.');
    }

    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

    if (!emailRegex.test(formData.email)) return "Invalid email format.";
    if (formData.contactNumber && !phoneRegex.test(formData.contactNumber)) return "Invalid contact number format.";
    if (!formData.category || !formData.subcategory) return "Please select both category and subcategory.";
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      
      // Append all text fields
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });

      // Append files
      attachments.forEach(file => {
        data.append('files', file);
      });

      await ticketService.createTicket(data);
      setSuccess(true);
      setTimeout(() => navigate('/tickets/my'), 2000);
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Failed to create ticket. Please try again.';
      setError(serverMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div className="success-overlay">
          <motion.div 
            className="success-card glass-morphism"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <CheckCircle2 size={64} color="#10b981" />
            <h2>Ticket Submitted!</h2>
            <p>Your request has been successfully created. Redirecting to your tickets list...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="new-ticket-overhaul">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <header className="page-header">
          <h1 className="gradient-text">New Infrastructure Support Ticket</h1>
          <p>Please provide detailed information to help us resolve your issue faster.</p>
        </header>

        <form onSubmit={handleSubmit} className="overhauled-form">
          {error && (
            <motion.div 
              className="error-banner"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
              <X size={18} className="close-err" onClick={() => setError(null)} />
            </motion.div>
          )}

          <div className="form-stack">
            <Section title="1. Basic Information" icon={FileText}>
              <div className="input-group">
                <label>Subject (Short Description) *</label>
                <input 
                  type="text" 
                  name="subject"
                  required
                  placeholder="e.g., Room 302 Projector not working"
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label>Detailed Description *</label>
                <textarea 
                  name="detailedDescription"
                  rows="6"
                  required
                  placeholder="Provide exact details of the incident or request..."
                  value={formData.detailedDescription}
                  onChange={handleChange}
                ></textarea>
              </div>
            </Section>

            <Section title="2. User Details" icon={User}>
              <div className="form-row">
                <div className="input-group">
                  <label><User size={16} /> Full Name *</label>
                  <input 
                    type="text" 
                    name="userName"
                    required
                    value={formData.userName}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label><Building size={16} /> Department *</label>
                  <input 
                    type="text" 
                    name="departmentName"
                    required
                    placeholder="e.g., Computer Science"
                    value={formData.departmentName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="input-group">
                  <label><Phone size={16} /> Contact Number *</label>
                  <input 
                    type="text" 
                    name="contactNumber"
                    required
                    placeholder="e.g., +94 77 123 4567"
                    value={formData.contactNumber}
                    onChange={handleChange}
                  />
                </div>
                <div className="input-group">
                  <label><Mail size={16} /> Email Address *</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </Section>

            <Section title="3. Ticket Classification" icon={Tag}>
              <div className="form-row">
                <div className="input-group">
                  <label><Tag size={16} /> Category *</label>
                  <select 
                    name="category" 
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {Object.keys(categories).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label><Layers size={16} /> Subcategory *</label>
                  <select 
                    name="subcategory" 
                    value={formData.subcategory}
                    onChange={handleChange}
                    required
                    disabled={!formData.category}
                  >
                    <option value="">Select Subcategory</option>
                    {formData.category && categories[formData.category].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            </Section>

            <Section title="4. Priority & Impact" icon={AlertOctagon}>
              <div className="form-row">
                <div className="input-group">
                  <label><AlertOctagon size={16} /> Priority *</label>
                  <select 
                    name="priority" 
                    value={formData.priority}
                    onChange={handleChange}
                    required
                  >
                    {priorities.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label><Activity size={16} /> Impact *</label>
                  <select 
                    name="impact" 
                    value={formData.impact}
                    onChange={handleChange}
                    required
                  >
                    {impacts.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>
            </Section>

            <Section title="5. Attachments" icon={Paperclip}>
              <div className="upload-container">
                <label className="upload-trigger">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange}
                    className="hidden-input"
                  />
                  <div className="upload-box">
                    <Paperclip size={32} />
                    <span>Click to upload or drag files here</span>
                    <small>Max 3 PNG files (Max 5MB each)</small>
                  </div>
                </label>
                <div className="attachment-list">
                  <AnimatePresence>
                    {attachments.map((file, idx) => (
                      <motion.div 
                        key={idx}
                        className="attachment-item"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                      >
                        <div className="file-info">
                          <FileText size={18} />
                          <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <X size={16} className="remove-file" onClick={() => removeFile(idx)} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </Section>

            <button type="submit" className="huge-submit-btn" disabled={loading}>
              {loading ? 'Processing...' : (
                <>
                  <Send size={24} /> Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx="true">{`
        .new-ticket-overhaul {
          max-width: 900px;
          margin: 0 auto;
          padding-bottom: 80px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-weight: 600;
          background: none;
          border: none;
          cursor: pointer;
          margin-bottom: 20px;
          transition: color 0.3s;
        }
        .back-btn:hover { color: #6366f1; }

        .page-header { margin-bottom: 40px; }
        .page-header h1 { font-size: 2.8rem; font-weight: 850; margin-bottom: 10px; }
        .page-header p { color: #64748b; font-size: 1.1rem; }

        .form-stack {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .form-section {
          background: white;
          border-radius: 24px;
          padding: 30px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 25px;
          color: #334155;
        }
        .section-icon { color: #6366f1; }
        .section-title h3 { font-size: 1.2rem; font-weight: 700; margin: 0; }

        .section-content { display: flex; flex-direction: column; gap: 20px; }

        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group label { 
          font-weight: 600; 
          color: #475569; 
          font-size: 0.9rem; 
          display: flex; 
          align-items: center; 
          gap: 8px;
        }

        input, select, textarea {
          padding: 14px 18px;
          border-radius: 12px;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          font-size: 1rem;
          color: #1e293b;
          transition: all 0.3s;
        }
        input:focus, select:focus, textarea:focus { 
          border-color: #6366f1; 
          background: white;
          box-shadow: 0 0 0 5px rgba(99, 102, 241, 0.08); 
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* Upload Styling */
        .hidden-input { display: none; }
        .upload-trigger { cursor: pointer; }
        .upload-box {
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          color: #64748b;
          background: #f8fafc;
          transition: all 0.3s;
        }
        .upload-box:hover { border-color: #6366f1; background: #f5f3ff; color: #6366f1; }
        .upload-box span { font-weight: 700; }
        .upload-box small { opacity: 0.7; }

        .attachment-list { margin-top: 20px; display: flex; flex-direction: column; gap: 10px; }
        .attachment-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: #f1f5f9;
          border-radius: 10px;
          color: #334155;
          font-size: 0.9rem;
        }
        .file-info { display: flex; align-items: center; gap: 10px; font-weight: 600; }
        .remove-file { color: #94a3b8; cursor: pointer; transition: color 0.2s; }
        .remove-file:hover { color: #ef4444; }

        .error-banner {
          background: #fee2e2;
          color: #b91c1c;
          padding: 16px 20px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 30px;
          border: 1.5px solid #fecaca;
        }
        .close-err { margin-left: auto; cursor: pointer; opacity: 0.6; }

        .huge-submit-btn {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          padding: 24px;
          border-radius: 20px;
          font-weight: 850;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;
          border: none;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
          margin-top: 10px;
          width: 100%;
        }
        .huge-submit-btn:hover:not(:disabled) { 
          transform: translateY(-5px); 
          box-shadow: 0 15px 35px rgba(99, 102, 241, 0.4); 
        }
        .huge-submit-btn:disabled { opacity: 0.7; transform: none !important; }

        .success-overlay {
          height: calc(100vh - 200px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .success-card {
          background: white;
          padding: 60px;
          border-radius: 32px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
        .success-card h2 { font-size: 2.2rem; font-weight: 850; margin: 0; color: #1e293b; }
        .success-card p { color: #64748b; font-size: 1.1rem; line-height: 1.6; }

        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </Layout>
  );
};

export default NewTicket;

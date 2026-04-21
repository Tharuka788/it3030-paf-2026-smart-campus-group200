import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Edit2, Trash2, MapPin, Users, Tag, Box, Calendar } from 'lucide-react';
import { facilityService } from '../services/api';

const FacilitiesCatalogue = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', minCapacity: '', location: '' });
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');

  const fetchFacilities = async () => {
    setLoading(true);
    try {
      const { data } = await facilityService.getAllFacilities(filters);
      setFacilities(data);
    } catch (error) {
      console.error('Failed to fetch facilities:', error);
      alert('Failed to load facilities. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, [filters.type]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFacilities();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      try {
        await facilityService.deleteFacility(id);
        setFacilities(facilities.filter(f => f.id !== id));
      } catch (error) {
        console.error('Failed to delete facility:', error);
        alert('Failed to delete facility.');
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <div className="catalogue-container">
        <div className="catalogue-header">
          <div>
            <h1 className="charcoal-text">Facilities & Assets</h1>
            <p className="charcoal-muted">Browse and manage available resources.</p>
          </div>
          {userRole === 'ROLE_ADMIN' && (
            <button 
              className="add-btn"
              onClick={() => navigate('/facilities/manage')}
            >
              <Plus size={20} />
              <span>Add Facility</span>
            </button>
          )}
        </div>

        <form className="search-bar glass-morphism" onSubmit={handleSearch}>
          <div className="search-input-group">
            <Search size={20} className="icon" />
            <input 
              type="text" 
              placeholder="Search by location..." 
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            />
          </div>
          <select 
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
          >
            <option value="">All Types</option>
            <option value="ROOM">Room</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Laboratory</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
          <input 
            type="number" 
            placeholder="Min Capacity" 
            value={filters.minCapacity}
            onChange={(e) => setFilters({...filters, minCapacity: e.target.value})}
          />
          <button type="submit" className="filter-btn">
            <Filter size={18} /> Filter
          </button>
        </form>

        {loading ? (
          <div className="loading-state">Loading facilities...</div>
        ) : (
          <motion.div 
            className="facilities-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {facilities.length === 0 ? (
              <div className="empty-state">No facilities found. Try adjusting filters or adding a new one.</div>
            ) : (
              facilities.map((fac) => (
                <motion.div key={fac.id} variants={cardVariants} className="facility-card glass-morphism">
                  <div className="card-header">
                    <h3>{fac.name}</h3>
                    <span className={`status-badge ${['ACTIVE', 'IN_STOCK'].includes(fac.status) ? 'active' : 'inactive'}`}>
                      {fac.status.replaceAll('_', ' ')}
                    </span>
                  </div>
                  <div className="card-body">
                    <p><Tag size={16} /> {fac.type.replace('_', ' ')}</p>
                    {fac.type !== 'EQUIPMENT' && <p><MapPin size={16} /> {fac.location || 'N/A'}</p>}
                    {fac.type === 'EQUIPMENT' ? (
                      <p><Box size={16} /> Quantity: {fac.capacity || 'N/A'}</p>
                    ) : (
                      <p><Users size={16} /> Capacity: {fac.capacity || 'N/A'}</p>
                    )}
                  </div>
                  <div className="card-footer">
                    {(() => {
                      const type = fac.type?.toUpperCase().replace(/[\s_]/g, '');
                      const isLectureHall = type === 'LECTUREHALL';
                      
                      return isLectureHall ? (
                        <button 
                          onClick={() => {
                            console.log('Navigating to Hall Booking for:', fac.id);
                            navigate(`/bookings/hall?id=${fac.id}`);
                          }} 
                          className="action-btn book"
                        >
                          <Calendar size={16} /> Book
                        </button>
                      ) : (
                        <button 
                          onClick={() => navigate(`/bookings/new?resourceId=${fac.id}`)} 
                          className="action-btn book-generic"
                        >
                          <Calendar size={16} /> Book
                        </button>
                      );
                    })()}
                    {userRole === 'ROLE_ADMIN' && (
                      <>
                        <button onClick={() => navigate(`/facilities/manage?id=${fac.id}`)} className="action-btn edit">
                          <Edit2 size={16} /> Edit
                        </button>
                        <button onClick={() => handleDelete(fac.id)} className="action-btn delete">
                          <Trash2 size={16} /> Delete
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>

      <style jsx="true">{`
        .catalogue-container {
          padding-bottom: 50px;
          color: #334155;
        }

        .catalogue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 35px;
        }

        .catalogue-header h1.charcoal-text {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 5px;
          color: #334155;
        }

        .charcoal-muted {
          color: #64748b;
          font-size: 1.1rem;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #0ea5e9;
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(14, 165, 233, 0.2);
          transition: all 0.3s;
        }

        .add-btn:hover {
          background: #0284c7;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(14, 165, 233, 0.3);
        }

        .search-bar {
          display: grid;
          grid-template-columns: 1.5fr 1fr 120px auto;
          gap: 15px;
          padding: 15px;
          border-radius: 20px;
          margin-bottom: 40px;
          align-items: center;
          background: white;
          box-shadow: var(--box-shadow);
          border: 1px solid var(--glass-border);
        }

        .search-input-group {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          padding: 12px 20px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .search-input-group .icon {
          color: var(--text-muted);
        }

        .search-input-group input {
          flex: 1;
          background: transparent;
          border: none;
          color: #334155;
          outline: none;
          font-weight: 500;
        }

        .search-bar select, .search-bar input[type="number"] {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #334155;
          padding: 12px 20px;
          border-radius: 12px;
          outline: none;
          font-weight: 500;
        }
        
        .search-bar select option {
          background: var(--bg-card);
        }

        .filter-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #f1f5f9;
          color: #334155;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s;
          border: 1px solid #e2e8f0;
        }
        
        .filter-btn:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .facilities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .facility-card {
          padding: 24px;
          border-radius: 20px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          border: 1px solid #f1f5f9;
          box-shadow: var(--box-shadow);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .facility-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--box-shadow-hover);
          border-color: #e2e8f0;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .card-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
          color: #334155;
        }

        .status-badge {
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-badge.active { background: #dcfce7; color: #10b981; }
        .status-badge.inactive { background: #fee2e2; color: #ef4444; }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .card-body p {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #64748b;
          font-size: 0.95rem;
          margin: 0;
        }

        .card-footer {
          margin-top: auto;
          display: flex;
          gap: 10px;
          padding-top: 20px;
          border-top: 1px solid #f1f5f9;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .action-btn.edit {
          background: #f1f5f9;
          color: #6366f1;
        }
        
        .action-btn.edit:hover { background: #e2e8f0; }

        .action-btn.delete {
          background: #fff1f2;
          color: #ef4444;
        }
        
        .action-btn.delete:hover { background: #ffe4e6; }
        
        .action-btn.book {
          background: #f0fdf4;
          color: #10b981;
        }
        .action-btn.book:hover { background: #dcfce7; }

        .action-btn.book-generic {
          background: #fffbeb;
          color: #d97706;
        }
        .action-btn.book-generic:hover { background: #fef3c7; }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          background: #f8fafc;
          border-radius: 20px;
          border: 1px dashed #cbd5e1;
          color: #64748b;
        }
        
        .loading-state {
          text-align: center;
          padding: 40px;
          color: var(--primary);
        }

        @media (max-width: 900px) {
          .catalogue-header {
            flex-direction: column;
            gap: 20px;
          }
          
          .search-bar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
};

export default FacilitiesCatalogue;

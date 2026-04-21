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
            <h1 className="gradient-text">Facilities & Assets</h1>
            <p>Browse and manage available resources.</p>
          </div>
          <button 
            className="add-btn"
            onClick={() => navigate('/facilities/manage')}
          >
            <Plus size={20} />
            <span>Add Facility</span>
          </button>
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
                    <button onClick={() => navigate(`/facilities/manage?id=${fac.id}`)} className="action-btn edit">
                      <Edit2 size={16} /> Edit
                    </button>
                    <button onClick={() => handleDelete(fac.id)} className="action-btn delete">
                      <Trash2 size={16} /> Delete
                    </button>
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
        }

        .catalogue-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
        }
        
        .catalogue-header h1 {
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 5px;
        }
        
        .catalogue-header p {
          color: var(--text-muted);
          font-size: 1.1rem;
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
          transition: all 0.3s;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
        }

        .search-bar {
          display: grid;
          grid-template-columns: 1fr auto auto auto;
          gap: 15px;
          padding: 15px;
          border-radius: 16px;
          margin-bottom: 30px;
          align-items: center;
        }

        .search-input-group {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0, 0, 0, 0.3);
          padding: 12px 20px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .search-input-group .icon {
          color: var(--text-muted);
        }

        .search-input-group input {
          flex: 1;
          background: transparent;
          border: none;
          color: white;
          outline: none;
        }

        .search-bar select, .search-bar input[type="number"] {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255,255,255,0.05);
          color: white;
          padding: 12px 20px;
          border-radius: 10px;
          outline: none;
        }
        
        .search-bar select option {
          background: var(--bg-card);
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 12px 20px;
          border-radius: 10px;
          font-weight: 500;
          transition: background 0.3s;
        }
        
        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .facilities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .facility-card {
          padding: 24px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          transition: all 0.3s;
        }

        .facility-card:hover {
          border-color: var(--primary);
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          transform: translateY(-5px);
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
        }

        .status-badge {
          font-size: 0.75rem;
          padding: 4px 10px;
          border-radius: 6px;
          font-weight: 600;
          white-space: nowrap;
        }

        .status-badge.active { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .status-badge.inactive { background: rgba(239, 68, 68, 0.15); color: #f87171; }

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
          color: var(--text-muted);
          font-size: 0.95rem;
          margin: 0;
        }

        .card-footer {
          margin-top: auto;
          display: flex;
          gap: 10px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.05);
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
          background: rgba(99, 102, 241, 0.1);
          color: #818cf8;
        }
        
        .action-btn.edit:hover { background: rgba(99, 102, 241, 0.2); }

        .action-btn.delete {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }
        
        .action-btn.delete:hover { background: rgba(239, 68, 68, 0.2); }
        
        .action-btn.book {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
        }
        .action-btn.book:hover { background: rgba(16, 185, 129, 0.2); }

        .action-btn.book-generic {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }
        .action-btn.book-generic:hover { background: rgba(245, 158, 11, 0.2); }

        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 60px 20px;
          background: rgba(255,255,255,0.02);
          border-radius: 16px;
          border: 1px dashed rgba(255,255,255,0.1);
          color: var(--text-muted);
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

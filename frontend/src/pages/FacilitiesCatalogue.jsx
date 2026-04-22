import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Plus, Edit2, Trash2, MapPin, Users, 
  Tag, Box, Calendar, Monitor, LayoutGrid, List, 
  Mic, GraduationCap, Laptop, Camera, ChevronRight 
} from 'lucide-react';
import { facilityService } from '../services/api';

const FacilitiesCatalogue = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('overview'); // 'overview' or 'list'
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
    if (viewMode === 'overview') setViewMode('list');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      try {
        await facilityService.deleteFacility(id);
        setFacilities(facilities.filter(f => f.id !== id));
      } catch (error) {
        console.error('Failed to delete facility:', error);
      }
    }
  };

  // Grouping logic for Overview
  const categories = useMemo(() => {
    const groups = {
      LECTURE_HALL: { 
        title: 'Lecture Halls', 
        icon: <GraduationCap size={32} />, 
        color: '#6366f1', 
        count: 0, 
        available: 0 
      },
      LAB: { 
        title: 'PC Labs', 
        icon: <Laptop size={32} />, 
        color: '#0ea5e9', 
        count: 0, 
        available: 0 
      },
      EQUIPMENT: { 
        title: 'Equipment', 
        icon: <Camera size={32} />, 
        color: '#f59e0b', 
        count: 0, 
        available: 0 
      },
      ROOM: { 
        title: 'Meeting Rooms', 
        icon: <Users size={32} />, 
        color: '#10b981', 
        count: 0, 
        available: 0 
      }
    };

    facilities.forEach(fac => {
      if (groups[fac.type]) {
        groups[fac.type].count++;
        if (['ACTIVE', 'IN_STOCK'].includes(fac.status)) {
          groups[fac.type].available++;
        }
      }
    });

    return Object.entries(groups).map(([type, data]) => ({ type, ...data }));
  }, [facilities]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="catalogue-container">
      <div className="catalogue-header">
        <div>
          <h1 className="gradient-text">Facilities Overview</h1>
          <p className="text-muted">Manage and monitor campus resources.</p>
        </div>
        <div className="header-actions">
          <div className="view-toggle glass-morphism">
            <button 
              className={viewMode === 'overview' ? 'active' : ''} 
              onClick={() => setViewMode('overview')}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              className={viewMode === 'list' ? 'active' : ''} 
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
          {userRole === 'ROLE_ADMIN' && (
            <button className="add-btn" onClick={() => navigate('/admin/facilities')}>
              <Plus size={20} />
              <span>Add New</span>
            </button>
          )}
        </div>
      </div>

      <form className="search-bar glass-morphism" onSubmit={handleSearch}>
        <div className="search-input-group">
          <Search size={20} className="icon" />
          <input 
            type="text" 
            placeholder="Search facilities..." 
            value={filters.location}
            onChange={(e) => setFilters({...filters, location: e.target.value})}
          />
        </div>
        <select 
          value={filters.type}
          onChange={(e) => {
            setFilters({...filters, type: e.target.value});
            if (e.target.value) setViewMode('list');
          }}
        >
          <option value="">All Types</option>
          <option value="ROOM">Meeting Rooms</option>
          <option value="LECTURE_HALL">Lecture Halls</option>
          <option value="LAB">Laboratories</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>
        <button type="submit" className="filter-btn">
          <Filter size={18} /> Filter
        </button>
      </form>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Fetching resources...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'overview' ? (
            <motion.div 
              key="overview"
              className="categories-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20 }}
            >
              {categories.map((cat) => (
                <motion.div 
                  key={cat.type} 
                  variants={cardVariants} 
                  className="category-card glass-morphism"
                  onClick={() => {
                    setFilters({...filters, type: cat.type});
                    setViewMode('list');
                  }}
                >
                  <div className="cat-icon-wrapper" style={{ background: `${cat.color}15`, color: cat.color }}>
                    {cat.icon}
                  </div>
                  <div className="cat-info">
                    <h3>{cat.title}</h3>
                    <p className="status-indicator">
                      <span className="dot" style={{ background: cat.available > 0 ? '#10b981' : '#ef4444' }}></span>
                      {cat.available} {cat.type === 'EQUIPMENT' ? 'Items Ready' : 'Available'}
                    </p>
                  </div>
                  <div className="cat-arrow">
                    <ChevronRight size={24} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              className="facilities-grid"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
            >
              {facilities.length === 0 ? (
                <div className="empty-state">
                  <Box size={48} />
                  <p>No facilities found matching your criteria.</p>
                  <button onClick={() => setFilters({ type: '', minCapacity: '', location: '' })}>Clear Filters</button>
                </div>
              ) : (
                facilities.map((fac) => (
                  <motion.div key={fac.id} variants={cardVariants} className="facility-card glass-morphism">
                    <div className="card-header">
                      <div>
                        <h3>{fac.name}</h3>
                        <span className="location-tag"><MapPin size={12} /> {fac.location || 'Main Campus'}</span>
                      </div>
                      <span className={`status-badge ${['ACTIVE', 'IN_STOCK'].includes(fac.status) ? 'active' : 'inactive'}`}>
                        {fac.status.replaceAll('_', ' ')}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="info-item">
                        <Tag size={16} />
                        <span>{fac.type.replace('_', ' ')}</span>
                      </div>
                      <div className="info-item">
                        {fac.type === 'EQUIPMENT' ? <Box size={16} /> : <Users size={16} />}
                        <span>{fac.type === 'EQUIPMENT' ? `Qty: ${fac.capacity || 0}` : `Capacity: ${fac.capacity || 0}`}</span>
                      </div>
                    </div>
                    <div className="card-footer">
                      <button 
                        className="btn-book"
                        onClick={() => navigate(`/bookings/new?resourceId=${fac.id}`)}
                      >
                        Book Now
                      </button>
                      {userRole === 'ROLE_ADMIN' && (
                        <div className="admin-actions">
                          <button onClick={() => navigate(`/admin/facilities?id=${fac.id}`)} className="icon-btn edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(fac.id)} className="icon-btn delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <style jsx="true">{`
        .catalogue-container {
          padding: 20px 0 60px 0;
        }

        .catalogue-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .catalogue-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 5px;
          letter-spacing: -0.02em;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .view-toggle {
          display: flex;
          padding: 5px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 12px;
        }

        .view-toggle button {
          padding: 8px 12px;
          border-radius: 8px;
          color: #64748b;
          transition: all 0.3s;
        }

        .view-toggle button.active {
          background: white;
          color: #4f46e5;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #4f46e5;
          color: white;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          box-shadow: 0 8px 16px -4px rgba(79, 70, 229, 0.3);
          transition: all 0.3s;
        }

        .add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px -4px rgba(79, 70, 229, 0.4);
        }

        .search-bar {
          display: grid;
          grid-template-columns: 2fr 1fr auto;
          gap: 15px;
          padding: 12px;
          margin-bottom: 40px;
          background: rgba(255, 255, 255, 0.7);
        }

        .search-input-group {
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          padding: 10px 15px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .search-input-group input {
          border: none;
          outline: none;
          width: 100%;
          font-weight: 500;
          color: #1e293b;
        }

        .search-bar select {
          padding: 10px 15px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: white;
          font-weight: 500;
          outline: none;
        }

        .filter-btn {
          background: #1e293b;
          color: white;
          padding: 0 25px;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Categories Grid */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 25px;
        }

        .category-card {
          display: flex;
          align-items: center;
          padding: 30px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .category-card:hover {
          transform: translateY(-5px);
          background: white;
          box-shadow: 0 20px 40px -12px rgba(0,0,0,0.1);
        }

        .cat-icon-wrapper {
          width: 70px;
          height: 70px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 20px;
        }

        .cat-info h3 {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 6px;
          color: #1e293b;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: #10b981;
          font-size: 0.95rem;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .cat-arrow {
          margin-left: auto;
          color: #cbd5e1;
          transition: transform 0.3s;
        }

        .category-card:hover .cat-arrow {
          transform: translateX(5px);
          color: #4f46e5;
        }

        /* Facilities Grid */
        .facilities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 25px;
        }

        .facility-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          box-shadow: var(--box-shadow);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .card-header h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 4px;
        }

        .location-tag {
          font-size: 0.85rem;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .status-badge {
          font-size: 0.7rem;
          padding: 4px 10px;
          border-radius: 20px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .status-badge.active { background: #dcfce7; color: #059669; }
        .status-badge.inactive { background: #fee2e2; color: #dc2626; }

        .card-body {
          margin-bottom: 25px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #475569;
          font-weight: 500;
        }

        .card-footer {
          display: flex;
          gap: 10px;
          margin-top: auto;
        }

        .btn-book {
          flex: 1;
          background: #4f46e5;
          color: white;
          padding: 10px;
          border-radius: 10px;
          font-weight: 600;
          transition: all 0.3s;
        }

        .btn-book:hover {
          background: #4338ca;
        }

        .admin-actions {
          display: flex;
          gap: 8px;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          transition: all 0.3s;
        }

        .icon-btn.edit { background: #f1f5f9; color: #6366f1; }
        .icon-btn.edit:hover { background: #e2e8f0; }
        .icon-btn.delete { background: #fff1f2; color: #ef4444; }
        .icon-btn.delete:hover { background: #fecaca; }

        .empty-state {
          grid-column: 1 / -1;
          padding: 80px;
          text-align: center;
          color: #64748b;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .loading-state {
          padding: 100px;
          text-align: center;
        }

        @media (max-width: 768px) {
          .catalogue-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .search-bar { grid-template-columns: 1fr; }
          .categories-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default FacilitiesCatalogue;

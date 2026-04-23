import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DynamicLayout from '../components/DynamicLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Plus, Edit2, Trash2, MapPin, Users, 
  Tag, Box, Calendar, Monitor, LayoutGrid, List, 
  Mic, GraduationCap, Laptop, Camera, ChevronRight,
  Video, ChevronLeft, ArrowRight
} from 'lucide-react';
import { facilityService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const FacilitiesCatalogue = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', minCapacity: '', location: '' });
  const [selectedCategory, setSelectedCategory] = useState(null);
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

  const categories = [
    { 
      id: 'auditorium', 
      title: 'Main Auditorium', 
      icon: <Mic size={32} />, 
      color: '#3b82f6',
      countSuffix: 'Available',
      filter: (f) => f.type === 'LECTURE_HALL' && f.name.includes('Auditorium')
    },
    { 
      id: 'lecture_halls', 
      title: 'Lecture Halls', 
      icon: <GraduationCap size={32} />, 
      color: '#10b981',
      countSuffix: 'Halls Available',
      filter: (f) => f.type === 'LECTURE_HALL' && !f.name.includes('Auditorium')
    },
    { 
      id: 'pc_labs', 
      title: 'PC Labs', 
      icon: <Monitor size={32} />, 
      color: '#6366f1',
      countSuffix: 'Workstations Online',
      filter: (f) => f.type === 'LAB'
    },
    { 
      id: 'equipment', 
      title: 'Equipment', 
      icon: <Video size={32} />, 
      color: '#f59e0b',
      countSuffix: 'Items Ready',
      filter: (f) => f.type === 'EQUIPMENT'
    }
  ];

  const filteredFacilities = selectedCategory 
    ? facilities.filter(categories.find(c => c.id === selectedCategory).filter)
    : facilities;

  const getCategoryCount = (category) => {
    const items = facilities.filter(category.filter);
    if (category.id === 'pc_labs' || category.id === 'equipment') {
      return items.reduce((sum, item) => sum + (item.capacity || 0), 0);
    }
    return items.length;
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
    <DynamicLayout>
      <div className="catalogue-container">
        <div className="catalogue-header">
          <div>
            {selectedCategory ? (
              <button className="back-link" onClick={() => setSelectedCategory(null)}>
                <ChevronLeft size={18} /> Back to Overview
              </button>
            ) : null}
            <h1 className="gradient-text">
              {selectedCategory 
                ? categories.find(c => c.id === selectedCategory).title 
                : 'Campus Facilities'}
            </h1>
            <p className="text-muted">
              {selectedCategory 
                ? `Explore and reserve ${categories.find(c => c.id === selectedCategory).title.toLowerCase()} resources.`
                : 'Manage and reserve campus academic and technical resources.'}
            </p>
          </div>
          {userRole === 'ROLE_ADMIN' && (
            <button className="add-btn" onClick={() => navigate('/admin/facilities')}>
              <Plus size={20} /> Add Facility
            </button>
          )}
        </div>

        {!selectedCategory ? (
          <div className="category-grid">
            {categories.map((cat, idx) => (
              <motion.div 
                key={cat.id}
                className="category-card glass-morphism"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <div className="category-icon-wrapper" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                  {cat.icon}
                </div>
                <div className="category-info">
                  <h2>{cat.title}</h2>
                  <div className="category-stat">
                    <span className="dot" style={{ backgroundColor: cat.color }}></span>
                    {getCategoryCount(cat)} {cat.countSuffix}
                  </div>
                </div>
                <div className="category-arrow">
                  <ArrowRight size={24} />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <>
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
              <div className="spinner"></div>
            ) : (
              <motion.div 
                className="facilities-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredFacilities.length === 0 ? (
                  <div className="empty-state">No facilities found in this category.</div>
                ) : (
                  filteredFacilities.map((fac) => (
                    <motion.div key={fac.id} variants={cardVariants} className="facility-card glass-morphism">
                      <div className="card-header">
                        <h3>{fac.name}</h3>
                        <span className={`status-badge ${['ACTIVE', 'IN_STOCK'].includes(fac.status) ? 'active' : 'inactive'}`}>
                          {fac.status.replaceAll('_', ' ')}
                        </span>
                      </div>
                      <div className="card-body">
                        <p><Tag size={16} /> {fac.type.replace('_', ' ')}</p>
                        {fac.type !== 'EQUIPMENT' && <p><MapPin size={16} /> {fac.location || 'Main Campus'}</p>}
                        {fac.type === 'EQUIPMENT' ? (
                          <p><Box size={16} /> Quantity: {fac.capacity || 'N/A'}</p>
                        ) : (
                          <p><Users size={16} /> Capacity: {fac.capacity || 'N/A'}</p>
                        )}
                      </div>
                      <div className="card-footer">
                        <div className="footer-main-actions">
                          {(() => {
                            const type = fac.type?.toUpperCase().replace(/[\s_]/g, '');
                            const isLectureHall = type === 'LECTUREHALL';
                            const isLab = type === 'LAB';
                            
                            if (isLectureHall) {
                              return (
                                <button 
                                  onClick={() => navigate(`/bookings/hall?id=${fac.id}`)} 
                                  className="action-btn book"
                                >
                                  <Calendar size={16} /> Book Hall
                                </button>
                              );
                            } else if (isLab) {
                              return (
                                <button 
                                  onClick={() => navigate(`/bookings/lab?id=${fac.id}`)} 
                                  className="action-btn book-lab"
                                >
                                  <Monitor size={16} /> Book Lab
                                </button>
                              );
                            } else {
                              return (
                                <button 
                                  onClick={() => navigate(`/bookings/new?resourceId=${fac.id}`)} 
                                  className="action-btn book-generic"
                                >
                                  <Calendar size={16} /> Book Now
                                </button>
                              );
                            }
                          })()}
                        </div>
                        {userRole === 'ROLE_ADMIN' && (
                          <div className="admin-actions">
                            <button onClick={() => navigate(`/admin/facilities?id=${fac.id}`)} className="icon-btn edit">
                              <Edit2 size={16} /> Edit
                            </button>
                            <button onClick={() => handleDelete(fac.id)} className="icon-btn delete">
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </>
        )}
      </div>

      <style jsx="true">{`
        .catalogue-container { padding: 20px 0 60px 0; min-height: 80vh; }
        .catalogue-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
        .catalogue-header h1 { font-size: 2.8rem; font-weight: 850; margin-bottom: 8px; letter-spacing: -0.02em; }
        .text-muted { color: #64748b; font-size: 1.1rem; }
        
        .back-link {
          display: flex; align-items: center; gap: 8px; color: #6366f1; font-weight: 700;
          background: #f5f3ff; border: none; padding: 10px 18px; border-radius: 12px; margin-bottom: 15px; 
          cursor: pointer; transition: all 0.3s; width: fit-content;
        }
        .back-link:hover { transform: translateX(-5px); background: #e0e7ff; }

        .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 25px; }
        .category-card {
          padding: 35px; border-radius: 28px; background: white; display: flex; align-items: center; gap: 25px;
          cursor: pointer; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          border: 1px solid #f1f5f9; position: relative; overflow: hidden;
        }
        .category-card:hover { transform: translateY(-10px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1); border-color: #6366f1; }

        .category-icon-wrapper {
          width: 75px; height: 75px; border-radius: 22px; display: flex; align-items: center; justify-content: center;
          font-size: 1.5rem; transition: transform 0.4s;
        }
        .category-card:hover .category-icon-wrapper { transform: scale(1.1) rotate(-5deg); }

        .category-info h2 { font-size: 1.6rem; font-weight: 800; color: #1e293b; margin-bottom: 6px; }
        .category-stat { display: flex; align-items: center; gap: 10px; font-size: 1rem; color: #64748b; font-weight: 600; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }

        .category-arrow { margin-left: auto; color: #cbd5e1; transition: all 0.3s; }
        .category-card:hover .category-arrow { transform: translateX(8px); color: #6366f1; }

        .search-bar { 
          display: grid; grid-template-columns: 2fr 1fr auto; gap: 15px; 
          padding: 15px; margin-bottom: 45px; background: rgba(255, 255, 255, 0.8);
          border-radius: 20px; border: 1px solid #f1f5f9;
        }
        .search-input-group { 
          display: flex; align-items: center; gap: 15px; background: white; 
          padding: 12px 20px; border-radius: 14px; border: 1px solid #e2e8f0; 
          transition: all 0.3s;
        }
        .search-input-group:focus-within { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
        .search-input-group input { border: none; outline: none; width: 100%; font-weight: 600; font-size: 1rem; color: #1e293b; }
        
        .search-bar input[type="number"] {
          padding: 12px 20px; border-radius: 14px; border: 1px solid #e2e8f0;
          font-weight: 600; outline: none; transition: all 0.3s;
        }
        .search-bar input[type="number"]:focus { border-color: #6366f1; }

        .filter-btn {
          background: #1e293b; color: white; padding: 0 25px; border-radius: 14px;
          font-weight: 700; display: flex; align-items: center; gap: 10px; transition: all 0.3s;
        }
        .filter-btn:hover { background: #0f172a; transform: translateY(-2px); }

        .facilities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 30px; }
        .facility-card { 
          padding: 30px; display: flex; flex-direction: column; background: white; 
          border-radius: 24px; border: 1px solid #f1f5f9; transition: all 0.3s;
          position: relative;
        }
        .facility-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.05); }

        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px; }
        .card-header h3 { font-size: 1.4rem; font-weight: 800; color: #1e293b; line-height: 1.2; }

        .status-badge { padding: 6px 14px; border-radius: 12px; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; }
        .status-badge.active { background: #dcfce7; color: #16a34a; }
        .status-badge.inactive { background: #fee2e2; color: #ef4444; }

        .card-body { flex: 1; display: flex; flex-direction: column; gap: 12px; margin-bottom: 25px; }
        .card-body p { display: flex; align-items: center; gap: 12px; color: #64748b; font-size: 1rem; font-weight: 500; }
        .card-body p svg { color: #94a3b8; }

        .card-footer { 
          display: flex; flex-direction: column; gap: 12px; padding-top: 20px; border-top: 1px solid #f1f5f9; 
        }
        .footer-main-actions { display: flex; gap: 10px; }
        
        .action-btn { 
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 10px; 
          padding: 14px; border-radius: 14px; font-weight: 700; transition: all 0.3s; 
          font-size: 1rem;
        }
        .action-btn.book { background: #6366f1; color: white; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2); }
        .action-btn.book-lab { background: #0ea5e9; color: white; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2); }
        .action-btn.book-generic { background: #10b981; color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); }
        .action-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        
        .admin-actions { display: flex; gap: 10px; margin-top: 5px; }
        .icon-btn { 
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px; border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc; 
          color: #64748b; transition: all 0.2s; font-weight: 600; font-size: 0.9rem;
        }
        .icon-btn:hover { background: #fff; color: #6366f1; border-color: #6366f1; }
        .icon-btn.delete:hover { color: #ef4444; border-color: #ef4444; }

        .add-btn {
          display: flex; align-items: center; gap: 10px; background: #6366f1; color: white;
          padding: 12px 24px; border-radius: 14px; font-weight: 700; 
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25); transition: all 0.3s;
        }
        .add-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 25px rgba(99, 102, 241, 0.35); }

        .empty-state {
          padding: 60px; text-align: center; background: white; border-radius: 24px;
          border: 1px dashed #cbd5e1; color: #64748b; font-weight: 600; font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .search-bar { grid-template-columns: 1fr; }
          .catalogue-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .category-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </DynamicLayout>
  );
};

export default FacilitiesCatalogue;

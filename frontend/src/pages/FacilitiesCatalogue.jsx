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
                <ChevronLeft size={20} /> Back to Overview
              </button>
            ) : null}
            <h1 className="gradient-text">
              {selectedCategory 
                ? categories.find(c => c.id === selectedCategory).title 
                : 'Facilities Overview'}
            </h1>
            <p className="text-muted">
              {selectedCategory 
                ? `Explore available ${categories.find(c => c.id === selectedCategory).title.toLowerCase()} resources.`
                : 'Manage and monitor campus resources.'}
            </p>
          </div>
          {userRole === 'ROLE_ADMIN' && (
            <button className="add-btn" onClick={() => navigate('/admin/facilities')}>
              <Plus size={20} />
              <span>Add New</span>
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
                  <ArrowRight size={20} />
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
              <LoadingSpinner />
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
                                <Calendar size={16} /> Book
                              </button>
                            );
                          } else if (isLab) {
                            return (
                              <button 
                                onClick={() => navigate(`/bookings/lab?id=${fac.id}`)} 
                                className="action-btn book-lab"
                              >
                                <Monitor size={16} /> Book
                              </button>
                            );
                          } else {
                            return (
                              <button 
                                onClick={() => navigate(`/bookings/new?resourceId=${fac.id}`)} 
                                className="action-btn book-generic"
                              >
                                <Calendar size={16} /> Book
                              </button>
                            );
                          }
                        })()}
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
          </>
        )}
      </div>

      <style jsx="true">{`
        .catalogue-container { padding: 20px 0 60px 0; }
        .catalogue-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .catalogue-header h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 5px; }
        
        .back-link {
          display: flex; align-items: center; gap: 5px; color: #6366f1; font-weight: 600;
          background: none; border: none; padding: 0; margin-bottom: 10px; cursor: pointer; transition: transform 0.2s;
        }
        .back-link:hover { transform: translateX(-5px); }

        .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 30px; }
        .category-card {
          padding: 40px; border-radius: 24px; background: white; display: flex; align-items: center; gap: 30px;
          cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid #f1f5f9;
        }
        .category-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08); border-color: #e2e8f0; }

        .category-icon-wrapper {
          width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center;
        }
        .category-card:hover .category-icon-wrapper { transform: scale(1.1) rotate(-5deg); }

        .category-info h2 { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
        .category-stat { display: flex; align-items: center; gap: 8px; font-size: 0.95rem; color: #64748b; font-weight: 600; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }

        .category-arrow { margin-left: auto; color: #cbd5e1; transition: all 0.3s; }
        .category-card:hover .category-arrow { transform: translateX(5px); color: #6366f1; }

        .search-bar { display: grid; grid-template-columns: 2fr 1fr auto; gap: 15px; padding: 12px; margin-bottom: 40px; }
        .search-input-group { display: flex; align-items: center; gap: 12px; background: white; padding: 10px 15px; border-radius: 12px; border: 1px solid #e2e8f0; }
        .search-input-group input { border: none; outline: none; width: 100%; font-weight: 500; }

        .facilities-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 25px; }
        .facility-card { padding: 24px; display: flex; flex-direction: column; background: white; border-radius: 20px; border: 1px solid #f1f5f9; }
        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .card-header h3 { font-size: 1.2rem; font-weight: 700; color: #1e293b; }

        .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; }
        .status-badge.active { background: #dcfce7; color: #16a34a; }
        .status-badge.inactive { background: #fee2e2; color: #ef4444; }

        .card-body { flex: 1; display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .card-body p { display: flex; align-items: center; gap: 10px; color: #64748b; font-size: 0.95rem; }

        .card-footer { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
        .action-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-radius: 12px; font-weight: 600; transition: all 0.2s; }
        .action-btn.book { background: #6366f1; color: white; }
        .action-btn.book-lab { background: #0ea5e9; color: white; }
        .action-btn.book-generic { background: #10b981; color: white; }
        
        .admin-actions { display: flex; gap: 8px; }
        .icon-btn { padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0; background: white; color: #64748b; transition: all 0.2s; }
        .icon-btn:hover { background: #f8fafc; color: #6366f1; border-color: #6366f1; }
        .icon-btn.delete:hover { color: #ef4444; border-color: #ef4444; }

        .add-btn {
          display: flex; align-items: center; gap: 8px; background: #6366f1; color: white;
          padding: 10px 20px; border-radius: 12px; font-weight: 600; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }
      `}</style>
    </DynamicLayout>
  );
};

export default FacilitiesCatalogue;

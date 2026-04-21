import React from 'react';
import AdminLayout from '../components/AdminLayout';
import { Users } from 'lucide-react';

const AdminUsers = () => {
  return (
    <AdminLayout>
      <div className="admin-placeholder glass-morphism">
        <Users size={64} color="#6366f1" />
        <h2>User Management</h2>
        <p>Control user access, assign roles (Admin/User), and manage campus-wide profile records.</p>
        <div className="status-badge">Module coming soon</div>
      </div>
      <style jsx>{`
        .admin-placeholder {
          height: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          text-align: center;
          background: white;
          border-radius: 24px;
        }
        h2 { color: #1e293b; font-weight: 700; }
        p { color: #64748b; max-width: 400px; }
        .status-badge {
          background: #f1f5f9;
          color: #475569;
          padding: 6px 16px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 600;
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminUsers;

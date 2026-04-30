import React from 'react';
import Layout from './Layout';
import AdminLayout from './AdminLayout';
import TechnicianLayout from './TechnicianLayout';

const DynamicLayout = ({ children }) => {
  const userRole = localStorage.getItem('userRole');

  if (userRole === 'ROLE_ADMIN') {
    return <AdminLayout>{children}</AdminLayout>;
  }

  if (userRole === 'ROLE_TECHNICIAN') {
    return <TechnicianLayout>{children}</TechnicianLayout>;
  }

  return <Layout>{children}</Layout>;
};

export default DynamicLayout;

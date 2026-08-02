import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard.jsx';
import AdminLoginPage from '../Auth/AdminLoginPage.jsx';
import { isAuthenticated, getRole } from '../../utils/auth.js';

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(isAuthenticated() && getRole() === 'admin');
  }, []);

  useEffect(() => {
    document.title = authed ? 'Admin Dashboard | CampusConnect' : 'Admin Login | CampusConnect';
  }, [authed]);

  if (!authed) {
    return <AdminLoginPage onSuccess={() => setAuthed(true)} />;
  }

  return <AdminDashboard />;
}

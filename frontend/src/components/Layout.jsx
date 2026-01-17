import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../pages/Dashboard.css'; // ← we reuse the same css file (you can create separate later)

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="app-layout">
      {/* Sidebar - always visible on protected pages */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>NovaBill</h2>
          <span>POS</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            Dashboard
          </Link>
          <Link to="/invoices" className="nav-item">
            Invoices
          </Link>
          <Link to="/inventory" className="nav-item">
            Inventory
          </Link>
          <Link to="/users" className="nav-item">
            Users
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Page content */}
      <main className="main-area">
        {children}
      </main>
    </div>
  );
};

export default Layout;
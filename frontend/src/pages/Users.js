// Users.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Users.css';

const Users = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const registerUser = async () => {
    if (!username.trim() || !password.trim()) {
      alert('Please enter username and password');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/auth/register',
        { username: username.trim(), password, role },
        { headers: { 'x-auth-token': token } }
      );

      alert('User registered successfully');
      setUsername('');
      setPassword('');
      setRole('user');
    } catch (err) {
      alert(
        'Failed to register user: ' +
          (err.response?.data?.msg || 'Unknown error')
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="app-layout">
      {/* Sidebar - same as other pages */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>NovaBill</h2>
          <span>POS</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <span className="nav-icon">🏠</span>Dashboard
          </Link>
          <Link to="/invoices" className="nav-item">
            <span className="nav-icon">📄</span>Invoices
          </Link>
          <Link to="/inventory" className="nav-item">
            <span className="nav-icon">📦</span>Inventory
          </Link>
          <Link to="/users" className="nav-item active">
            <span className="nav-icon">👥</span>Users
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-area">
        <div className="users-page">
          <header className="page-header">
            <h1>User Management</h1>
          </header>

          <div className="user-management-container">
            <div className="register-panel">
              <h2>Register New User</h2>

              <div className="form-group">
                <label>Username *</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="off"
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>

              <div className="form-group">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              <button className="register-btn" onClick={registerUser}>
                Register User
              </button>
            </div>

            {/* You can add user list / table here in future */}
            <div className="info-panel">
              <h3>Notes</h3>
              <ul>
                <li>Admin users can manage all system features</li>
                <li>Regular users have limited access</li>
                <li>Keep passwords secure and unique</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Users;
// Inventory.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Link, useNavigate } from 'react-router-dom';
import './Inventory.css';

const socket = io('http://localhost:5000');

const Inventory = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    itemName: '',
    quantity: '',
    price: '',
    gstRate: 18
  });

  useEffect(() => {
    fetchItems();

    socket.on('inventoryUpdated', fetchItems);

    return () => {
      socket.off('inventoryUpdated');
    };
  }, []);

  const fetchItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/inventory', {
        headers: { 'x-auth-token': token },
      });
      setItems(res.data);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async () => {
    if (!newItem.itemName.trim() || !newItem.price || !newItem.quantity) {
      alert('Please fill Item Name, Quantity and Price');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/inventory', newItem, {
        headers: { 'x-auth-token': token },
      });

      setNewItem({ itemName: '', quantity: '', price: '', gstRate: 18 });
      // socket will trigger refresh
    } catch (err) {
      alert('Failed to add item: ' + (err.response?.data?.msg || 'Unknown error'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="app-layout">
      {/* Sidebar - same as Invoices */}
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
          <Link to="/inventory" className="nav-item active">
            <span className="nav-icon">📦</span>Inventory
          </Link>
          <Link to="/users" className="nav-item">
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
        <div className="inventory-page">
          <header className="page-header">
            <h1>Inventory Management</h1>
          </header>

          <div className="inventory-container">
            {/* Left - Add New Item Form */}
            <div className="add-item-panel">
              <h2>Add New Item</h2>

              <div className="form-group">
                <label>Item Name *</label>
                <input
                  type="text"
                  name="itemName"
                  value={newItem.itemName}
                  onChange={handleInputChange}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    min="0"
                    value={newItem.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={newItem.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>GST Rate (%)</label>
                <input
                  type="number"
                  name="gstRate"
                  min="0"
                  max="100"
                  step="0.5"
                  value={newItem.gstRate}
                  onChange={handleInputChange}
                  placeholder="18"
                />
              </div>

              <button className="add-item-btn" onClick={handleAddItem}>
                Add Item
              </button>
            </div>

            {/* Right - Inventory List */}
            <div className="inventory-list-panel">
              <h2>Current Inventory</h2>

              <div className="inventory-table">
                <div className="table-header">
                  <div>Item Name</div>
                  <div>Quantity</div>
                  <div>Price</div>
                  <div>GST</div>
                </div>

                {items.length === 0 ? (
                  <div className="no-data">No items in inventory yet</div>
                ) : (
                  items.map(item => (
                    <div key={item._id} className="table-row">
                      <div>{item.itemName}</div>
                      <div>{item.quantity}</div>
                      <div>₹{Number(item.price).toFixed(2)}</div>
                      <div>{item.gstRate}%</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inventory;
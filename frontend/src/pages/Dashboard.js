import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [customerName, setCustomerName] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchItem, setSearchItem] = useState('');

  // Dummy quick access products (in real app → fetch from API)
  const quickProducts = [
    { id: 1, name: 'Cold Drink 500ml', price: 40, gst: 18 },
    { id: 2, name: 'Parle-G Biscuit', price: 10, gst: 5 },
    { id: 3, name: 'Lays Magic Masala', price: 20, gst: 12 },
    { id: 4, name: 'Notebook 200 Pages', price: 85, gst: 12 },
    { id: 5, name: 'Water Bottle 1L', price: 25, gst: 18 },
  ];

  const addItem = (product) => {
    const existing = selectedItems.find(item => item.id === product.id);
    if (existing) {
      setSelectedItems(selectedItems.map(item =>
        item.id === product.id
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
    } else {
      setSelectedItems([...selectedItems, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, change) => {
    setSelectedItems(selectedItems.map(item => {
      if (item.id === id) {
        const newQty = item.qty + change;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeItem = (id) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => {
      const itemTotal = item.price * item.qty;
      const gstAmount = itemTotal * (item.gst / 100);
      return sum + itemTotal + gstAmount;
    }, 0).toFixed(2);
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar - Now guaranteed to be visible */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>NovaBill</h2>
          <span>POS</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link active">
            <span className="nav-icon">🏠</span> Dashboard
          </Link>
          <Link to="/invoices" className="nav-link">
            <span className="nav-icon">📄</span> Invoices
          </Link>
          <Link to="/inventory" className="nav-link">
            <span className="nav-icon">📦</span> Inventory
          </Link>
          <Link to="/users" className="nav-link">
            <span className="nav-icon">👥</span> Users
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="user-welcome">
            Welcome back, <strong>Admin</strong>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="stats-container">
          <div className="stat-card">
            <h3>Today's Sales</h3>
            <div className="stat-value">₹18,240</div>
            <div className="stat-change positive">+14% ↑</div>
          </div>
          <div className="stat-card">
            <h3>Pending Bills</h3>
            <div className="stat-value">9</div>
            <div className="stat-change">Need attention</div>
          </div>
          <div className="stat-card warning">
            <h3>Low Stock Items</h3>
            <div className="stat-value">6</div>
            <div className="stat-change">Check now</div>
          </div>
        </div>

        {/* Quick Billing Area */}
        <section className="quick-billing">
          <h2>Quick Billing</h2>

          <div className="billing-grid">
            {/* Products Grid */}
            <div className="products-panel">
              <input
                type="text"
                className="product-search"
                placeholder="Search product or barcode..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
              />

              <div className="products-grid">
                {quickProducts.map(product => (
                  <button
                    key={product.id}
                    className="product-card"
                    onClick={() => addItem(product)}
                  >
                    <div className="product-name">{product.name}</div>
                    <div className="product-price">₹{product.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart */}
            <div className="cart-panel">
              <h3>Current Cart ({selectedItems.length})</h3>

              <div className="cart-items">
                {selectedItems.length === 0 ? (
                  <div className="empty-cart-message">
                    Add products to start billing
                  </div>
                ) : (
                  selectedItems.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-price">₹{item.price} × {item.qty}</div>
                      </div>

                      <div className="cart-qty-controls">
                        <button onClick={() => updateQty(item.id, -1)}>-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}>+</button>
                      </div>

                      <div className="item-total">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </div>

                      <button
                        className="remove-item"
                        onClick={() => removeItem(item.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="cart-total-section">
                <div className="grand-total">
                  <span>Total Amount</span>
                  <strong>₹{calculateTotal()}</strong>
                </div>

                <button className="pay-button">
                  Complete Payment →
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
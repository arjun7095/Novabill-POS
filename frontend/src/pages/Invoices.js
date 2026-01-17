import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Link, useNavigate } from 'react-router-dom';
import './Invoices.css';

const socket = io('http://localhost:5000');

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
    fetchInventory();

    socket.on('invoiceCreated', () => {
      fetchInvoices();
      fetchInventory();
    });

    return () => {
      socket.off('invoiceCreated');
    };
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/invoices', {
        headers: { 'x-auth-token': token },
      });
      setInvoices(res.data);
    } catch (err) {
      console.error('Failed to fetch invoices', err);
    }
  };

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/inventory', {
        headers: { 'x-auth-token': token },
      });
      setInventory(res.data);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const addItem = (item, quantity) => {
    if (!quantity || quantity <= 0) return;

    const existing = selectedItems.find((i) => i.itemId === item._id);
    if (existing) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.itemId === item._id ? { ...i, quantity: Number(i.quantity) + Number(quantity) } : i
        )
      );
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          itemId: item._id,
          name: item.itemName,
          price: item.price,
          gstRate: item.gstRate,
          quantity: Number(quantity),
        },
      ]);
    }
  };

  const updateQuantity = (itemId, newQty) => {
    if (newQty < 1) return;
    setSelectedItems(
      selectedItems.map((item) =>
        item.itemId === itemId ? { ...item, quantity: Number(newQty) } : item
      )
    );
  };

  const removeItem = (itemId) => {
    setSelectedItems(selectedItems.filter((item) => item.itemId !== itemId));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let totalGST = 0;

    selectedItems.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      const gstAmount = itemTotal * (item.gstRate / 100);
      subtotal += itemTotal;
      totalGST += gstAmount;
    });

    const grandTotal = subtotal + totalGST;

    return { subtotal, totalGST, grandTotal };
  };

  const createInvoice = async () => {
    if (!customerName.trim() || selectedItems.length === 0) {
      alert('Please enter customer name and add at least one item');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        customerName: customerName.trim(),
        items: selectedItems.map((i) => ({
          itemId: i.itemId,
          quantity: i.quantity,
        })),
      };

      await axios.post('/api/invoices', payload, {
        headers: { 'x-auth-token': token },
      });

      setSelectedItems([]);
      setCustomerName('');
      setSearchTerm('');
    } catch (err) {
      alert('Failed to create invoice: ' + (err.response?.data?.msg || 'Unknown error'));
    }
  };

  const payInvoice = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/invoices/pay/${id}`, {}, {
        headers: { 'x-auth-token': token },
      });
      fetchInvoices();
    } catch (err) {
      alert('Payment failed');
    }
  };

  const { subtotal, totalGST, grandTotal } = calculateTotals();

  const filteredInventory = inventory.filter((item) =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>NovaBill</h2>
          <span>POS</span>
        </div>

        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <span className="nav-icon">🏠</span>Dashboard
          </Link>
          <Link to="/invoices" className="nav-item active">
            <span className="nav-icon">📄</span> Invoices
          </Link>
          <Link to="/inventory" className="nav-item">
            <span className="nav-icon">📦</span> Inventory
          </Link>
          <Link to="/users" className="nav-item">
            <span className="nav-icon">👥</span> Users
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <span className="nav-icon">🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Page Content */}
      <main className="main-area">
        <div className="invoices-page">
          <header className="page-header">
            <h1>Invoices & Billing</h1>
          </header>

          <div className="billing-container">
            {/* Left - Create New Invoice */}
            <div className="new-invoice-panel">
              <h2>New Invoice</h2>

              <div className="customer-section">
                <label>Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Walk-in / Customer name"
                />
              </div>

              <div className="items-section">
                <div className="search-bar-container">
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="inventory-list">
                  {filteredInventory.map((item) => (
                    <div key={item._id} className="inventory-item-row">
                      <div className="item-info">
                        <span className="item-name">{item.itemName}</span>
                        <span className="item-price">₹{item.price} • {item.gstRate}% GST</span>
                      </div>
                      <div className="item-action">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addItem(item, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        />
                        <button onClick={() => addItem(item, 1)}>Add</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Summary */}
              <div className="cart-summary">
                <h3>Cart ({selectedItems.length} items)</h3>

                {selectedItems.length === 0 ? (
                  <div className="empty-cart">No items added yet</div>
                ) : (
                  <>
                    <div className="cart-items-list">
                      {selectedItems.map((item) => (
                        <div key={item.itemId} className="cart-item">
                          <div className="cart-item-details">
                            <strong>{item.name}</strong>
                            <span>₹{item.price} × {item.quantity}</span>
                          </div>
                          <div className="cart-controls">
                            <button onClick={() => updateQuantity(item.itemId, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.itemId, item.quantity + 1)}>+</button>
                            <button className="remove" onClick={() => removeItem(item.itemId)}>
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="totals">
                      <div className="total-line">
                        <span>Subtotal</span>
                        <strong>₹{subtotal.toFixed(2)}</strong>
                      </div>
                      <div className="total-line">
                        <span>GST</span>
                        <strong>₹{totalGST.toFixed(2)}</strong>
                      </div>
                      <div className="grand-total">
                        <span>Total</span>
                        <strong>₹{grandTotal.toFixed(2)}</strong>
                      </div>
                    </div>

                    <button className="create-invoice-btn" onClick={createInvoice}>
                      Create Invoice
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Right - Recent Invoices */}
            <div className="recent-invoices-panel">
              <h2>Recent Invoices</h2>

              <div className="invoices-table">
                <div className="table-header">
                  <div>Customer</div>
                  <div>Total</div>
                  <div>Status</div>
                  <div>Action</div>
                </div>

                {invoices.length === 0 ? (
                  <div className="no-data">No invoices yet</div>
                ) : (
                  invoices.map((invoice) => (
                    <div key={invoice._id} className="table-row">
                      <div>{invoice.customerName}</div>
                      <div>₹{invoice.totalAmount?.toFixed(2)}</div>
                      <div className={`status ${invoice.paymentStatus}`}>
                        {invoice.paymentStatus}
                      </div>
                      <div>
                        {invoice.paymentStatus === 'pending' && (
                          <button className="pay-btn" onClick={() => payInvoice(invoice._id)}>
                            Pay
                          </button>
                        )}
                      </div>
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

export default Invoices;
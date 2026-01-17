import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import Dashboard from './pages/Dashboard';
import Invoices from './pages/Invoices';
import Inventory from './pages/Inventory';
import Login from './pages/Login';
import Users from './pages/Users';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
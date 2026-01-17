require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server, { cors: { origin: '*' } });

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/invoices', require('./routes/invoices'));

// Socket.io for multi-user real-time
io.on('connection', (socket) => {
  console.log('User connected');
  socket.on('updateInventory', async (data) => {
    io.emit('inventoryUpdated', data); // Broadcast updates
  });
  socket.on('newInvoice', (data) => {
    io.emit('invoiceCreated', data);
  });
  socket.on('disconnect', () => console.log('User disconnected'));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
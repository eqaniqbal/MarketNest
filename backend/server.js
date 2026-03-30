require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/products',  require('./routes/products'));
app.use('/api/orders',    require('./routes/orders'));
app.use('/api/admin',     require('./routes/admin'));
app.use('/api/chat',      require('./routes/chat'));
app.use('/api/cart',      require('./routes/cart'));
app.use('/api/wishlist',  require('./routes/wishlist'));
app.use('/api/coupons',   require('./routes/coupons'));
app.use('/api/analytics', require('./routes/analytics'));

// Socket.IO — real-time messaging
// Room naming: always sort user IDs so both sides join the same room
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  // Broadcast message to room — ChatBox.jsx emits 'send_message'
  socket.on('send_message', (data) => {
    // Send to everyone in the room (including sender for confirmation)
    io.to(data.room).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`MarketNest backend running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

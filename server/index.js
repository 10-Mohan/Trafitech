const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const SimulationService = require('./utils/SimulationService');

// Load environment variables
dotenv.config();

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Initialize Simulation Service
const simulation = new SimulationService(io);
simulation.start();

io.on('connection', (socket) => {
    console.log('Client connected for IoT stream:', socket.id);
});

// Middleware
app.use(cors());
app.use(express.json());

// Hybrid Connection Logic
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/traffitech';
mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas (Production Cloud DB)'))
    .catch((err) => {
        console.warn('⚠️ MongoDB Atlas not connected. Using Local JSON DB fallback.');
        console.log('✅ Zero-Dependency Fallback Mode Active');
    });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/webhooks', require('./routes/webhooks'));

// Basic Route
app.get('/', (req, res) => {
    res.json({
        message: 'TraffiTech API is running',
        mode: mongoose.connection.readyState === 1 ? 'Production (Cloud DB)' : 'Development (Fallback JSON DB)'
    });
});

// Port Configuration
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

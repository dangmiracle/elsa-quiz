// server.js
const app = require('./app');
const http = require('http');
const socketIo = require('socket.io');

const PORT = process.env.PORT || 3000;

// Create the HTTP server
const httpServer = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = socketIo(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Make io accessible within app
app.set('io', io);

// Setup Socket.IO event listeners
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_quiz', (quizId) => {
        socket.join(quizId);
        console.log(`User ${socket.id} joined quiz ${quizId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const io = require('socket.io-client');

const socket = io('http://localhost:3000'); // Replace with your server URL

socket.on('connect', () => {
    console.log('Connected to Socket.IO server');
    socket.emit('join_quiz', 'quiz123'); // Emit test event
});

socket.on('leaderboard_update', (data) => {
    console.log('Received leaderboard update:', data);
});

socket.on('disconnect', () => {
    console.log('Disconnected from Socket.IO server');
});

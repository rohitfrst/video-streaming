const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.static(path.join(__dirname, '')));

let masterSocket = null;
let sharedVideoState = {
    currentTime: 0,
    isPaused: true,
};

io.on('connection', (socket) => {
    console.log('A user connected');

    if (masterSocket === null) {
        masterSocket = socket;
        socket.emit('master-update', { isMaster: true });
    } else {
        socket.emit('master-update', { isMaster: false });
    }

    // Handle the "Make Master" button click event
    socket.on('make-master', function () {
        if (masterSocket !== socket) {
            masterSocket.emit('master-update', { isMaster: false });
            masterSocket = socket;
            socket.emit('master-update', { isMaster: true });
        }
    });

    socket.on('disconnect', () => {
        if (masterSocket === socket) {
            masterSocket = null;
            socket.broadcast.emit('master-update', { isMaster: true });
        }
        console.log('A user disconnected');
    });

    // Handle video play event
    socket.on('play', function () {
        if (masterSocket === socket) {
            sharedVideoState.isPaused = false;
            socket.broadcast.emit('sync-video', sharedVideoState);
        }
    });

    // Handle video pause event
    socket.on('pause', function () {
        if (masterSocket === socket) {
            sharedVideoState.isPaused = true;
            socket.broadcast.emit('sync-video', sharedVideoState);
        }
    });

    // Handle video seek events
    socket.on('seek', function (seekTime) {
        if (masterSocket === socket) {
            sharedVideoState.currentTime = seekTime;
            socket.broadcast.emit('sync-video', sharedVideoState);
        }
    });

    // Send the initial video state to the new user
    socket.emit('sync-video', sharedVideoState);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const { Server } = require('socket.io');
const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 1234;

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/public/index.html');
});

app.get('/login', (req, res) => {
    res.sendFile(process.cwd() + '/public/login.html');
});

const listOfUsers = [];

io.on('connection', (socket) => {
    socket.broadcast.emit('connected');

    socket.on('disconnect', () => {
        socket.broadcast.emit('disconnected');
    });

    socket.on('message', (author, msg) => {
        io.emit('newMessage', author, msg);
    });

    socket.on('setTyping', (user, state) => {
        socket.broadcast.emit('userTyping', user, state);
    });

    socket.on('userConnected', (username) => {
        if (!listOfUsers.includes(username)) listOfUsers.push(username);
        socket.emit('updateListOfUsers', listOfUsers);
        socket.broadcast.emit('updateListOfUsers', listOfUsers);
    });

    socket.on('userDisconnected', (username) => {
        listOfUsers.splice(listOfUsers.indexOf(username), 1);
        socket.broadcast.emit('updateListOfUsers', listOfUsers);
    });
});

server.listen(PORT, () => {
    console.log(`Server started in http://localhost:${PORT}`);
})
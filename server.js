// Server file running socket.io and simple http express server for html game with multiplayer

//SERVER SETUPS -- all the required modules and initialization
require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const path = require('path');
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '/static')));

//With all the files loaded, the below statement causes the server to boot up and listen for client connections.
server.listen(port, () => {
    console.log('server listening on port: ', port);
});
console.log('server script fully loaded');

const redis = require('redis');
const http = require('http');
const express = require('express');
const socketIo = require('socket.io');

const subscriber = redis.createClient();
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Subscribe to redis events channel
subscriber.subscribe('events', (error) => {
  if (error) throw new Error(error);
  console.log('Subscribed to the events channel');
});

// When a new message comes in, emit it to the client
const stream = (client) => {
  subscriber.on('message', (channel, message) => {
    client.emit('newEvent', message);
  });
};

// When the client connects and subscribes, begin streaming
io.on('connection', (client) => {
  client.on('subscribeToEvents', () => {
    stream(client);
  });
});

// Listen for client connections on port 8000
const port = 8000;
io.listen(port);
console.log('listening on port ', port);

const redis = require('redis');
const http = require('http');
const express = require('express');
const socketIo = require('socket.io');

const subscriber = redis.createClient();
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// For now, place new messages on a stack
const messageStack = [];

// When a new event arrives from Redis via the events channel, add it to the messages stack
subscriber.on('message', (channel, message) => {
  messageStack.unshift({ message });
});

// Subscribe to the redis events channel
subscriber.subscribe('events', (error) => {
  if (error) throw new Error(error);
  console.log('Subscribed to the events channel');
});

// When the client connect to the events socket, start emitting the messageStack over the socket
io.on('connection', (client) => {
  client.on('subscribeToEvents', (interval) => {
    console.log('client is subscribing to events with interval ', interval);
    setInterval(() => {
      client.emit('socketEvents', messageStack);
    }, interval);
  });
});

// Listen for client connections on port 8000
const port = 8000;
io.listen(port);
console.log('listening on port ', port);

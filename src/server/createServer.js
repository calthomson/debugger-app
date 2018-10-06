const http = require('http');
const express = require('express');
const socketIo = require('socket.io');

const createServer = (redisClient, port) => {
  const app = express();
  const httpServer = http.createServer(app);
  const io = socketIo(httpServer);

  io.on('connection', (client) => {
    // When a new message is received from Redis, emit it to the client
    redisClient.on('message', (channel, message) => {
      client.emit('newEvent', message);
    });

    // When a client plays stream, server subscribes to Redis channel
    client.on('play', () => {
      redisClient.subscribe('events', () => {});
    });

    // When a client pauses stream, server unsubscribes from Redis channel
    client.on('pause', () => {
      redisClient.unsubscribe();
    });
  });

  io.listen(port);

  return { io, httpServer };
};

module.exports = createServer;

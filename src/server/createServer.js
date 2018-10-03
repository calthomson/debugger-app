const http = require('http');
const express = require('express');
const socketIo = require('socket.io');

const createServer = (redisClient, port) => {
  const app = express();
  const httpServer = http.createServer(app);
  const io = socketIo(httpServer);

  // When the client connects and subscribes, begin streaming
  io.on('connection', (client) => {
    client.on('subscribeToEvents', () => {
      // When a new message comes in, emit it to the client
      redisClient.on('message', (channel, message) => {
        client.emit('newEvent', message);
      });

      // Subscribe to redis events channel
      redisClient.subscribe('events', (error) => {
        if (error) throw new Error(error);
      });
    });
  });

  io.listen(port);
  console.log('Listening on port ', port);

  return { io, httpServer };
};

module.exports = createServer;

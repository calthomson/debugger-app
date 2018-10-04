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
    // When a client subscribes, server subscribes to Redis channel
    client.on('subscribe', () => {
      redisClient.subscribe('events', (error) => {
        if (error) throw new Error(error);
      });
    });
    // When a client unsubscribes, server unsubscribes from Redis channel
    client.on('unsubscribe', () => {
      redisClient.unsubscribe();
    });
  });

  io.listen(port);
  console.log('Listening on port ', port);

  return { io, httpServer };
};

module.exports = createServer;

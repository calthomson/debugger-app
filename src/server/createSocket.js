const socketIo = require('socket.io');

const createSocket = (redisClient) => {
  const io = socketIo();

  // redisClient.on('message', (channel, message) => {
  //   // Store messages received from Redis
  //   console.log('message;', message);
  //   // eventFrequency[];
  // });

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

  return io;
};

module.exports = createSocket;

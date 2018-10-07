const redis = require('redis');
const http = require('http');
const express = require('express');

const createSocket = require('./createSocket');

const redisClient = redis.createClient({
  retry_strategy: () => {
    console.log('Unable to connect to Redis server, trying again');
    return 1000;
  }
});

const app = express();
app.use(express.static('dist'));
const httpServer = http.createServer(app);

const io = createSocket(redisClient);

io.listen(httpServer);
httpServer.listen(8000);

const redis = require('redis');
const createServer = require('./createServer');

const redisClient = redis.createClient({
  retry_strategy: () => {
    console.log('Unable to connect to Redis server, trying again');
    return 1000;
  }
});

createServer(redisClient, 8000);

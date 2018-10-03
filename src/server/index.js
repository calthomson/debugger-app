const redis = require('redis');
const createServer = require('./createServer');

const redisClient = redis.createClient();

createServer(redisClient, 8000);

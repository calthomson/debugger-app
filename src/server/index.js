const redis = require('redis');

const subscriber = redis.createClient();

// For now, place new messages on a stack
const messageStack = [];

// When a new event arrives from Redis via the events channel, add it to the messages stack
subscriber.on('message', (channel, message) => {
  messageStack.unshift({ message });
  console.log('\n\nReceived new event:', message);
});

// Subscribe to the redis events channel
subscriber.subscribe('events', (error) => {
  if (error) throw new Error(error);
  console.log('Subscribed to the events channel');
});

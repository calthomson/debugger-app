const redis = require('redis');
const http = require('http');
const express = require('express');

const createSocket = require('./createSocket');

const eventFrequencyMap = {};

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

// const eventFrequencyMap = [];

// Get time representation, down to the second
// 2018-10-17T17:52:32.239Z
const getTime = timeStamp => `${timeStamp.getMinutes()}${timeStamp.getHours()}${timeStamp.getDay()}${timeStamp.getMonth()}${timeStamp.getYear()}`;

// Get frequency of events with this name and this timestamp, taking into consideration
// previous counter value, if one exists
const updateFrequency = (eventFrequencyForTimestamp) => {
  const updatedFrequency = eventFrequencyForTimestamp ? eventFrequencyForTimestamp + 1 : 1;
  return updatedFrequency;
};

redisClient.on('message', (channel, message) => {
  // Store messages received from Redis
  // console.log('message;', message);
  // Place event into the map, using the 'name' as the key

  const event = JSON.parse(message);

  console.log('BEFORE:', eventFrequencyMap);

  // Only use track events
  if (event.event) {
    const time = getTime(new Date(event.sentAt));

    // If this is a new type of event, initialize it to an empty object
    if (!eventFrequencyMap[event.event]) {
      eventFrequencyMap[event.event] = {};
    }

    eventFrequencyMap[event.event] = Object.assign(
      eventFrequencyMap[event.event],
      { [time]: updateFrequency(eventFrequencyMap[event.event][time]) }
    );
  }

  console.log('AFTER:', eventFrequencyMap);
});

io.listen(httpServer);
httpServer.listen(8000);

const findEventCount = (start, end, name) => {
  const eventsWithName = eventFrequencyMap[name];
  // { `name`: { ..... `timeStamp`: 2 }}
  // Find timestamp entries that are closest to start and end timestamps
  const parsedStart = getTime(start);
  const parsedEnd = getTime(end);
  const countAtStart = eventsWithName[parsedStart]; // eventsWithName[year][month][day][hour][minute]
  const countAtEnd = eventsWithName[parsedEnd];

  return countAtEnd - countAtStart;
};

// getTotalEvents/:eventName:{value}startTime:{value}:endTime{value}

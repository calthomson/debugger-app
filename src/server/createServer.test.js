import redis from 'redis-mock';
import io from 'socket.io-client';

import createServer from './createServer';

let server;
let socket;
let mockRedisServer;
let mockRedisClient;

describe('server', () => {
  // Before running tests, create a mock Redis server
  beforeAll(() => {
    mockRedisServer = redis.createClient();
    mockRedisClient = redis.createClient();

    // When the client subscribes, publish a messages to the 'events' channel
    mockRedisClient.on('subscribe', () => {
      mockRedisServer.publish('events', 'An event sent after a subscribe');
    });

    server = createServer(mockRedisClient, '');
  });

  // After running tests, close the io and http servers
  afterAll((done) => {
    server.io.close();
    server.httpServer.close();
    done();
  });

  // Before each test, connect the test client
  beforeEach((done) => {
    const httpServerAddr = server.httpServer.listen().address();

    socket = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {});

    // Once the socket connects, run the test
    socket.on('connect', () => {
      done();
    });
  });

  // After each test, disconnect the test client
  afterEach((done) => {
    if (socket.connected) {
      socket.disconnect();
    }
    done();
  });

  test('subscribes to a Redis channel and propagates messages from this channel to a client via a socket', (done) => {
    socket.once('newEvent', (message) => {
      expect(message).toBe('An event sent after a subscribe');
      done();
    });

    socket.emit('play');
  });

  test('responds to client pausing/playing stream and does not propagate events while paused', (done) => {
    socket.once('newEvent', (message) => {
      expect(message).toBe('An event sent after a subscribe');

      mockRedisClient.on('unsubscribe', () => { // When an unsubscribe occurs, send an event
        // Expect that next event will not be the event that was sent while paused/unsubscribed
        socket.once('newEvent', (secondMessage) => {
          expect(secondMessage).toBe('An event sent after a subscribe');
          done();
        });

        mockRedisServer.publish('events', 'An event sent while unsubscribed');

        socket.emit('play');
      });

      socket.emit('pause');
    });

    socket.emit('play');
  });
});

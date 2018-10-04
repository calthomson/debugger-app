import redis from 'redis-mock';
import io from 'socket.io-client';

import createServer from './createServer';

let server;
let socket;

describe('createServer', () => {
  // First, create the server using a mocked Redis server
  beforeAll(() => {
    const mockRedisServer = redis.createClient();
    const mockRedisClient = redis.createClient();

    // When the client subscribes, publish a messages to the 'events' channel
    mockRedisClient.on('subscribe', () => {
      mockRedisServer.publish('events', 'Mock event');
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
    socket.emit('subscribe');

    socket.once('newEvent', (message) => {
      expect(message).toBe('Mock event');
      done();
    });
  });
});

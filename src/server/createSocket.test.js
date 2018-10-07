import redis from 'redis-mock';
import io from 'socket.io-client';
import http from 'http';
import express from 'express';

import createSocket from './createSocket';

let mockRedisServer;
let mockRedisClient;
let socketServer;
let socketClient;
let httpServer;

describe('server socket', () => {
  // Before running tests, create a mock Redis server
  beforeAll(() => {
    mockRedisServer = redis.createClient();
    mockRedisClient = redis.createClient();

    // When the client subscribes, publish a messages to the 'events' channel
    mockRedisClient.on('subscribe', () => {
      mockRedisServer.publish('events', 'An event sent after a subscribe');
    });

    const app = express();
    httpServer = http.createServer(app);

    socketServer = createSocket(mockRedisClient);

    socketServer.listen(httpServer);
  });

  // After running tests, close the io and http servers
  afterAll((done) => {
    socketServer.close();
    httpServer.close();
    done();
  });

  // Before each test, connect the test client
  beforeEach((done) => {
    const httpServerAddr = httpServer.listen().address();

    socketClient = io.connect(`http://[${httpServerAddr.address}]:${httpServerAddr.port}`, {});

    // Once the socket connects, run the test
    socketClient.on('connect', () => {
      done();
    });
  });

  // After each test, disconnect the test client
  afterEach((done) => {
    if (socketClient.connected) {
      socketClient.disconnect();
    }
    done();
  });

  test('subscribes to a Redis channel and propagates messages from this channel to a client via a socket', (done) => {
    socketClient.once('newEvent', (message) => {
      expect(message).toBe('An event sent after a subscribe');
      done();
    });

    socketClient.emit('play');
  });

  test('responds to client pausing/playing stream and does not propagate events while paused', (done) => {
    socketClient.once('newEvent', (message) => {
      expect(message).toBe('An event sent after a subscribe');

      mockRedisClient.on('unsubscribe', () => { // When an unsubscribe occurs, send an event
        // Expect that next event will not be the event that was sent while paused/unsubscribed
        socketClient.once('newEvent', (secondMessage) => {
          expect(secondMessage).toBe('An event sent after a subscribe');
          done();
        });

        mockRedisServer.publish('events', 'An event sent while unsubscribed');

        socketClient.emit('play');
      });

      socketClient.emit('pause');
    });

    socketClient.emit('play');
  });
});

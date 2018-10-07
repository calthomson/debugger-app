import { connect, pause, play } from './eventStream';

const http = require('http');
const socketIo = require('socket.io');

let ioServer;
let httpServer;
let httpServerAddr;

describe('eventStream', () => {
  beforeEach(() => {
    httpServer = http.createServer().listen();
    httpServerAddr = httpServer.listen().address();
    ioServer = socketIo(httpServer);
  });

  afterEach(() => {
    ioServer.close();
    httpServer.close();
  });

  test('connects to the server', (done) => {
    const callback = jest.fn();

    connect(callback, `http://[${httpServerAddr.address}]:${httpServerAddr.port}`);

    setTimeout(() => {
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback.mock.calls[0][0]).toEqual({ type: 'connection' });
      done();
    }, 100);
  });

  test('receives messages from server', (done) => {
    ioServer.once('connection', (client) => {
      client.emit('newEvent', 'Message from server');
    });

    const callback = jest.fn();

    connect(callback, `http://[${httpServerAddr.address}]:${httpServerAddr.port}`);

    setTimeout(() => {
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback.mock.calls[1][0]).toEqual({ type: 'message', body: 'Message from server' });
      done();
    }, 100);
  });

  test('receives errors from server', (done) => {
    ioServer.once('connection', () => {
      ioServer.close();
      httpServer.close();
    });

    const callback = jest.fn();

    connect(callback, `http://[${httpServerAddr.address}]:${httpServerAddr.port}`);

    setTimeout(() => {
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback.mock.calls[1][0]).toEqual({ type: 'error', body: 'Server error' });
      expect(callback.mock.calls[2][0]).toEqual({ type: 'error', body: 'Unable to connect to server' });
      done();
    }, 100);
  });

  test('emits \'play\' command to server', (done) => {
    ioServer.on('connection', (client) => {
      client.once('play', () => {
        done();
      });
    });

    const callback = jest.fn();

    connect(callback, `http://[${httpServerAddr.address}]:${httpServerAddr.port}`);

    play();
  });

  test('emits \'pause\' command to server', (done) => {
    ioServer.on('connection', (client) => {
      client.once('pause', () => {
        done();
      });
    });

    const callback = jest.fn();

    connect(callback, `http://[${httpServerAddr.address}]:${httpServerAddr.port}`);

    pause();
  });
});

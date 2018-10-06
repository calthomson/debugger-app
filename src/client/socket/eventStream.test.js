import { connect } from './eventStream';

const http = require('http');
const socketIo = require('socket.io');

let ioServer;
let httpServer;
let httpServerAddr;

describe('eventStream', () => {
  beforeAll((done) => {
    httpServer = http.createServer().listen();
    httpServerAddr = httpServer.listen().address();
    ioServer = socketIo(httpServer);
    done();
  });

  afterAll((done) => {
    ioServer.close();
    httpServer.close();
    done();
  });

  test('connects to the server', (done) => {
    connect((response) => {
      expect(response.type).toBe('connection');
      done();
    }, `http://[${httpServerAddr.address}]:${httpServerAddr.port}`);
  });
});

import socketIOClient from 'socket.io-client';

let socket;

export const connect = (callback, socketUrl) => {
  socket = socketIOClient(socketUrl);

  socket.on('error', () => {
    callback({ type: 'error', body: 'Server error' });
  });

  socket.on('disconnect', () => {
    callback({ type: 'error', body: 'Unable to connect to server' });
  });

  socket.on('newEvent', (newEvent) => {
    callback({ type: 'message', body: newEvent });
  });

  socket.on('connect', () => {
    callback({ type: 'connection' });
    socket.emit('play');
  });
};

export const pause = () => {
  socket.emit('pause');
};

export const play = () => {
  socket.emit('play');
};

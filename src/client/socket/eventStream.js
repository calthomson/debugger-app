import socketIOClient from 'socket.io-client';

const socket = socketIOClient('http://localhost:8000/');

export const subscribe = (callback) => {
  socket.on('connect', () => {
    socket.on('newEvent', (newEvent) => {
      callback(null, newEvent);
    });
    socket.emit('subscribe');
  });
};

export const pause = () => {
  socket.emit('unsubscribe');
};

export const resume = () => {
  socket.emit('subscribe');
};

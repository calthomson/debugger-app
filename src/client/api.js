import openSocket from 'socket.io-client';

const socket = openSocket('http://localhost:8000');

function subscribeToEvents(callback) {
  socket.on('socketEvents', events => callback(null, events));
  socket.emit('subscribeToEvents', 1000);
}
export default subscribeToEvents;

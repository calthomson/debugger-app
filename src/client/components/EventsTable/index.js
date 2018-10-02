import React, { Component } from 'react';
import {
  Table,
  TableRow,
  TextTableCell,
} from 'evergreen-ui';
import socketIOClient from 'socket.io-client';

const socket = socketIOClient('http://localhost:8000/');

const renderEventRow = event => (
  <TableRow key={event}>
    <TextTableCell>{event}</TextTableCell>
  </TableRow>
);

export default class App extends Component {
  state = { events: [] };

  componentDidMount() {
    socket.on('connect', () => {
      socket.on('newEvent', (newEvent) => {
        const { events } = this.state;
        this.setState({ events: [newEvent].concat(events) });
      });
    });

    socket.emit('subscribeToEvents');
  }

  render() {
    const { events } = this.state;
    return (
      <Table>
        {events.map(renderEventRow)}
      </Table>
    );
  }
}

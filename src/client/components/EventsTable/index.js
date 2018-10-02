import React, { Component } from 'react';
import {
  Table,
  TableRow,
  TextTableCell,
} from 'evergreen-ui';

import subscribeToEvents from '../../api';

const renderEventRow = event => (
  <TableRow key={event.message}>
    <TextTableCell>{event.message}</TextTableCell>
  </TableRow>
);

export default class App extends Component {
  state = { events: [] };

  componentDidMount() {
    subscribeToEvents((err, events) => this.setState({
      events
    }));
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

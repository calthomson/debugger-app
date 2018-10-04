import React, { Component } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableRow,
  TextTableCell,
} from 'evergreen-ui';

import { subscribe, pause, resume } from '../../socket/eventStream';

const cache = [];
const pageSize = 20;

const renderEventRow = event => (
  <TableRow key={event}>
    <TextTableCell>{event}</TextTableCell>
  </TableRow>
);

export default class EventsTable extends Component {
  state = {
    events: [], pageCount: 0, currPage: 0, paused: false
  };

  componentDidMount() {
    subscribe((err, newEvent) => {
      cache.unshift(newEvent);
    });

    setInterval(() => {
      this.setState({ events: cache, pageCount: Math.floor(cache.length / pageSize) });
    }, 16);
  }

  renderPageControls() {
    const pageControls = [];
    const { currPage, pageCount } = this.state;

    for (let i = 0; i <= pageCount; i += 1) {
      pageControls.push(
        <Button
          key={i}
          onClick={() => this.setState({ currPage: i })}
          isActive={currPage === i}
        >
          {i}
        </Button>
      );
    }

    return pageControls;
  }

  render() {
    const { events, currPage, paused } = this.state;
    const pageStart = currPage * pageSize;
    const pageEnd = pageStart + pageSize;

    return (
      <div>
        {paused
          ? <Button onClick={() => { resume(); this.setState({ paused: false }); }}>Resume</Button>
          : <Button onClick={() => { pause(); this.setState({ paused: true }); }}>Pause</Button>
        }
        <Table>
          <TableBody>
            {events.slice(pageStart, pageEnd).map(renderEventRow)}
          </TableBody>
        </Table>
        {this.renderPageControls()}
      </div>
    );
  }
}

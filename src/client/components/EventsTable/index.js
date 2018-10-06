import React, { Component } from 'react';
import {
  Alert,
  SearchInput,
  SegmentedControl,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TextTableCell,
} from 'evergreen-ui';

import { connect, pause, play } from '../../socket/eventStream';
import PageControllers from '../PageControllers';

const renderEventRow = event => (
  <TableRow key={event}>
    <TextTableCell>{event}</TextTableCell>
  </TableRow>
);

export default class EventsTable extends Component {
  state = {
    eventsLength: 0, pageCount: 0, page: 0, stream: 'live', filter: '', connected: false,
  };

  events = [];

  PAGE_SIZE = 20;

  componentDidMount() {
    connect((response) => {
      if ((response.type === 'error')) {
        this.setState({ connected: false });
      } else if (response.type === 'connection') {
        this.setState({ connected: true });
      } else {
        this.events.unshift(response.body);
      }
    }, 'http://localhost:8000/');

    setInterval(() => {
      const { pageCount, page, eventsLength, } = this.state;
      if (this.events.length === eventsLength) return;
      const newPageCount = Math.floor(eventsLength / this.PAGE_SIZE);
      this.setState({
        eventsLength: this.events.length,
        pageCount: newPageCount,
        page: newPageCount < pageCount ? 0 : page,
      });
    }, 16);
  }

  render() {
    const {
      page, pageCount, stream, connected, filter
    } = this.state;
    const pageStart = page * this.PAGE_SIZE;
    const pageEnd = pageStart + this.PAGE_SIZE;

    const filteredEvents = filter === '' ? this.events : this.events.filter(event => event.includes(filter));

    return (
      <div>
        { !connected && (
          <Alert
            marginBottom={5}
            type="warning"
            title="Disconnected from server"
          />
        )}
        <Table style={{ marginBottom: 5 }}>
          <TableHead style={{ padding: 16 }}>
            <SegmentedControl
              width={160}
              options={[{ label: 'Live', value: 'live' }, { label: 'Pause', value: 'pause' }]}
              value={stream}
              onChange={(value) => { this.setState({ stream: value }); if (value === 'pause') pause(); else play(); }}
              style={{ marginRight: 16, height: 40 }}
            />
            <SearchInput
              placeholder="Type to search..."
              onChange={(event) => { this.setState({ filter: event.target.value }); }}
              height={40}
              width="100%"
            />
          </TableHead>
          <TableBody>
            {filteredEvents.slice(pageStart, pageEnd).map(renderEventRow)}
          </TableBody>
        </Table>
        <PageControllers
          page={page}
          jumpToPage={(e) => {
            const val = parseInt(e.target.value, 10) || 0; // Check that input is valid number
            this.setState({ page: val < 0 || val > pageCount ? page : val }); // Check range
          }}
          previous={() => { this.setState({ page: page - 1 }); }}
          next={() => { this.setState({ page: page + 1 }); }}
          pageCount={pageCount}
        />
      </div>
    );
  }
}

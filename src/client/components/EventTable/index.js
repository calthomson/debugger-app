import React, { Component } from 'react';
import {
  Alert,
  SearchInput,
  SegmentedControl,
  Table,
  TableBody,
  TableHead,
} from 'evergreen-ui';

import { connect, pause, play } from '../../socket/eventStream';
import PageControllers from '../PageControllers';
import EventRow from '../EventRow';

export const PAGE_SIZE = 20;

export default class EventTable extends Component {
  state = {
    page: 0, stream: 'live', filter: '', connected: false,
  };

  events = [];

  constructor() {
    super();
    this.onAnimationFrame = this.onAnimationFrame.bind(this);
  }

  componentDidMount() {
    connect((response) => {
      if ((response.type === 'error')) {
        this.setState({ connected: false });
      } else if (response.type === 'connection') {
        this.setState({ connected: true });
      } else {
        this.events.unshift(response.body);
        if (!this.frameId) {
          this.frameId = window.requestAnimationFrame(this.onAnimationFrame);
        }
      }
    }, 'http://localhost:8000/');
  }

  onAnimationFrame() {
    this.frameId = null;
    this.forceUpdate();
  }

  render() {
    const {
      page, stream, connected, filter
    } = this.state;
    const pageStart = page * PAGE_SIZE;
    const pageEnd = pageStart + PAGE_SIZE;

    const filteredEvents = filter === '' ? this.events : this.events.filter(event => event.includes(filter));
    const pageCount = Math.floor(filteredEvents.length / PAGE_SIZE);

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
              options={[{ label: 'Live', value: 'live', 'data-testid': 'live' }, { label: 'Pause', value: 'pause' }]}
              value={stream}
              onChange={(value) => { this.setState({ stream: value }); if (value === 'pause') pause(); else play(); }}
              style={{ marginRight: 16, height: 40 }}
            />
            <SearchInput
              placeholder="Type to search..."
              onChange={(event) => { this.setState({ filter: event.target.value, page: 0 }); }}
              height={40}
              width="100%"
            />
          </TableHead>
          <TableBody>
            {filteredEvents.slice(pageStart, pageEnd).map((eventString) => {
              const event = JSON.parse(eventString);
              return <EventRow event={event} key={event.messageId} />;
            })}
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

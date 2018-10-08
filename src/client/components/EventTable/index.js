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

export const PAGE_SIZE = 13;

export default class EventTable extends Component {
  state = {
    page: 1, stream: 'live', filter: '', connected: false,
  };

  events = [];

  constructor() {
    super();
    this.onAnimationFrame = this.onAnimationFrame.bind(this);
    this.handleSearchInput = this.handleSearchInput.bind(this);
    this.getFilteredEvents = this.getFilteredEvents.bind(this);
    this.filterEvent = this.filterEvent.bind(this);
  }

  componentDidMount() {
    connect((response) => {
      if ((response.type === 'error')) {
        this.setState({ connected: false });
      } else if (response.type === 'connection') {
        this.setState({ connected: true });
      } else {
        this.events.unshift(JSON.parse(response.body));
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

  getFilteredEvents() {
    const { filter } = this.state;
    if (filter === '') {
      return this.events;
    }

    return this.events.filter(this.filterEvent);
  }

  filterEvent(event) {
    const { filter } = this.state;
    const { type } = event;
    const eventData = [type];

    if (type === 'page') {
      eventData.push(event.properties.path);
    } else if (type === 'identify') {
      eventData.push(event.traits.name);
    } else {
      eventData.push(event.event);
    }

    return eventData.join(' ').toLowerCase().includes(filter);
  }

  handleSearchInput(events) {
    this.setState({ filter: events.target.value.toLowerCase(), page: 1 });
  }

  render() {
    const {
      page, stream, connected
    } = this.state;

    const pageStart = (page - 1) * PAGE_SIZE;

    const pageEnd = pageStart + PAGE_SIZE;

    const filteredEvents = this.getFilteredEvents();

    const pageCount = 1 + Math.floor(filteredEvents.length / PAGE_SIZE);

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
              onChange={this.handleSearchInput}
              height={40}
              width="100%"
            />
          </TableHead>
          <TableBody>
            {filteredEvents
              .slice(pageStart, pageEnd)
              .map(event => <EventRow event={event} key={event.messageId} />)}
          </TableBody>
        </Table>
        <PageControllers
          page={page}
          jumpToPage={(e) => {
            const val = parseInt(e.target.value, 10) || 1; // Check that input is valid number
            this.setState({ page: val < 1 || val > pageCount ? page : val }); // Check range
          }}
          previous={() => { this.setState({ page: page - 1 }); }}
          next={() => { this.setState({ page: page + 1 }); }}
          pageCount={pageCount}
        />
      </div>
    );
  }
}

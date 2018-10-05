import React, { Component } from 'react';
import {
  SearchInput,
  SegmentedControl,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TextTableCell,
} from 'evergreen-ui';

import { subscribe, pause, resume } from '../../socket/eventStream';
import PageControllers from '../PageControllers';

const cache = [];
const pageSize = 20;

const renderEventRow = event => (
  <TableRow key={event}>
    <TextTableCell>{event}</TextTableCell>
  </TableRow>
);

export default class EventsTable extends Component {
  state = {
    events: [], pageCount: 0, page: 0, stream: 'live', filter: ''
  };

  componentDidMount() {
    subscribe((err, newEvent) => {
      cache.unshift(newEvent);
    });

    setInterval(() => {
      const { filter, pageCount, page } = this.state;
      const events = filter === '' ? cache : cache.filter(event => event.includes(filter));
      const newPageCount = Math.floor(events.length / pageSize);
      this.setState({
        events,
        pageCount: newPageCount,
        // If the page count goes down (eg. when a filter is applied) set the current page to 0
        page: newPageCount < pageCount ? 0 : page,
      });
    }, 16);
  }

  render() {
    const {
      page, events, pageCount, stream
    } = this.state;
    const pageStart = page * pageSize;
    const pageEnd = pageStart + pageSize;

    return (
      <div>
        <Table style={{ marginBottom: 5 }}>
          <TableHead style={{ padding: 16 }}>
            <SegmentedControl
              width={160}
              options={[{ label: 'Live', value: 'live' }, { label: 'Pause', value: 'pause' }]}
              value={stream}
              onChange={(value) => { this.setState({ stream: value }); if (value === 'pause') pause(); else resume(); }}
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
            {events.slice(pageStart, pageEnd).map(renderEventRow)}
          </TableBody>
        </Table>
        <PageControllers
          page={page}
          jumpToPage={(e) => {
            const val = parseInt(e.target.value, 10) || 0; // Check that input is valid number
            this.setState({ page: val < 0 || val > pageCount ? page : val }); // Check range
          }}
          last={() => { this.setState({ page: page - 1 }); }}
          next={() => { this.setState({ page: page + 1 }); }}
          pageCount={pageCount}
        />
      </div>
    );
  }
}

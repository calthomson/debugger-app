import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {
  Table,
  TableRow,
} from 'evergreen-ui';

import EventsTable from '.';

Enzyme.configure({ adapter: new Adapter() });

describe('EventsTable component', () => {
  it('renders a table component', () => {
    const wrapper = shallow(<EventsTable />);

    expect(wrapper.find(Table)).toHaveLength(1);
  });

  it('renders a notice when server sends an error notification', () => {
  });

  describe('table', () => {
    it('renders a row component for each event in the state when page count < PAGE_SIZE', () => {
      const wrapper = mount(<EventsTable />);

      wrapper.setState({ events: [1, 2, 3] });

      expect(wrapper.find(TableRow)).toHaveLength(3);
    });

    it('renders PAGE_SIZE rows when page count > PAGE_SIZE', () => {
    });

    it('displays correct set of events depending on table control input', () => {
    });
  });

  describe('stream control buttons', () => {
    it('can pause stream', () => {
    });

    it('can resume stream', () => {
    });
  });

  describe('filter', () => {
    it('removes non-matching results from view when filter is applied', () => {
    });

    it('restores all results from view when filter is removed', () => {
    });
  });

  describe('table control', () => {
    it('goes to the next page in table when the \'next\' button is clicked', () => {
    });

    it('goes to the previous page when the \'previous\' button is clicked', () => {
    });

    it('jumps to the target page when the \'current page\' input is changed', () => {
    });

    it('does not allow non-numbers or negative numbers for current page input', () => {
    });

    it('displays the correct total page count, even when a filter is applied', () => {
    });
  });
});

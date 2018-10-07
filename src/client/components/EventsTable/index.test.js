import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';
import {
  Alert,
  SearchInput,
  SegmentedControl,
  Table,
  TableRow,
} from 'evergreen-ui';

import { connect, pause, play } from '../../socket/eventStream';
import EventsTable, { PAGE_SIZE } from '.';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('../../socket/eventStream');

const printMockEvents = (callback, quantity) => {
  for (let i = 0; i < quantity; i += 1) { // TODO make a function
    callback({ type: 'message', body: `Mock event ${i}` });
  }
};

describe('EventsTable component', () => {
  it('renders a table component', () => {
    const wrapper = shallow(<EventsTable />);

    expect(wrapper.find(Table)).toHaveLength(1);
  });

  describe('error alert', () => {
    it('renders alert when server sends an error', () => {
      connect.mockImplementationOnce(callback => callback({ type: 'error', body: null }));

      const wrapper = mount(<EventsTable />);

      expect(wrapper.find(Alert)).toHaveLength(1);
    });

    it('removes alert when server connects', () => {
      connect.mockImplementationOnce(callback => callback({ type: 'connection', body: null }));

      const wrapper = mount(<EventsTable />);

      expect(wrapper.find(Alert)).toHaveLength(0);
    });
  });

  describe('table', () => {
    it('renders a row component for each event when page count < PAGE_SIZE', (done) => {
      connect.mockImplementationOnce(callback => printMockEvents(callback, 10));

      const wrapper = mount(<EventsTable />);

      setTimeout(() => {
        wrapper.update();
        expect(wrapper.find(TableRow)).toHaveLength(10);
        done();
      }, 100);
    });

    it('renders PAGE_SIZE rows when page count > PAGE_SIZE', (done) => {
      connect.mockImplementationOnce(callback => printMockEvents(callback, PAGE_SIZE + 1));

      const wrapper = mount(<EventsTable />);

      setTimeout(() => {
        wrapper.update();
        expect(wrapper.find(TableRow)).toHaveLength(PAGE_SIZE);
        done();
      }, 100);
    });
  });

  describe('stream control', () => {
    it('live button plays stream', () => {
      play.mockImplementationOnce(() => {});

      const wrapper = mount(<EventsTable />);

      const controlButtons = wrapper.find(SegmentedControl).find('input');

      const liveButton = controlButtons.findWhere(comp => comp.prop('value') === 'live');

      liveButton.simulate('change');

      expect(play).toHaveBeenCalled();
    });

    it('pause button pauses stream', () => {
      pause.mockImplementationOnce(() => {});

      const wrapper = mount(<EventsTable />);

      const controlButtons = wrapper.find(SegmentedControl).find('input');

      const liveButton = controlButtons.findWhere(comp => comp.prop('value') === 'pause');

      liveButton.simulate('change');

      expect(pause).toHaveBeenCalled();
    });
  });

  describe('filter', () => {
    let wrapper;

    beforeAll(() => {
      connect.mockImplementationOnce((callback) => {
        callback({ type: 'message', body: 'I love broccoli' });
        callback({ type: 'message', body: 'Ice cream is awesome' });
        callback({ type: 'message', body: 'I love ice cream' });
      });

      wrapper = mount(<EventsTable />);
    });

    it('removes non-matching results from view when filter is applied', () => {
      wrapper.find(SearchInput).find('input').simulate('change', { target: { value: 'ice cream' } });

      wrapper.update();
      expect(wrapper.find(TableRow)).toHaveLength(1);
    });

    it('restores all results from view when filter is removed', () => {
      wrapper.find(SearchInput).find('input').simulate('change', { target: { value: '' } });

      wrapper.update();
      expect(wrapper.find(TableRow)).toHaveLength(3);
    });
  });

  describe('page control', () => {
    let wrapper;

    const verifyPageContents = (tableRows, page) => tableRows.reduce(
      (acc, row, i) => row.html().includes(wrapper.instance().events[i + (PAGE_SIZE * page)]),
      false
    );

    beforeEach((done) => {
      connect.mockImplementationOnce(callback => printMockEvents(callback, PAGE_SIZE + 2));

      wrapper = mount(<EventsTable />);

      setTimeout(() => {
        wrapper.update();
        done();
      }, 100);
    });

    it('goes to the next or previous page when \'next\' or \'previous\' buttons are clicked', () => {
      let correctRows = verifyPageContents(wrapper.find(TableRow), 0);

      expect(correctRows).toBe(true);

      wrapper.find('[data-testid="next"]').hostNodes().simulate('click');

      wrapper.update();

      correctRows = verifyPageContents(wrapper.find(TableRow), 1);

      expect(correctRows).toBe(true);

      wrapper.find('[data-testid="previous"]').hostNodes().simulate('click');

      wrapper.update();

      correctRows = verifyPageContents(wrapper.find(TableRow), 0);

      expect(correctRows).toBe(true);
    });

    it('jumps to the target page when the \'current page\' input is changed', () => {
      wrapper.find('[data-testid="jump-to-page-input"]').hostNodes().simulate('change', { target: { value: '1' } });

      wrapper.update();

      const correctRows = verifyPageContents(wrapper.find(TableRow), 1);

      expect(correctRows).toBe(true);
    });

    it('does not allow non-numbers or numbers outside of available page range', () => {
      const jumpInput = wrapper.find('[data-testid="jump-to-page-input"]').hostNodes();
      jumpInput.simulate('change', { target: { value: 'a' } });

      expect(jumpInput.props().value).toBe(0);

      jumpInput.simulate('change', { target: { value: '-10' } });

      expect(jumpInput.props().value).toBe(0);

      jumpInput.simulate('change', { target: { value: wrapper.state().pageCount } });

      expect(jumpInput.props().value).toBe(0);
    });

    it('displays the total pages', () => {
      const totalPagesLabel = wrapper.find('[data-testid="total-pages-label"]').hostNodes();
      expect(totalPagesLabel.props().children).toBe('of 1');
    });
  });
});

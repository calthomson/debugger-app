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
import EventTable, { PAGE_SIZE } from '.';

Enzyme.configure({ adapter: new Adapter() });

jest.mock('../../socket/eventStream');

const printMockEvents = (callback, quantity) => {
  for (let i = 0; i < quantity; i += 1) {
    callback({ type: 'message', body: `{"type":"track","messageId":"${i}","event":"mock event"}` });
  }
};

describe('EventTable component', () => {
  it('renders a table component', () => {
    const wrapper = shallow(<EventTable />);

    expect(wrapper.find(Table)).toHaveLength(1);
  });

  describe('error alert', () => {
    it('renders alert when server sends an error', () => {
      connect.mockImplementationOnce(callback => callback({ type: 'error', body: null }));

      const wrapper = mount(<EventTable />);

      expect(wrapper.find(Alert)).toHaveLength(1);
    });

    it('removes alert when server connects', () => {
      connect.mockImplementationOnce(callback => callback({ type: 'connection', body: null }));

      const wrapper = mount(<EventTable />);

      expect(wrapper.find(Alert)).toHaveLength(0);
    });
  });

  describe('table', () => {
    it('renders a row component for each event when page count < PAGE_SIZE', (done) => {
      connect.mockImplementationOnce(callback => printMockEvents(callback, 10));

      const wrapper = mount(<EventTable />);

      setTimeout(() => {
        wrapper.update();
        expect(wrapper.find(TableRow)).toHaveLength(10);
        done();
      }, 100);
    });

    it('renders PAGE_SIZE rows when page count > PAGE_SIZE', (done) => {
      connect.mockImplementationOnce(callback => printMockEvents(callback, PAGE_SIZE + 1));

      const wrapper = mount(<EventTable />);

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

      const wrapper = mount(<EventTable />);

      const controlButtons = wrapper.find(SegmentedControl).find('input');

      const liveButton = controlButtons.findWhere(comp => comp.prop('value') === 'live');

      liveButton.simulate('change');

      expect(play).toHaveBeenCalled();
    });

    it('pause button pauses stream', () => {
      pause.mockImplementationOnce(() => {});

      const wrapper = mount(<EventTable />);

      const controlButtons = wrapper.find(SegmentedControl).find('input');

      const liveButton = controlButtons.findWhere(comp => comp.prop('value') === 'pause');

      liveButton.simulate('change');

      expect(pause).toHaveBeenCalled();
    });
  });

  describe('filter', () => {
    it('shows correct results when filter is applied & removed', (done) => {
      connect.mockImplementationOnce((callback) => {
        callback({ type: 'message', body: '{"type":"track","messageId":"1","event":"I scream"}' });
        callback({ type: 'message', body: '{"type":"identify","messageId":"2","traits":{"name":"Ice cream"}}' });
        callback({ type: 'message', body: '{"type":"page","messageId":"3","properties":{"path":"/iceCream"}}' });
      });

      const wrapper = mount(<EventTable />);

      setTimeout(() => {
        wrapper.find(SearchInput).find('input').simulate('change', { target: { value: 'Ice cream' } });

        wrapper.update();
        expect(wrapper.find(TableRow)).toHaveLength(1);

        wrapper.find(SearchInput).find('input').simulate('change', { target: { value: '' } });

        wrapper.update();
        expect(wrapper.find(TableRow)).toHaveLength(3);

        done();
      }, 100);
    });

    it('reverts to first page when filter causes page count to become less than current page', (done) => {
      connect.mockImplementationOnce(callback => printMockEvents(callback, 41));

      const wrapper = mount(<EventTable />);

      setTimeout(() => {
        wrapper.update();

        expect(wrapper.find(TableRow)).toHaveLength(PAGE_SIZE);
        wrapper.find('[data-testid="jump-to-page-input"]').hostNodes().simulate('change', { target: { value: '2' } });

        expect(wrapper.state().page).toBe(2);

        wrapper.find(SearchInput).find('input').simulate('change', { target: { value: '2' } });

        wrapper.update();

        expect(wrapper.state().page).toBe(1);

        done();
      }, 100);
    });
  });

  describe('page control', () => {
    let wrapper;


    const verifyPageContents = (tableRows, page) => tableRows.reduce(
      (acc, row, i) => {
        const expectedEvent = wrapper.instance().events[i + (PAGE_SIZE * (page - 1))];
        return row.html().includes(expectedEvent.messageId);
      },
      false
    );

    beforeEach((done) => {
      connect.mockImplementationOnce(callback => printMockEvents(callback, PAGE_SIZE + 2));

      wrapper = mount(<EventTable />);

      setTimeout(() => {
        wrapper.update();
        done();
      }, 100);
    });

    it('goes to the next or previous page when \'next\' or \'previous\' buttons are clicked', () => {
      let correctRows = verifyPageContents(wrapper.find(TableRow), 1);

      expect(correctRows).toBe(true);

      wrapper.find('[data-testid="next"]').hostNodes().simulate('click');

      wrapper.update();

      correctRows = verifyPageContents(wrapper.find(TableRow), 2);

      expect(correctRows).toBe(true);

      wrapper.find('[data-testid="previous"]').hostNodes().simulate('click');

      wrapper.update();

      correctRows = verifyPageContents(wrapper.find(TableRow), 1);

      expect(correctRows).toBe(true);
    });

    it('jumps to the target page when the \'current page\' input is changed', () => {
      const jumpToPageInput = wrapper.find('[data-testid="jump-to-page-input"]');
      jumpToPageInput.hostNodes().simulate('focus');
      jumpToPageInput.hostNodes().simulate('change', { target: { value: '2' } });

      wrapper.update();

      const correctRows = verifyPageContents(wrapper.find(TableRow), 2);

      expect(correctRows).toBe(true);
    });

    it('does not allow non-numbers or numbers outside of available page range', () => {
      const jumpInput = wrapper.find('[data-testid="jump-to-page-input"]').hostNodes();
      jumpInput.simulate('change', { target: { value: 'a' } });

      expect(jumpInput.props().value).toBe(1);

      jumpInput.simulate('change', { target: { value: '-10' } });

      expect(jumpInput.props().value).toBe(1);

      jumpInput.simulate('change', { target: { value: wrapper.state().pageCount } });

      expect(jumpInput.props().value).toBe(1);
    });

    it('displays the total pages', () => {
      const totalPagesLabel = wrapper.find('[data-testid="total-pages-label"]').hostNodes();
      expect(totalPagesLabel.props().children).toBe('of 2');
    });
  });
});

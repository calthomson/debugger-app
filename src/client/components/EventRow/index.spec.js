import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import React from 'react';

import EventRow from '.';

Enzyme.configure({ adapter: new Adapter() });

describe('EventTable component', () => {
  it('renders a \'track\' event correctly', () => {
    const event = { type: 'track', messageId: '2', event: 'Mock event' };

    const wrapper = mount(<EventRow event={event} />);

    const info = wrapper.find('[data-testid="event-info"] span');

    expect(info.props().children).toBe('Mock event');
  });
  it('renders a \'identify\' event correctly', () => {
    const event = { type: 'identify', messageId: '2', traits: { name: 'Ms. Mock Event' } };

    const wrapper = mount(<EventRow event={event} />);

    const info = wrapper.find('[data-testid="event-info"] span');

    expect(info.props().children).toBe('Ms. Mock Event');
  });
  it('renders a \'page\' event correctly', () => {
    const event = { type: 'page', messageId: '2', properties: { path: '/mockEvent' } };

    const wrapper = mount(<EventRow event={event} />);

    const info = wrapper.find('[data-testid="event-info"] span');

    expect(info.props().children).toBe('/mockEvent');
  });
});

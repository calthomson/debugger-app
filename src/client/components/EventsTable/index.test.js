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

  it('renders a row component for each event in the state', () => {
    const wrapper = mount(<EventsTable />);

    wrapper.setState({ events: [1, 2, 3] });

    expect(wrapper.find(TableRow)).toHaveLength(3);
  });
});

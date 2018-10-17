import React from 'react';
import {
  CheckCircleIcon,
  TableRow,
  TextTableCell,
  Text,
} from 'evergreen-ui';

const iconCellStyles = { maxWidth: 70, paddingLeft: 20 };
const typeCellStyles = { maxWidth: 120 };
const dateCellStyles = { maxWidth: 170, paddingRight: 20 };

const EventRow = ({ event }) => {
  let info;

  if (event.type === 'page') {
    info = event.properties.path;
  } else if (event.type === 'identify') {
    info = event.traits.name;
  } else {
    info = event.event;
  }

  const date = new Date(event.sentAt);

  const sentAt = date.toLocaleString('en-US', { hour12: false }).replace(',', '');

  return (
    <TableRow key={event.messageId}>
      <TextTableCell borderRight={null} height={56} style={iconCellStyles}>
        <CheckCircleIcon />
      </TextTableCell>
      <TextTableCell borderRight={null} height={56} style={typeCellStyles}>
        <Text size={200} isUppercase data-testid="event-type">{event.type}</Text>
      </TextTableCell>
      <TextTableCell borderRight={null} height={56}>
        <Text size={400} data-testid="event-info">{info}</Text>
      </TextTableCell>
      <TextTableCell borderRight={null} height={56} textAlign="right" style={dateCellStyles}>
        <Text size={400} data-testid="event-sent-at">{sentAt}</Text>
      </TextTableCell>
    </TableRow>
  );
};

export default EventRow;

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

  switch (event.type) {
    case 'page':
      info = event.properties.path;
      break;
    case 'identify':
      info = event.traits.name;
      break;
    case 'track':
      info = event.event;
      break;
    default:
      info = '';
  }

  const date = new Date(event.sentAt);
  const sentAt = date.toLocaleString('en-US', { hour12: false }).replace(',', '');
  return (
    <TableRow key={event.messageId}>
      <TextTableCell borderRight={null} height={56} style={iconCellStyles}>
        <CheckCircleIcon />
      </TextTableCell>
      <TextTableCell borderRight={null} height={56} style={typeCellStyles}>
        <Text size={200} isUppercase>{event.type}</Text>
      </TextTableCell>
      <TextTableCell borderRight={null} height={56}>
        <Text size={400}>{info}</Text>
      </TextTableCell>
      <TextTableCell borderRight={null} height={56} textAlign="right" style={dateCellStyles}>
        <Text size={400}>{sentAt}</Text>
      </TextTableCell>
    </TableRow>
  );
};

export default EventRow;

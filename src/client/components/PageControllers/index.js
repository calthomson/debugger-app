import React from 'react';
import {
  IconButton,
  Label,
  TextInput,
} from 'evergreen-ui';

const PageControllers = ({
  page,
  jumpToPage,
  last,
  next,
  pageCount,
}) => {
  const morePagesLeft = page > 0;
  const morePagesRight = page < pageCount;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      { morePagesLeft
        && (
          <IconButton
            key="left"
            icon="triangle"
            iconAim="left"
            onClick={last}
          />
        )
      }
      <div style={{ margin: '0 5px' }}>
        <TextInput height={32} width={80} onChange={jumpToPage} value={page} />
        <Label size={300} style={{ paddingLeft: 5 }}>{`of ${pageCount}`}</Label>
      </div>
      { morePagesRight
        && (
          <IconButton
            key="right"
            icon="triangle"
            iconAim="right"
            onClick={next}
            style={{ float: 'right' }}
          />
        )
      }
    </div>
  );
};

export default PageControllers;

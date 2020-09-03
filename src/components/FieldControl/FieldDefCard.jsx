/* eslint-disable react/jsx-boolean-value */
import {
  AppBar,
  Grid,
  NativeSelect,
  Paper,
  Typography,
} from '@material-ui/core';
import React, { memo, useMemo, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import ItemTypes from './ItemTypes';

const style = {
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
  cursor: 'grab',
};

const Card = memo(({ id, details, moveCard }) => {
  const ref = useRef(null);
  const [{ isDragging }, connectDrag] = useDrag({
    item: { id, type: ItemTypes.CARD },
    collect: (monitor) => {
      const result = {
        isDragging: monitor.isDragging(),
      };
      return result;
    },
  });
  const [, connectDrop] = useDrop({
    accept: ItemTypes.CARD,
    hover({ id: draggedId }) {
      if (draggedId !== id) {
        moveCard(draggedId, id);
      }
    },
  });
  connectDrag(ref);
  connectDrop(ref);
  const opacity = isDragging ? 0 : 1;
  const containerStyle = useMemo(() => ({ ...style, opacity }), [opacity]);
  const data = [];

  data.push(<option value="none">none</option>);

  if (details.type === 'string') {
    data.push(<option value="autoGen">autoGen</option>);
    data.push(<option value="textEditor">textEditor</option>);
    data.push(<option value="richTextEditor">richTextEditor</option>);
    data.push(<option value="dateTimePicker">dateTimePicker</option>);
    data.push(<option value="imageReference">imageReference</option>);
    data.push(<option value="imageURL">imageURL</option>);
    data.push(<option value="videoReference">videoReference</option>);
    data.push(<option value="videoURL">videoURL</option>);
  }

  if (details.type === 'boolean') {
    data.push(<option value="booleanSelect">boolean</option>);
  }

  if (details.type === 'number') {
    data.push(<option value="numberEditor">numberEditor</option>);
    data.push(<option value="position">position</option>);
  }

  const width = [];

  for (let i = 0; i < 12; i++) {
    width.push(<option value={i + 1}>{i + 1}</option>);
  }

  const setControl = (event) => {
    details.control = event;
  };
  const setKey = (event) => {
    details.isKey = event;
  };
  const showOnTable = (event) => {
    details.isVisibleOnTable = event;
  };
  const showOnPage = (event) => {
    details.isVisibleOnPage = event;
  };
  const setWidth = (event) => {
    details.width = parseInt(event);
  };

  return (
    <Paper style={{ maxHeight: 160, marginBottom: 30 }}>
      <AppBar
        style={{ height: 30, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
        position="static"
        color="default"
        elevation={0}
      >
        <Typography variant="subtitle1" align="center">
          {details.field_name}
        </Typography>
      </AppBar>
      <div ref={ref} style={containerStyle}>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <div>
              <Typography>Control</Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <Typography>Key</Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <Typography>Show on table</Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <Typography>Show on page</Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <Typography>Width on page</Typography>
            </div>
          </Grid>
          <Grid item xs={3}>
            <div>
              <NativeSelect
                defaultValue={details.control}
                onChange={(e) => setControl(e.target.value)}
              >
                {data}
              </NativeSelect>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <NativeSelect
                defaultValue={details.isKey}
                onChange={(e) => setKey(e.target.value == 'true')}
              >
                <option value={true}>True</option>
                <option value={false}>False</option>
              </NativeSelect>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <NativeSelect
                defaultValue={details.isVisibleOnTable}
                onChange={(e) => showOnTable(e.target.value == 'true')}
              >
                <option value={true}>Show</option>
                <option value={false}>Hide</option>
              </NativeSelect>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <NativeSelect
                defaultValue={details.isVisibleOnPage}
                onChange={(e) => showOnPage(e.target.value == 'true')}
              >
                <option value={true}>Show</option>
                <option value={false}>Hide</option>
              </NativeSelect>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <NativeSelect
                defaultValue={details.width}
                onChange={(e) => setWidth(e.target.value)}
              >
                {width}
              </NativeSelect>
            </div>
          </Grid>
        </Grid>
      </div>

      {moveCard}
    </Paper>
  );
});
export default Card;

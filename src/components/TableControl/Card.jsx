import {
  AppBar,
  Grid,
  IconButton,
  NativeSelect,
  Paper,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import React, { memo, useMemo, useRef } from 'react';

const style = {
  padding: '0.5rem 1rem',
  marginBottom: '.5rem',
  backgroundColor: 'white',
};

const Card = memo(({ id, entry, deleteField }) => {
  const ref = useRef(null);
  const containerStyle = useMemo(() => ({ ...style }));
  const data = [];

  data.push(<option value="string">string</option>);
  data.push(<option value="number">number</option>);
  data.push(<option value="boolean">boolean</option>);

  const width = [];

  for (let i = 0; i < 12; i++) {
    width.push(<option value={i + 1}>{i + 1}</option>);
  }

  const setDataType = (event) => {
    entry.dataType = event;
  };
  const setFieldName = (event) => {
    entry.fieldName = event;
  };
  const setValue = (event) => {
    entry.value = event;
  };

  return (
    <Paper style={{ maxHeight: 160, marginBottom: 30 }}>
      <AppBar
        style={{ height: 30, borderBottom: '1px solid rgba(0, 0, 0, 0.12)' }}
        position="static"
        color="default"
        elevation={0}
      >
        <Grid container spacing={1}>
          <Grid item xs />
          <Grid item>
            <IconButton
              edge="start"
              aria-label="remove"
              style={{ padding: 0 }}
              onClick={() => deleteField(entry)}
            >
              <Close />
            </IconButton>
          </Grid>
        </Grid>
      </AppBar>
      <div ref={ref} style={containerStyle}>
        <Grid container spacing={2}>
          <Grid item xs={2}>
            <div>
              <Typography>Data Type</Typography>
            </div>
          </Grid>
          <Grid item xs={5}>
            <div>
              <Typography>Field Name</Typography>
            </div>
          </Grid>
          <Grid item xs={5}>
            <div>
              <Typography>Value</Typography>
            </div>
          </Grid>
          <Grid item xs={2}>
            <div>
              <NativeSelect
                defaultValue={entry.dataType}
                onChange={(e) => setDataType(e.target.value)}
              >
                {data}
              </NativeSelect>
            </div>
          </Grid>
          <Grid item xs={5}>
            <div>
              <input
                placeholder="Enter Field Name"
                defaultValue={entry.fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                type="text"
                style={{ width: '90%' }}
              />
            </div>
          </Grid>
          <Grid item xs={5}>
            <div>
              <input
                placeholder="Enter Value"
                defaultValue={entry.value}
                onChange={(e) => setValue(e.target.value)}
                type="text"
                style={{ width: '90%' }}
              />
            </div>
          </Grid>
        </Grid>
      </div>
    </Paper>
  );
});
export default Card;

import { Grid } from '@material-ui/core';
import React from 'react';
import Datetime from 'react-datetime';

export default function DateTimePicker(props) {
  return (
    <Grid item xs={props.width}>
      <Grid container spacing={0}>
        <Grid item xs={4}>
          <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
        </Grid>
        <Grid item xs={12}>
          <Datetime
            margin="normal"
            initialValue={props.defaultValue}
            onChange={(e) => props.handleChange(props.currentKey, e.toDate())}
            style={{ width: '100%' }}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

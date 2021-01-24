import { Grid } from '@material-ui/core';
import React from 'react';

export default function NumberEditor(props) {
  return (
    <Grid item xs={props.width}>
      <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
      <input
        placeholder="Enter value here"
        defaultValue={props.defaultValue}
        onChange={(e) =>
          props.handleChange(props.currentKey, parseInt(e.target.value))
        }
        type="number"
        style={{ width: '100%' }}
      />
    </Grid>
  );
}

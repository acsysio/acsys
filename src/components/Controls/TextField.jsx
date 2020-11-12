import React from 'react';
import { Grid } from '@material-ui/core';

function TextField(props) {
  return (
    <Grid item xs={props.width}>
      <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
      <input
        placeholder="Enter value here"
        defaultValue={props.defaultValue}
        onChange={(e) => props.handleChange(props.currentKey, e.target.value)}
        type="text"
        style={{ width: '100%' }}
      />
    </Grid>
  );
}
export default TextField;

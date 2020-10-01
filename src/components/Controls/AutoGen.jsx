import React from 'react';
import { Grid } from '@material-ui/core';

function AutoGen(props) {
  return (
    <Grid item xs={props.width}>
      <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
      <input
        placeholder="Enter value here"
        defaultValue={props.defaultValue}
        readOnly
        type="text"
        style={{ width: '100%' }}
      />
    </Grid>
  );
}
export default AutoGen;

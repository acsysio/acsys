import { Grid, NativeSelect } from '@material-ui/core';
import React from 'react';

export default function BooleanSelect(props) {
  return (
    <Grid item xs={props.width}>
      <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
      <NativeSelect
        defaultValue={Boolean(props.defaultValue)}
        onChange={(e) =>
          props.handleChange(props.currentKey, e.target.value == 'true')
        }
        inputProps={{
          name: props.currentKey,
        }}
        style={{ width: '100%' }}
      >
        <option value>True</option>
        <option value={false}>False</option>
      </NativeSelect>
    </Grid>
  );
}

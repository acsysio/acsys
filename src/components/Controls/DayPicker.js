import { Grid, NativeSelect } from '@material-ui/core';
import React from 'react';

export default function DayPicker(props) {
  return (
    <Grid item xs={props.width}>
      <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
      <NativeSelect
        defaultValue={props.defaultValue}
        onChange={(e) => props.handleChange(props.currentKey, e.target.value)}
        inputProps={{
          name: props.currentKey,
        }}
        style={{ width: '100%' }}
      >
        <option value={'Sunday'}>Sunday</option>
        <option value={'Monday'}>Monday</option>
        <option value={'Tuesday'}>Tuesday</option>
        <option value={'Wednesday'}>Wednesday</option>
        <option value={'Thursday'}>Thursday</option>
        <option value={'Friday'}>Friday</option>
        <option value={'Saturday'}>Saturday</option>
      </NativeSelect>
    </Grid>
  );
}

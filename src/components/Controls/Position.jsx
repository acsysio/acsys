import { Grid, MenuItem, Select } from '@material-ui/core';
import React from 'react';

function Position(props) {
  if (props.draft) {
    return (
      <Grid item xs={props.width}>
        <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
        <input
          value="Auto generated on publish"
          readOnly
          style={{ width: '100%' }}
        />
      </Grid>
    );
  }
  return (
    <Grid item xs={props.width}>
      <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
      <Select
        defaultValue={props.defaultValue}
        onChange={(e) =>
          props.handleChange(props.currentKey, parseInt(e.target.value))
        }
        inputProps={{
          name: props.currentKey,
        }}
        style={{ width: '100%', textAlign: 'left' }}
      >
        {Object.values(props.position).map((pos, index) => {
          return <MenuItem value={pos[props.field_name]}>{index + 1}</MenuItem>;
        })}
      </Select>
    </Grid>
  );
}
export default Position;

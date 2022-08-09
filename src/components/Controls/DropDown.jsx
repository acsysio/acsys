import { Grid, NativeSelect } from '@mui/material';
import React, { useEffect, useState } from 'react';
import * as Acsys from '../../utils/Acsys/Acsys';

export default function DropDown(props) {
  const [option, setOption] = useState(props.defaultValue);
  const [options, setOptions] = useState([]);
  const select = (value) => {
    setOption(value);
    props.handleChange(props.currentKey, value);
  };
  useEffect(() => {
    Acsys.getData('acsys_details_dropdown', [
      ['acsys_id', '=', props.acsys_id],
      ['field_name', '=', props.field_name],
    ])
      .then((result) => {
        const tempArr = result[0].field.split(',');
        if (!tempArr.includes(props.defaultValue)) {
          setOption(tempArr[0]);
        }
        setOptions(tempArr);
      })
      .catch(() => {});
  }, []);
  return (
    <Grid item xs={props.width}>
      <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
      <NativeSelect
        value={option}
        onChange={(e) => select(e.target.value)}
        inputProps={{
          name: props.currentKey,
        }}
        style={{ width: '100%' }}
      >
        {options.map((val) => (
          <option value={val}>{val}</option>
        ))}
      </NativeSelect>
    </Grid>
  );
}

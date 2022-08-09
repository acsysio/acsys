import { Grid, Input } from '@mui/material';
import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

export default function DTPicker(props) {
  const [dt, setDt] = useState(props.defaultValue);
  const handleChange = (e) => {
    setDt(e);
    props.handleChange(props.currentKey, new Date(e));
  };
  return (
    <Grid item xs={props.width}>
      <Grid container spacing={0}>
        <Grid item xs={4}>
          <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
        </Grid>
        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              value={dt}
              onChange={(e) => handleChange(e)}
              renderInput={(params) => <TextField fullWidth sx={{ input: { padding: 1 } }} {...params} />}
            />
          </LocalizationProvider>
        </Grid>
      </Grid>
    </Grid>
  );
}

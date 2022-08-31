import { Grid } from '@mui/material';

export default function AutoGen(props) {
  return (
    <Grid item xs={props.width}>
      <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
      <input
        className="custom-input"
        placeholder="Value is auto generated"
        defaultValue={props.defaultValue}
        readOnly
        type="text"
        style={{ width: '100%' }}
      />
    </Grid>
  );
}

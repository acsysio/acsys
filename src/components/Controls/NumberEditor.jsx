import { Grid } from '@mui/material';

export default function NumberEditor(props) {
  return (
    <Grid item xs={props.width}>
      <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
      <input
        className="custom-input"
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

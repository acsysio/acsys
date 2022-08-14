import { Grid } from '@mui/material';
import TextField from '@mui/material/TextField';

export default function TField(props) {
  return (
    <Grid item xs={props.width}>
      <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
      <input
        className="custom-input"
        placeholder="Enter value here"
        defaultValue={props.defaultValue}
        onChange={(e) => props.handleChange(props.currentKey, e.target.value)}
        type="text"
        style={{ width: '100%' }}
      />
    </Grid>
  );
}

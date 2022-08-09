import { Grid } from '@mui/material';
import TextField from '@mui/material/TextField';

export default function NumberEditor(props) {
  return (
    <Grid item xs={props.width}>
      <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
      <TextField
        fullWidth
        sx={{ input: { padding: 1 } }}
        InputProps={{
          borderColor: '#ddd',
        }}
        placeholder="Enter value here"
        defaultValue={props.defaultValue}
        onChange={(e) =>
          props.handleChange(props.currentKey, parseInt(e.target.value))
        }
        type="number"
      />
    </Grid>
  );
}

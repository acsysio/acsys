import { Button, Grid } from '@mui/material';

export default function ImageReference(props) {
  if (props.url === undefined || props.url === '') {
    return (
      <Grid item xs={props.width}>
        <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
        <Button
          style={{ width: '100%' }}
          variant="contained"
          color="primary"
          onClick={(e) => props.openSelector('url', props.field_name)}
        >
          Select File
        </Button>
      </Grid>
    );
  }
  return (
    <Grid item xs={props.width}>
      <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
      <video
        style={{ width: '100%', marginBottom: 15 }}
        id="background-video"
        loop
        autoPlay
      >
        <source src={props.url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div>
        <Button
          variant="contained"
          color="primary"
          style={{ minWidth: 100, marginRight: 20 }}
          onClick={(e) => props.openSelector('url', props.field_name)}
        >
          Select
        </Button>
        <Button
          variant="contained"
          color="secondary"
          style={{ minWidth: 100, marginLeft: 20 }}
          onClick={(e) => props.removeFile(props.field_name)}
        >
          Remove
        </Button>
      </div>
    </Grid>
  );
}

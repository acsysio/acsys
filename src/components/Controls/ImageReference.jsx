import { Button, Grid } from '@material-ui/core';
import React from 'react';

function ImageReference(props) {
  if (props.url === undefined || props.url === '') {
    return (
      <Grid item xs={props.width}>
        <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
        <Button
          style={{ width: '100%' }}
          variant="contained"
          color="primary"
          onClick={(e) => props.openSelector('ref', props.field_name)}
        >
          Select File
        </Button>
      </Grid>
    );
  }
  return (
    <Grid item xs={props.width}>
      <h3 className="element-header">{props.field_name.toUpperCase()}</h3>
      <div className="image-container">
        <img src={props.url} style={{ maxHeight: 500, maxWidth: '100%' }} />
      </div>
      <div>
        <Button
          variant="contained"
          color="primary"
          style={{ minWidth: 100, marginRight: 20 }}
          onClick={(e) => props.openSelector('ref', props.field_name)}
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
export default ImageReference;

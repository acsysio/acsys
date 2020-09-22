import { Grid, Typography } from '@material-ui/core';
import React, { Component } from 'react';

class Loading extends Component {
  render() {
    return (
      <Grid
        container
        alignItems="center"
        justify="center"
        direction="column"
        style={{ height: '100vh' }}
      >
        <Grid container style={{ width: 300 }}>
          <img style={{ width: '100%' }} src="/prometheus-logo.svg" alt="" />
          <Typography variant="h4" style={{ margin: 'auto' }}>
            Loading..
          </Typography>
        </Grid>
      </Grid>
    );
  }
}

export default Loading;

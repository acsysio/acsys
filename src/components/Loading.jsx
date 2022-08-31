import { Grid, Typography } from '@mui/material';
import React, { Component } from 'react';

export default function Loading() {
  return (
    <Grid
      container
      alignItems="center"
      justify="center"
      direction="column"
      style={{ height: '100vh' }}
    >
      <Grid container style={{ width: 300 }}>
        <img style={{ width: '100%' }} src="/acsys-icon.svg" alt="" />
        <Typography variant="h4" style={{ margin: 'auto' }}>
          Loading...
        </Typography>
      </Grid>
    </Grid>
  );
}

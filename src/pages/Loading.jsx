import { Grid, Typography } from '@mui/material';
import React, { Component } from 'react';

export default function Loading() {
  return (
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      direction="column"
      style={{ height: '100vh' }}
    >
      <Grid item xs={3} >
        <img style={{ width: 300 }} src="/acsys-icon.svg" alt="" />
        <Typography variant="h4" style={{ margin: 'auto' }}>
          Loading...
        </Typography>
      </Grid>
    </Grid>
  );
}

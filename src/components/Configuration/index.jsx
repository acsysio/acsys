import {
  Box,
  Button,
  CircularProgress, 
  Container,
  Grid,
  Paper,
  Typography
} from '@material-ui/core';
import React, { Component } from 'react';
import * as Prom from '../../services/Prometheus/Prom';

const INITIAL_STATE = {
  apiKey: '',
  authDomain: '',
  databaseURL: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: '',
  loading: false,
  error: null,
};

class Configuration extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount = async () => {
    this.setState({ ...INITIAL_STATE });
  };

  onKeyDownSI = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.onSubmit();
    }
  };

  onSubmit = async (event) => {
    const {
      apiKey,
      authDomain,
      databaseURL,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      measurementId,
    } = this.state;

    this.setState({ loading: true });

    const config = {
      apiKey: apiKey,
      authDomain: authDomain,
      databaseURL: databaseURL,
      projectId: projectId,
      storageBucket: storageBucket,
      messagingSenderId: messagingSenderId,
      appId: appId,
      measurementId: measurementId,
    };

    await Prom.setInitialDatabaseConfig(config).then(async (json) => {
      await this.sleep(5000);
      await this.sleep(5000);
      window.location.reload();
    });

    event.preventDefault();
  };

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      apiKey,
      authDomain,
      databaseURL,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
      measurementId,
      loading,
      error,
    } = this.state;

    return (
      <Grid
        className="landing-grid"
        container
        alignItems="center"
        justify="center"
        direction="column"
      >
        <Container maxWidth="sm">
          <Paper style={{ margin: '50px' }}>
            <Box
              margin="auto"
              width="80%"
              display="flex"
              flexDirection="column"
              textAlign="center"
              padding="16px"
            >
              <Typography variant="h4" color="primary">
                Configure Firestore
              </Typography>

              <input
                id="apiKey"
                name="apiKey"
                placeholder="API Key"
                defaultValue={apiKey}
                onKeyDown={this.onKeyDownSI}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="authDomain"
                name="authDomain"
                placeholder="Auth Domain"
                defaultValue={authDomain}
                onKeyDown={this.onKeyDownSI}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="databaseURL"
                name="databaseURL"
                placeholder="Database URL"
                defaultValue={databaseURL}
                onKeyDown={this.onKeyDownSI}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="projectId"
                name="projectId"
                placeholder="Project ID"
                defaultValue={projectId}
                onKeyDown={this.onKeyDownSI}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="storageBucket"
                name="storageBucket"
                placeholder="Storage Bucket"
                defaultValue={storageBucket}
                onKeyDown={this.onKeyDownSI}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="messagingSenderId"
                name="messagingSenderId"
                placeholder="Messaging Sender ID"
                defaultValue={messagingSenderId}
                onKeyDown={this.onKeyDownSI}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="appId"
                name="appId"
                placeholder="App ID"
                defaultValue={appId}
                onKeyDown={this.onKeyDownSI}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="measurementId"
                name="measurementId"
                placeholder="Measurement ID"
                defaultValue={measurementId}
                onKeyDown={this.onKeyDownSI}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
            </Box>
            <Box
              margin="auto"
              width="50%"
              display="flex"
              flexDirection="column"
              textAlign="center"
              padding="16px"
            >
              <Button
                onClick={this.onSubmit}
                type="submit"
                variant="contained"
                color="primary"
              >
                {loading && <CircularProgress color="white" size={24} />}
                {!loading && 'Submit'}
              </Button>
              {error && (
                <Typography variant="body1" color="error">
                  {error.message}
                </Typography>
              )}
            </Box>
          </Paper>
        </Container>
      </Grid>
    );
  }
}

export default Configuration;

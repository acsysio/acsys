import {
  Box,
  Button,
  CircularProgress, 
  Container,
  Grid,
  NativeSelect,
  Paper,
  Typography
} from '@material-ui/core';
import React, { Component } from 'react';
import * as Prom from '../../services/Prometheus/Prom';

const INITIAL_STATE = {
  databaseType: 'Local',
  projectName: '',
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

  setDatabase = async (type) => {
    this.setState({
      databaseType: type
    });
  }

  onKeyDownSI = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.onSubmit();
    }
  };

  onSubmit = async (event) => {
    const {
      databaseType,
      projectName,
      apiKey,
      authDomain,
      databaseURL,
      projectId,
      measurementId,
    } = this.state;

    this.setState({ loading: true });

    const config = {
      databaseType: databaseType,
      projectName: projectName,
      apiKey: apiKey,
      authDomain: authDomain,
      databaseURL: databaseURL,
      projectId: projectId,
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

  renderConfig() {
    const {
      databaseType,
      projectName,
      apiKey,
      authDomain,
      databaseURL,
      projectId,
      measurementId
     } = this.state;

    if (databaseType === 'Local') {
      return (
        <div>
          <input
            id="projectName"
            name="projectName"
            placeholder="Project Name"
            defaultValue={projectName}
            onKeyDown={this.onKeyDownSI}
            onChange={this.onChange}
            style={{ marginTop: '20px', width: '96%' }}
          />
          <p>When this option is selected Prometheus will use the internal database.</p>
        </div>
      );
    }
    else if (databaseType === 'Firestore') {
      return (
        <div>
          <input
            id="apiKey"
            name="apiKey"
            placeholder="API Key"
            defaultValue={apiKey}
            onKeyDown={this.onKeyDownSI}
            onChange={this.onChange}
            style={{ marginTop: '20px', width: '96%' }}
          />
          <input
            id="authDomain"
            name="authDomain"
            placeholder="Auth Domain"
            defaultValue={authDomain}
            onKeyDown={this.onKeyDownSI}
            onChange={this.onChange}
            style={{ marginTop: '20px', width: '96%' }}
          />
          <input
            id="databaseURL"
            name="databaseURL"
            placeholder="Database URL"
            defaultValue={databaseURL}
            onKeyDown={this.onKeyDownSI}
            onChange={this.onChange}
            style={{ marginTop: '20px', width: '96%' }}
          />
          <input
            id="projectId"
            name="projectId"
            placeholder="Project ID"
            defaultValue={projectId}
            onKeyDown={this.onKeyDownSI}
            onChange={this.onChange}
            style={{ marginTop: '20px', width: '96%' }}
          />
          <input
            id="measurementId"
            name="measurementId"
            placeholder="Measurement ID"
            defaultValue={measurementId}
            onKeyDown={this.onKeyDownSI}
            onChange={this.onChange}
            style={{ marginTop: '20px', width: '96%' }}
          />
        </div>
      );
    }
  }

  render() {
    const {
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
                Configure Database
              </Typography>
              <NativeSelect
                onChange={(e) => this.setDatabase(e.target.value)}
                style={{ marginTop: '20px' }}
              >
                <option value={'Local'}>Local</option>
                <option value={'Firestore'}>Firestore</option>
              </NativeSelect>
              {this.renderConfig()}
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

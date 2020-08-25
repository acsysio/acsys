import {
  Box,
  Button,
  CircularProgress, 
  Container,
  Grid,
  Link,
  Paper,
  Typography
} from '@material-ui/core';
import React, { Component } from 'react';
import * as Prom from '../../services/Prometheus/Prom';

const INITIAL_STATE = {
  uploadFile: '',
  fileName: '',
  measurementId: '',
  loading: false,
  error: null,
};

class Configuration extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount = async () => {
    this.setState({ ...INITIAL_STATE });
  };

  setRef = (ref) => {
    this.setState({
      fileName: ref.target.files[0].name,
      uploadFile: ref.target.files[0],
    });
  };

  onKeyDownSI = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.onSubmit();
    }
  };

  onSubmit = async (event) => {
    try {
      this.setState({
        loading: true,
      });
      await Prom.setInitialDatabaseConfig(
        this.state.uploadFile
      );
      await this.sleep(5000);
      window.location.reload();
      this.setState({
        loading: false,
      });
    } 
    catch (error) {
      await this.sleep(5000);
      window.location.reload();
      this.setState({
        loading: false,
      });
    }
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
      fileName,
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
              <p>Upload JSON service account key file. Instructions for creating this file can be found <Link href="https://cloud.google.com/iam/docs/creating-managing-service-account-keys" target="_blank" color="primary" rel="noreferrer">here</Link>.</p>
              <Grid container>
                <Grid item xs={3}>
                  <input
                    id="contained-button-file"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={this.setRef}
                  />
                  <label htmlFor="contained-button-file">
                    <Button
                      variant="contained"
                      color="primary"
                      component="span"
                      style={{ height: 28}}
                    >
                      Upload
                    </Button>
                  </label>
                </Grid>
                <Grid item xs={9}>
                  <input
                    defaultValue={fileName}
                    style={{ height: 19}}
                  />
                </Grid>
              </Grid>
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

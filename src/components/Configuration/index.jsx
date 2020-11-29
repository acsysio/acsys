import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Link, 
  NativeSelect,
  Paper,
  Typography
} from '@material-ui/core';
import React, { Component } from 'react';
import * as Prom from '../../services/Acsys/Acsys';

const INITIAL_STATE = {
  databaseType: 'local',
  host: '',
  port: '',
  database: '',
  username: '',
  password: '',
  projectName: '',
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

  setDatabase = async (type) => {
    this.setState({
      databaseType: type
    });
  }
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
      const {
        databaseType,
        projectName,
        host,
        port,
        database,
        username,
        password,
        uploadFile,
      } = this.state;

      this.setState({
        loading: true,
      });

      if (databaseType === 'local' && projectName.length < 1) {
        this.setState({
          loading: false,
          message: 'Please enter a project name.'
        })
      }
      else {
        if (databaseType === 'firestore') {
          await Prom.setInitialFirestoreConfig(
            uploadFile
          );
          await this.sleep(5000);
          window.location.reload();
          this.setState({
            loading: false,
          });
        }
        else if (databaseType === 'mysql') {
          if(host.length > 0 && database.length > 0 && username.length > 0 && password.length > 0 && uploadFile) {
            await Prom.setInitialMysqlConfig(
              host,
              port,
              database,
              username,
              password,
              uploadFile
            );
            await this.sleep(5000);
            window.location.reload();
            this.setState({
              loading: false,
            });
          }
          else {
            this.setState({
              loading: false,
              message: 'Please complete necessary fields.'
            })
          }
        }
        else {
          await Prom.setInitialLocalDatabaseConfig(
            projectName
          );
          await this.sleep(5000);
          window.location.reload();
          this.setState({
            loading: false,
          });
        }
      }
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

  renderConfig() {
    const {
      fileName,
      databaseType,
      message,
      projectName,
      host,
      port,
      database,
      username,
      password,
     } = this.state;

    if (databaseType === 'local') {
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
          <Typography
            variant="p"
            color="secondary"
            style={{ minHeight: 25}}
          >
            {message}
          </Typography>
          <p style={{marginBottom: 0}}>When this option is selected Acsys will use the internal database.</p>
        </div>
      );
    }
    else if (databaseType === 'firestore') {
      return (
        <div>
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
        </div>
      );
    }
    else if (databaseType === 'mysql') {
      return (
        <div>
          <input
            id="host"
            name="host"
            placeholder="Host"
            defaultValue={host}
            onKeyDown={this.onKeyDownSI}
            onChange={this.onChange}
            style={{ marginTop: '20px', width: '96%' }}
          />
          <input
            id="port"
            name="port"
            placeholder="Port (Optional)"
            defaultValue={port}
            onKeyDown={this.onKeyDownSI}
            onChange={this.onChange}
            type="number"
            style={{ marginTop: '20px', width: '96%' }}
          />
          <input
            id="database"
            name="database"
            placeholder="Database"
            defaultValue={database}
            onKeyDown={this.onKeyDownSI}
            onChange={this.onChange}
            style={{ marginTop: '20px', width: '96%' }}
          />
          <input
            id="username"
            name="username"
            placeholder="Username"
            defaultValue={username}
            onKeyDown={this.onKeyDownSI}
            onChange={this.onChange}
            style={{ marginTop: '20px', width: '96%' }}
          />
          <input
            id="password"
            name="password"
            placeholder="Password"
            defaultValue={password}
            onKeyDown={this.onKeyDownSI}
            onChange={this.onChange}
            type="password"
            style={{ marginTop: '20px', width: '96%' }}
          />
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
            <Typography
              variant="p"
              color="secondary"
              style={{ minHeight: 25}}
            >
              {message}
            </Typography>
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
                <option value={'local'}>Local</option>
                <option value={'firestore'}>Firestore</option>
                <option value={'mysql'}>MySQL</option>
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

import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ExpansionPanel,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  NativeSelect,
  Tooltip,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { KeyboardArrowDown } from '@material-ui/icons';
import React from 'react';
import * as Prom from '../../services/Prometheus/Prom';

const INITIAL_STATE = {
  host: '',
  port: '',
  username: '',
  password: '',
  project_name: '',
  databaseType: '',
  type: '',
  project_id: '',
  private_key_id: '',
  private_key: '',
  client_email: '',
  client_id: '',
  auth_uri: '',
  token_uri: '',
  auth_provider_x509_cert_url: '',
  client_x509_cert_url: '',
  updateEmail: false,
  updateDatabase: false,
  updateDatabase: false,
  passwordChange: false,
  userData: [],
  page: 0,
  rowsPerPage: 15,
  loading: false,
  setOpen: false,
  addLoading: false,
  error: '',
};

class Settings extends React.Component {
  state = { ...INITIAL_STATE };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleClickOpen = () => {
    this.setState({
      setOpen: true,
    });
  };

  handleClose = () => {
    this.setState({
      setOpen: false,
    });
  };

  closeDialog = () => {
    this.setState({
      loading: false,
    });
  };

  componentDidMount = async () => {
    this.props.setHeader('Settings');
    const emailConfig = await Prom.getEmailConfig();
    if (emailConfig.length > 0) {
      this.setState({
        host: emailConfig[0].host,
        port: emailConfig[0].port,
        username: emailConfig[0].username,
        password: emailConfig[0].password,
      });
    }
    const databaseType = await Prom.getDatabaseType();
    const databaseConfig = await Prom.getDatabaseConfig();
    console.log(databaseConfig)
    if (databaseType === 'local') {
      this.setState({
        databaseType: databaseType,
        project_name: databaseConfig.project_name,
      });
    }
    else if (databaseType === 'firestore') {
      this.setState({
        databaseType: databaseType,
        type: databaseConfig.type,
        project_id: databaseConfig.project_id,
        private_key_id: databaseConfig.private_key_id,
        private_key: databaseConfig.private_key,
        client_email: databaseConfig.client_email,
        client_id: databaseConfig.client_id,
        auth_uri: databaseConfig.auth_uri,
        token_uri: databaseConfig.token_uri,
        auth_provider_x509_cert_url: databaseConfig.auth_provider_x509_cert_url,
        client_x509_cert_url: databaseConfig.client_x509_cert_url,
      });
    }
  };

  setDatabaseType = (type) => {
    this.setState({
      databaseType: type,
    });
  };

  setEmail = async () => {
    const config = {
      host: this.state.host,
      port: this.state.port,
      username: this.state.username,
      password: this.state.password,
    };
    await Prom.setEmailConfig(config);
  };

  setDatabase = async () => {
    const {
      databaseType,
      project_name,
      type,
      project_id,
      private_key_id,
      private_key,
      client_email,
      client_id,
      auth_uri,
      token_uri,
      auth_provider_x509_cert_url,
      client_x509_cert_url,
    } = this.state;
    if (databaseType === 'local' && project_name.length < 1) {
    
    }
    else {
      if (databaseType === 'firestore') {
        const config = {
          type: type,
          project_id: project_id,
          private_key_id: private_key_id,
          private_key: private_key,
          client_email: client_email,
          client_id: client_id,
          auth_uri: auth_uri,
          token_uri: token_uri,
          auth_provider_x509_cert_url: auth_provider_x509_cert_url,
          client_x509_cert_url: client_x509_cert_url,
        };
        await Prom.setFirestoreConfig(config);
      }
      else {
        await Prom.setLocalDatabaseConfig(
          project_name
        );
      }
    }
  };

  setConfig = async () => {
    this.setState({
      loading: true,
    });
    if (this.state.updateEmail) {
      this.setEmail();
      await this.sleep(5000);
    }
    if (this.state.updateDatabase) {
      this.setDatabase();
      await this.sleep(5000);
    }
    if (this.state.updateDatabase || this.state.updateEmail) {
      await this.sleep(5000);
      await Prom.restart().then(async () => {
        await this.sleep(5000);
        window.location.reload();
      });
    }
    this.setState({
      loading: false,
    });
  };

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  getConfigPanel() {
    const {
      databaseType,
      project_name,
      type,
      project_id,
      private_key_id,
      private_key,
      client_email,
      client_id,
      auth_uri,
      token_uri,
      auth_provider_x509_cert_url,
      client_x509_cert_url,
    } = this.state;
    console.log('muthafuffin type ', project_name)
    if(databaseType === 'local') {
      return (
        <ExpansionPanel
          style={{ clear: 'both' }}
          onChange={(e) =>
            this.setState({
              updateDatabase: !this.state.updateDatabase,
            })
          }
        >
          <ExpansionPanelSummary
            expandIcon={<KeyboardArrowDown />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Local Configuration</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Box
              margin="auto"
              width="90%"
              display="flex"
              flexDirection="column"
              textAlign="center"
              padding="16px"
            >
              <input
                id="project_name"
                name="project_name"
                placeholder="Project Name"
                value={project_name}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
            </Box>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      )
    }
    else if(databaseType === 'firestore') {
      return (
        <ExpansionPanel
          style={{ clear: 'both' }}
          onChange={(e) =>
            this.setState({
              updateDatabase: !this.state.updateDatabase,
            })
          }
        >
          <ExpansionPanelSummary
            expandIcon={<KeyboardArrowDown />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Firestore Configuration</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
            <Box
              margin="auto"
              width="90%"
              display="flex"
              flexDirection="column"
              textAlign="center"
              padding="16px"
            >
              <input
                id="type"
                name="type"
                placeholder="Type"
                value={type}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="project_id"
                name="project_id"
                placeholder="Project ID"
                value={project_id}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="private_key_id"
                name="private_key_id"
                placeholder="Private Key ID"
                value={private_key_id}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="private_key"
                name="private_key"
                placeholder="Private Key"
                value={private_key}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="client_email"
                name="client_email"
                placeholder="Client Email"
                value={client_email}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="client_id"
                name="client_id"
                placeholder="Client ID"
                value={client_id}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="auth_uri"
                name="auth_uri"
                placeholder="Auth URI"
                value={auth_uri}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="token_uri"
                name="token_uri"
                placeholder="Token URI"
                value={token_uri}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="auth_provider_x509_cert_url"
                name="auth_provider_x509_cert_url"
                placeholder="Auth Provider x509 Cert URL"
                value={auth_provider_x509_cert_url}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
              <input
                id="client_x509_cert_url"
                name="client_x509_cert_url"
                placeholder="Client x509 Cert URL"
                value={client_x509_cert_url}
                onChange={this.onChange}
                style={{ marginTop: '20px' }}
              />
            </Box>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      )
    }
  }

  render() {
    const {
      databaseType,
      host,
      port,
      username,
      password,
      loading,
    } = this.state;

    return (
      <div>
        <Tooltip title="Save Server Settings">
          <Button
            style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
            variant="contained"
            color="primary"
            onClick={this.setConfig}
          >
            Save
          </Button>
        </Tooltip>
        <Paper
          style={{
            margin: 'auto',
            overflow: 'hidden',
            clear: 'both',
            marginBottom: 20,
          }}
        >
          <div>
            <div class="element-container">
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Grid container>
                    <Grid item xs={9}>
                      <h1 class="element-header" style={{ marginTop: 0 }}>Configuration</h1>
                    </Grid>
                    <Grid item xs={3}>
                      <Tooltip title="Sets Database Type For Project">
                        <NativeSelect
                          value={databaseType}
                          onChange={(e) =>
                            this.setDatabaseType(e.target.value)
                          }
                          style={{ width: '100%', paddingTop: 7 }}
                        >
                          <option value={'local'}>Local</option>
                          <option value={'firestore'}>Firestore</option>
                        </NativeSelect>
                      </Tooltip>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} style={{ marginBottom: 30 }}>
                    <ExpansionPanel
                      style={{ clear: 'both' }}
                      onChange={(e) =>
                        this.setState({
                          updateEmail: !this.state.updateEmail,
                        })
                      }
                    >
                      <ExpansionPanelSummary
                        expandIcon={<KeyboardArrowDown />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography>Email Configuration</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <Box
                          margin="auto"
                          width="90%"
                          display="flex"
                          flexDirection="column"
                          textAlign="center"
                          padding="16px"
                        >
                          <input
                            id="host"
                            name="host"
                            placeholder="Host"
                            value={host}
                            onChange={this.onChange}
                            style={{ marginTop: '20px' }}
                          />
                          <input
                            id="port"
                            name="port"
                            placeholder="Port"
                            value={port}
                            onChange={this.onChange}
                            style={{ marginTop: '20px' }}
                          />
                          <input
                            id="username"
                            name="username"
                            placeholder="Username"
                            value={username}
                            onChange={this.onChange}
                            style={{ marginTop: '20px' }}
                          />
                          <input
                            id="password"
                            name="password"
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={this.onChange}
                            style={{ marginTop: '20px' }}
                          />
                        </Box>
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </Grid>
                  <Grid item xs={12}>
                    {this.getConfigPanel()}
                  </Grid>
                </Grid>
              </Grid>
            </div>
            <div class="element-container">
              <div style={{ height: 40 }}></div>
            </div>
          </div>
          <Dialog
            open={this.state.loading}
            onClose={this.closeDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title" style={{ margin: 'auto' }}>
              Saving Settings
            </DialogTitle>
            <DialogContent
              style={{
                minHeight: 150,
                minWidth: 400,
                margin: 'auto',
                overflow: 'hidden',
              }}
            >
              <div style={{ width: 124, margin: 'auto' }}>
                <CircularProgress size={124} />
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={this.state.setOpen}
            onClose={this.handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {'Update profile?'}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to update this data?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                No
              </Button>
              <Button
                onClick={this.updateCredentials}
                color="primary"
                disabled={loading}
                autoFocus
              >
                {loading && <CircularProgress size={24} />}
                {!loading && 'Yes'}
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </div>
    );
  }
}

export default Settings;

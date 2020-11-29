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
    Tooltip
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { KeyboardArrowDown } from '@material-ui/icons';
import React from 'react';
import * as Prom from '../../services/Acsys/Acsys';

const INITIAL_STATE = {
  host: '',
  port: '',
  username: '',
  password: '',
  dhost: '',
  dport: '',
  database: '',
  dusername: '',
  dpassword: '',
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
  bucket: '',
  buckets: [],
  updateBucket: false,
  updateEmail: false,
  updateDatabase: false,
  updateStorage: false,
  passwordChange: false,
  userData: [],
  uploadFile: undefined,
  fileName: '',
  page: 0,
  rowsPerPage: 15,
  loading: false,
  setOpen: false,
  addLoading: false,
  error: '',
  message: '',
  setMessageOpen: false,
};

class Settings extends React.Component {
  state = { ...INITIAL_STATE };

  handleChangePage = (event, page) => {
    this.setState({ page });
  };

  handleClickOpen = () => {
    if (this.state.updateDatabase || this.state.updateStorage || this.state.updateEmail || this.state.updateBucket) {
      this.setState({
        setOpen: true,
      });
    }
  };

  handleClose = () => {
    this.setState({
      setOpen: false,
    });
  };

  handleMessageClose = () => {
    this.setState({
      setMessageOpen: false,
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
    if (databaseType === 'local') {
      this.setState({
        databaseType: databaseType,
        project_name: databaseConfig.project_name,
      });
    }
    else if (databaseType === 'firestore') {
      const currentBucket = await Prom.getCurrentBucket();
      const buckets = await Prom.getStorageBuckets();
      
      this.setState({
        bucket: currentBucket,
        buckets: buckets,
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
    else if (databaseType === 'mysql') {
      const currentBucket = await Prom.getCurrentBucket();
      const buckets = await Prom.getStorageBuckets();
      
      this.setState({
        bucket: currentBucket,
        buckets: buckets,
        databaseType: databaseType,
        dhost: databaseConfig.host,
        dport: databaseConfig.port,
        ddatabase: databaseConfig.database,
        dusername: databaseConfig.username,
        dpassword: databaseConfig.password,
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

  selectBucket = (bucket) => {
    this.setState({
      bucket: bucket,
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

  setBucket = async () => {
    const config = {
      bucket: this.state.bucket,
    };
    await Prom.setStorageBucket(config);
  };

  setDatabase = async () => {
    const {
      databaseType,
      project_name,
      dhost,
      dport,
      ddatabase,
      dusername,
      dpassword,
      uploadFile,
    } = this.state;
    
    if (databaseType === 'firestore') {
      if (uploadFile === undefined) {
        this.setState({
          setMessageOpen: true,
          setOpen: false,
          message: 'Please select a configuration to upload.',
          loading: false,
        });
      }
      else {
        await Prom.setFirestoreConfig(uploadFile);
      }
    }
    else if (databaseType === 'mysql') {
      if (dhost < 1 || ddatabase < 1 || dusername < 1 || dpassword < 1 || uploadFile === undefined) {
        this.setState({
          setMessageOpen: true,
          setOpen: false,
          message: 'Please complete all necessary database fields and storage settings.',
          loading: false,
        });
      }
      else {
        await Prom.setMysqlConfig(
          dhost,
          dport,
          ddatabase,
          dusername,
          dpassword,
          uploadFile
        );
      }
    }
    else if (databaseType === 'local') {
      if (project_name.length < 1) {
        this.setState({
          setMessageOpen: true,
          setOpen: false,
          message: 'Please enter a project name.',
          loading: false,
        });
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
      setOpen: false,
      loading: true,
    });
    if (this.state.updateEmail) {
      this.setEmail();
      await this.sleep(5000);
    }
    if (this.state.updateBucket) {
      this.setBucket();
      await this.sleep(5000);
    }
    if (this.state.updateDatabase || this.state.updateStorage) {
      this.setDatabase();
      await this.sleep(5000);
    }
    if ((this.state.updateDatabase || this.state.updateEmail || this.state.updateStorage) && this.state.loading) {
      await this.sleep(5000);
      window.location.reload();
    }
    this.setState({
      loading: false,
    });
  };

  setRef = (ref) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => this.loadFields(event);
    try {
      fileReader.readAsText(ref.target.files[0]);
    }
    catch (error) {

    }
    this.setState({
      fileName: ref.target.files[0].name,
      uploadFile: ref.target.files[0],
    });
  };

  loadFields (event) {
    try {
      const settings = JSON.parse(event.target.result);
      this.setState({
        type: settings.type,
        project_id: settings.project_id,
        private_key_id: settings.private_key_id,
        private_key: settings.private_key,
        client_email: settings.client_email,
        client_id: settings.client_id,
        auth_uri: settings.auth_uri,
        token_uri: settings.token_uri,
        auth_provider_x509_cert_url: settings.auth_provider_x509_cert_url,
        client_x509_cert_url: settings.client_x509_cert_url,
      });
    }
    catch (error) {

    }
  }

  sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  getBucketPanel() {
    const {
      bucket,
      buckets,
    } = this.state;
    return (
      <ExpansionPanel
        style={{ clear: 'both' }}
        onChange={(e) =>
          this.setState({
            updateBucket: !this.state.updateBucket,
          })
        }
      >
        <ExpansionPanelSummary
          expandIcon={<KeyboardArrowDown />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography>Bucket Configuration</Typography>
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
            <NativeSelect
              value={bucket}
              onChange={(e) =>
                this.selectBucket(e.target.value)
              }
              style={{ width: '100%', paddingTop: 7 }}
            >
              {buckets.map((bucketName) => (
                <option value={bucketName}>{bucketName}</option>
              ))}
            </NativeSelect>
          </Box>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  getLocalPanel() {
    const {
      project_name,
    } = this.state;
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
    );
  };

  getFirestorePanel(name) {
    const {
      fileName,
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
    return (
      <Grid>
        <Grid item xs={12} style={{marginBottom: 30}}>
          {this.state.bucket.length > 0 ?
            this.getBucketPanel()
            :
            null
          }
        </Grid>
        <Grid item xs={12}>
          <ExpansionPanel
            style={{ clear: 'both' }}
            onChange={(e) =>
              this.setState({
                updateStorage: !this.state.updateStorage,
              })
            }
          >
            <ExpansionPanelSummary
              expandIcon={<KeyboardArrowDown />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>{name} Configuration</Typography>
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
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="project_id"
                  name="project_id"
                  placeholder="Project ID"
                  value={project_id}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="private_key_id"
                  name="private_key_id"
                  placeholder="Private Key ID"
                  value={private_key_id}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="private_key"
                  name="private_key"
                  placeholder="Private Key"
                  value={private_key}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="client_email"
                  name="client_email"
                  placeholder="Client Email"
                  value={client_email}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="client_id"
                  name="client_id"
                  placeholder="Client ID"
                  value={client_id}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="auth_uri"
                  name="auth_uri"
                  placeholder="Auth URI"
                  value={auth_uri}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="token_uri"
                  name="token_uri"
                  placeholder="Token URI"
                  value={token_uri}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="auth_provider_x509_cert_url"
                  name="auth_provider_x509_cert_url"
                  placeholder="Auth Provider x509 Cert URL"
                  value={auth_provider_x509_cert_url}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="client_x509_cert_url"
                  name="client_x509_cert_url"
                  placeholder="Client x509 Cert URL"
                  value={client_x509_cert_url}
                  style={{ marginTop: '20px' }}
                />
                <Grid container style={{ marginTop: '20px' }}>
                  <Grid item xs>
                    <input
                      defaultValue={fileName}
                      style={{ width: '100%'}}
                    />
                  </Grid>
                  <Grid item>
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
                        style={{marginLeft: 28, height: 32}}
                      >
                        New Config
                      </Button>
                    </label>
                  </Grid>
                </Grid>
              </Box>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Grid>
      </Grid>
    );
  };

  getMysqlPanel() {
    const {
      dhost,
      dport,
      ddatabase,
      dusername,
      dpassword,
    } = this.state;
    return (
      <Grid>
        <Grid item xs={12} style={{ marginBottom: 30 }}>
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
              <Typography>MySQL Configuration</Typography>
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
                  id="dhost"
                  name="dhost"
                  placeholder="Host"
                  value={dhost}
                  onChange={this.onChange}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="dport"
                  name="dport"
                  placeholder="Port (Can be empty)"
                  value={dport}
                  onChange={this.onChange}
                  type="number"
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="ddatabase"
                  name="ddatabase"
                  placeholder="Database"
                  value={ddatabase}
                  onChange={this.onChange}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="dusername"
                  name="dusername"
                  placeholder="Username"
                  value={dusername}
                  onChange={this.onChange}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="dpassword"
                  name="dpassword"
                  placeholder="Password"
                  value={dpassword}
                  onChange={this.onChange}
                  type="password"
                  style={{ marginTop: '20px' }}
                />
              </Box>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Grid>
        <Grid item xs={12}>
          {this.getFirestorePanel('Storage')}
        </Grid>
      </Grid>
    );
  };

  getConfigPanel() {
    const {
      databaseType,
    } = this.state;
    if(databaseType === 'local') {
      return (
        this.getLocalPanel()
      )
    }
    else if(databaseType === 'firestore') {
      return (
        this.getFirestorePanel('Firestore')
      )
    }
    else if(databaseType === 'mysql') {
      return (
        this.getMysqlPanel()
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
      message,
    } = this.state;

    return (
      <div>
        <Tooltip title="Save Server Settings">
          <Button
            style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
            variant="contained"
            color="primary"
            onClick={this.handleClickOpen}
          >
            Configure
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
                          <option value={'mysql'}>MySQL</option>
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
              {'Update configuration?'}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
              Are you sure you want to update the configuration? Doing so will overwrite current settings.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                No
              </Button>
              <Button
                onClick={this.setConfig}
                color="primary"
                disabled={loading}
                autoFocus
              >
                {loading && <CircularProgress size={24} />}
                {!loading && 'Yes'}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.setMessageOpen}
            onClose={this.handleMessageClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {'Error'}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
              {message}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleMessageClose} color="primary">
                Okay
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </div>
    );
  }
}

export default Settings;

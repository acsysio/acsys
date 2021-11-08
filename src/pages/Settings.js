import {
  Box,
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
import React, { useEffect, useState } from 'react';
import * as Acsys from '../utils/Acsys/Acsys';
import LoadingDialog from '../components/Dialogs/LoadingDialog';
import MessageDialog from '../components/Dialogs/MessageDialog';
import YesNoDialog from '../components/Dialogs/YesNoDialog';

const Settings = (props) => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [socketPath, setSocketPath] = useState('');
  const [dhost, setDhost] = useState('');
  const [dport, setDport] = useState('');
  const [ddatabase, setDatabase] = useState('');
  const [dusername, setDusername] = useState('');
  const [dpassword, setDpassword] = useState('');
  const [project_name, setproject_name] = useState('');
  const [databaseType, setdatabaseType] = useState('');
  const [type, setType] = useState('');
  const [project_id, setproject_id] = useState('');
  const [private_key_id, setprivate_key_id] = useState('');
  const [private_key, setprivate_key] = useState('');
  const [client_email, setclient_email] = useState('');
  const [client_id, setclient_id] = useState('');
  const [auth_uri, setauth_uri] = useState('');
  const [token_uri, settoken_uri] = useState('');
  const [auth_provider_x509_cert_url, setauth_provider_x509_cert_url] =
    useState('');
  const [client_x509_cert_url, setclient_x509_cert_url] = useState('');
  const [bucket, setbucket] = useState('');
  const [buckets, setbuckets] = useState([]);
  const [updateBucket, setupdateBucket] = useState(false);
  const [updateEmail, setupdateEmail] = useState(false);
  const [updateDatabase, setupdateDatabase] = useState(false);
  const [updateStorage, setupdateStorage] = useState(false);
  const [uploadFile, setuploadFile] = useState();
  const [fileName, setfileName] = useState('');
  const [page, setpage] = useState(0);
  const [loading, setloading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, seterror] = useState('');
  const [message, setmessage] = useState('');
  const [messageOpen, setMessageOpen] = useState(false);
  const [isStateless, setisStateless] = useState('');

  const handleClickOpen = () => {
    if (updateDatabase || updateStorage || updateEmail || updateBucket) {
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleMessageClose = () => {
    setMessageOpen(false);
  };

  const closeDialog = () => {
    setloading(false);
  };

  useEffect(async () => {
    props.setHeader('Settings');
    const isStateless = await Acsys.isStateless();
    const emailConfig = await Acsys.getEmailConfig();
    console.log('email cofig', emailConfig);
    if (emailConfig.length > 0) {
      setHost(emailConfig[0].host);
      setPort(emailConfig[0].port);
      setUsername(emailConfig[0].username);
      setPassword(emailConfig[0].password);
    }
    const databaseType = await Acsys.getDatabaseType();
    if (!isStateless) {
      const databaseConfig = await Acsys.getDatabaseConfig();
      if (databaseType === 'local') {
        setproject_name(databaseConfig.project_name);
      } else if (databaseType === 'firestore') {
        const currentBucket = await Acsys.getCurrentBucket();
        const buckets = await Acsys.getStorageBuckets();

        setbucket(currentBucket);
        setbuckets(buckets);
        setType(databaseConfig.type);
        setproject_id(databaseConfig.project_id);
        setprivate_key_id(databaseConfig.private_key_id);
        setprivate_key(databaseConfig.private_key);
        setclient_email(databaseConfig.client_email);
        setclient_id(databaseConfig.client_id);
        setauth_uri(databaseConfig.auth_uri);
        settoken_uri(databaseConfig.token_uri);
        setauth_provider_x509_cert_url(
          databaseConfig.auth_provider_x509_cert_url
        );
        setclient_x509_cert_url(databaseConfig.client_x509_cert_url);
      } else if (databaseType === 'mysql') {
        const currentBucket = await Acsys.getCurrentBucket();
        const buckets = await Acsys.getStorageBuckets();
        setbucket(currentBucket);
        setbuckets(buckets);
        setType(databaseConfig.type);
        setproject_id(databaseConfig.project_id);
        setprivate_key_id(databaseConfig.private_key_id);
        setprivate_key(databaseConfig.private_key);
        setclient_email(databaseConfig.client_email);
        setclient_id(databaseConfig.client_id);
        setauth_uri(databaseConfig.auth_uri);
        settoken_uri(databaseConfig.token_uri);
        setauth_provider_x509_cert_url(
          databaseConfig.auth_provider_x509_cert_url
        );
        setclient_x509_cert_url(databaseConfig.client_x509_cert_url);
      }
    }
    setisStateless(isStateless);
    setdatabaseType(databaseType);
  }, []);

  // setDatabaseType = (type) => {
  //   setState({
  //     databaseType: type,
  //   });
  // };

  const selectBucket = (bucket) => {
    setbucket(bucket);
  };

  const setEmail = async () => {
    const config = {
      host: host,
      port: port,
      username: username,
      password: password,
    };
    await Acsys.setEmailConfig(config);
  };

  const setBucket = async () => {
    const config = {
      bucket: bucket,
    };
    await Acsys.setStorageBucket(config);
  };

  const handleSetDatabase = async () => {
    if (databaseType === 'firestore') {
      if (uploadFile === undefined) {
        setMessageOpen(true);
        setOpen(false);
        setmessage('Please select a configuration to upload.');
        setloading(false);
      } else {
        await Acsys.setFirestoreConfig(uploadFile);
      }
    } else if (databaseType === 'mysql') {
      if (
        dhost < 1 ||
        ddatabase < 1 ||
        dusername < 1 ||
        dpassword < 1 ||
        uploadFile === undefined
      ) {
        setMessageOpen(true);
        setOpen(false);
        setmessage(
          'Please complete all necessary database fields and storage settings.'
        );
        setloading(false);
      } else {
        await Acsys.setMysqlConfig(
          dhost,
          dport,
          ddatabase,
          dusername,
          dpassword,
          socketPath,
          uploadFile
        );
      }
    } else if (databaseType === 'local') {
      if (project_name.length < 1) {
        setMessageOpen(true);
        setOpen(false);
        setmessage('Please enter a project name.');
        setloading(false);
      } else {
        await Acsys.setLocalDatabaseConfig(project_name);
      }
    }
  };

  const setConfig = async () => {
    setOpen(false);
    setloading(false);
    if (updateEmail) {
      setEmail();
      await sleep(5000);
    }
    if (updateBucket) {
      setBucket();
      await sleep(5000);
    }
    if (updateDatabase || updateStorage) {
      handleSetDatabase();
      await sleep(5000);
    }
    if ((updateDatabase || updateEmail || updateStorage) && loading) {
      await sleep(7500);
      window.location.reload();
    }
    setloading(false);
  };

  const setRef = (ref) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => loadFields(event);
    try {
      fileReader.readAsText(ref.target.files[0]);
    } catch (error) {}
    setfileName(ref.target.files[0].name), setuploadFile(ref.target.files[0]);
  };

  const loadFields = (event) => {
    try {
      const settings = JSON.parse(event.target.result);
      setType(settings.type);
      setproject_id(ettings.project_id);
      setprivate_key_id(settings.private_key_id);
      setprivate_key(settings.private_key);
      setclient_email(settings.client_email);
      setclient_id(settings.client_id);
      setauth_uri(settings.auth_uri);
      settoken_uri(settings.token_uri);
      setauth_provider_x509_cert_url(settings.auth_provider_x509_cert_url);
      setclient_x509_cert_url(settings.client_x509_cert_url);
    } catch (error) {}
  };

  const sleep = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  };

  const onChange = (event) => {
    // setState({ [event.target.name]: event.target.value });
  };

  const getBucketPanel = () => {
    console.log('buckerts', buckets);
    return (
      <ExpansionPanel
        style={{ clear: 'both' }}
        onChange={(e) => setupdateBucket(!updateBucket)}
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
              onChange={(e) => setBucket(e.target.value)}
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

  const getLocalPanel = () => {
    return (
      <ExpansionPanel
        style={{ clear: 'both' }}
        onChange={(e) => setupdateDatabase(!updateDatabase)}
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
              onChange={(e) => setproject_name(e.target.value)}
              style={{ marginTop: '20px' }}
            />
          </Box>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  };

  const getFirestorePanel = (name) => {
    return (
      <Grid>
        <Grid item xs={12} style={{ marginBottom: 30 }}>
          {bucket.length > 0 ? getBucketPanel() : null}
        </Grid>
        <Grid item xs={12}>
          <ExpansionPanel
            style={{ clear: 'both' }}
            onChange={(e) => setupdateStorage(!updateStorage)}
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
                  onChange={(e) => setType(e.target.value)}
                  placeholder="Type"
                  value={type}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="project_id"
                  name="project_id"
                  onChange={(e) => setproject_id(e.target.value)}
                  placeholder="Project ID"
                  value={project_id}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="private_key_id"
                  name="private_key_id"
                  onChange={(e) => setprivate_key_id(e.target.value)}
                  placeholder="Private Key ID"
                  value={private_key_id}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="private_key"
                  name="private_key"
                  onChange={(e) => setprivate_key_id(e.target.value)}
                  placeholder="Private Key"
                  value={private_key}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="client_email"
                  name="client_email"
                  onChange={(e) => setclient_email(e.target.value)}
                  placeholder="Client Email"
                  value={client_email}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="client_id"
                  name="client_id"
                  onChange={(e) => setclient_id(e.target.value)}
                  placeholder="Client ID"
                  value={client_id}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="auth_uri"
                  name="auth_uri"
                  onChange={(e) => setauth_uri(e.target.value)}
                  placeholder="Auth URI"
                  value={auth_uri}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="token_uri"
                  name="token_uri"
                  onChange={(e) => settoken_uri(e.target.value)}
                  placeholder="Token URI"
                  value={token_uri}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="auth_provider_x509_cert_url"
                  name="auth_provider_x509_cert_url"
                  onChange={(e) =>
                    setauth_provider_x509_cert_url(e.target.value)
                  }
                  placeholder="Auth Provider x509 Cert URL"
                  value={auth_provider_x509_cert_url}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="client_x509_cert_url"
                  name="client_x509_cert_url"
                  onChange={(e) => setclient_x509_cert_url(e.target.value)}
                  placeholder="Client x509 Cert URL"
                  value={client_x509_cert_url}
                  style={{ marginTop: '20px' }}
                />
                <Grid container style={{ marginTop: '20px' }}>
                  <Grid item xs>
                    <input defaultValue={fileName} style={{ width: '100%' }} />
                  </Grid>
                  <Grid item>
                    <input
                      id="contained-button-file"
                      type="file"
                      style={{ display: 'none' }}
                      onChange={setRef}
                    />
                    <label htmlFor="contained-button-file">
                      <Button
                        variant="contained"
                        color="primary"
                        component="span"
                        style={{ marginLeft: 28, height: 32 }}
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

  const getMysqlPanel = () => {
    return (
      <Grid>
        <Grid item xs={12} style={{ marginBottom: 30 }}>
          <ExpansionPanel
            style={{ clear: 'both' }}
            onChange={(e) => setupdateDatabase(!updateDatabase)}
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
                  onChange={(e) => setDhost(e.target.value)}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="dport"
                  name="dport"
                  placeholder="Port (Can be empty)"
                  value={dport}
                  onChange={(e) => setDport(e.target.value)}
                  type="number"
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="ddatabase"
                  name="ddatabase"
                  placeholder="Database"
                  value={ddatabase}
                  onChange={(e) => setDatabase(e.target.value)}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="dusername"
                  name="dusername"
                  placeholder="Username"
                  value={dusername}
                  onChange={(e) => setDusername(e.target.value)}
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="dpassword"
                  name="dpassword"
                  placeholder="Password"
                  value={dpassword}
                  onChange={(e) => setDpassword(e.target.value)}
                  type="password"
                  style={{ marginTop: '20px' }}
                />
                <input
                  id="socketPath"
                  name="socketPath"
                  placeholder="Socket Path (May be needed for production environments)"
                  value={socketPath}
                  onChange={(e) => setSocketPath(e.target.value)}
                  style={{ marginTop: '20px' }}
                />
              </Box>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Grid>
        <Grid item xs={12}>
          {getFirestorePanel('Storage')}
        </Grid>
      </Grid>
    );
  };

  const getConfigPanel = () => {
    if (databaseType === 'local') {
      return getLocalPanel();
    } else if (databaseType === 'firestore') {
      return getFirestorePanel('Firestore');
    } else if (databaseType === 'mysql') {
      return getMysqlPanel();
    }
  };

  return (
    <div>
      <Tooltip title="Save Server Settings">
        <Button
          style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
          variant="contained"
          color="primary"
          onClick={handleClickOpen}
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
                    <h1 class="element-header" style={{ marginTop: 0 }}>
                      Configuration
                    </h1>
                  </Grid>
                  <Grid item xs={3}>
                    <Tooltip title="Sets Database Type For Project">
                      <NativeSelect
                        value={databaseType}
                        onChange={(e) => setdatabaseType(e.target.value)}
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
                    onChange={(e) => setupdateEmail(!updateEmail)}
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
                          onChange={(e) => setHost(e.target.value)}
                          style={{ marginTop: '20px' }}
                        />
                        <input
                          id="port"
                          name="port"
                          placeholder="Port"
                          value={port}
                          onChange={(e) => setPort(e.target.value)}
                          style={{ marginTop: '20px' }}
                        />
                        <input
                          id="username"
                          name="username"
                          placeholder="Username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          style={{ marginTop: '20px' }}
                        />
                        <input
                          id="password"
                          name="password"
                          placeholder="Password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          style={{ marginTop: '20px' }}
                        />
                      </Box>
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                </Grid>
                {!isStateless ? (
                  <Grid item xs={12}>
                    {getConfigPanel()}
                  </Grid>
                ) : null}
              </Grid>
            </Grid>
          </div>
          <div class="element-container">
            <div style={{ height: 40 }}></div>
          </div>
        </div>
        <LoadingDialog loading={loading} message={'Saving Settings'} />
        <YesNoDialog
          open={open}
          closeDialog={handleClose}
          title={'Update configuration?'}
          message={
            'Are you sure you want to update the configuration? Doing so will overwrite current settings.'
          }
          action={setConfig}
          actionProcess={loading}
        />
        <MessageDialog
          open={messageOpen}
          closeDialog={handleMessageClose}
          title={'Error'}
          message={message}
        />
      </Paper>
    </div>
  );
};

export default Settings;

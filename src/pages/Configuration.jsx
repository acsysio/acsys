import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Link,
  NativeSelect,
  Paper,
  Typography,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import * as Acsys from '../utils/Acsys/Acsys';

const Configuration = () => {
  const [databaseType, setdatabaseType] = useState('local');
  const [host, sethost] = useState('');
  const [port, setport] = useState('');
  const [database, setdatabase] = useState('');
  const [username, setusername] = useState('');
  const [password, setpassword] = useState('');
  const [socketPath, setsocketPath] = useState('');
  const [projectName, setprojectName] = useState('');
  const [uploadFile, setuploadFile] = useState('');
  const [fileName, setfileName] = useState('');
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);
  const [message, setmessage] = useState('');

  const setRef = (ref) => {
    setfileName(ref.target.files[0].name);
    setuploadFile(ref.target.files[0]);
  };

  const onKeyDownSI = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      onSubmit();
    }
  };

  const onSubmit = async (event) => {
    try {
      setloading(true);

      if (databaseType === 'local' && projectName.length < 1) {
        setloading(false);
        setmessage('Please enter a project name.');
      } else {
        if (databaseType === 'firestore') {
          await Acsys.setInitialFirestoreConfig(uploadFile);
          await sleep(5000);
          window.location.reload();
          setloading(false);
        } else if (databaseType === 'mysql') {
          if (
            host.length > 0 &&
            database.length > 0 &&
            username.length > 0 &&
            password.length > 0 &&
            uploadFile
          ) {
            await Acsys.setInitialMysqlConfig(
              host,
              port,
              database,
              username,
              password,
              socketPath,
              uploadFile
            );
            await sleep(5000);
            window.location.reload();
            setloading(false);
          } else {
            setloading(false);
            setmessage('Please complete necessary fields.');
          }
        } else {
          await Acsys.setInitialLocalDatabaseConfig(projectName);
          await sleep(7500);
          window.location.reload();
          setloading(false);
        }
      }
    } catch (error) {
      await sleep(5000);
      window.location.reload();
      setloading(false);
    }
    event.preventDefault();
  };

  const sleep = (time) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  };

  const onChange = (event) => {
    setState({ [event.target.name]: event.target.value });
  };

  const renderConfig = () => {
    if (databaseType === 'local') {
      return (
        <div>
          <input
            className="custom-input"
            id="projectName"
            name="projectName"
            placeholder="Project Name"
            defaultValue={projectName}
            onKeyDown={onKeyDownSI}
            onChange={(event) => setprojectName(event.target.value)}
            style={{ marginTop: '20px', width: '96%' }}
          />
          <Typography variant="p" color="secondary" style={{ minHeight: 25 }}>
            {message}
          </Typography>
          <p style={{ marginBottom: 0 }}>
            When this option is selected Acsys will use the internal database.
          </p>
        </div>
      );
    } else if (databaseType === 'firestore') {
      return (
        <div>
          <p>
            Upload JSON service account key file. Instructions for creating this
            file can be found{' '}
            <Link
              href="https://cloud.google.com/iam/docs/creating-managing-service-account-keys"
              target="_blank"
              color="primary"
              rel="noreferrer"
            >
              here
            </Link>
            .
          </p>
          <Grid container>
            <Grid item xs={3}>
              <input
                className="custom-input"
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
                  style={{ height: 28 }}
                >
                  Upload
                </Button>
              </label>
            </Grid>
            <Grid item xs={9}>
              <input
                className="custom-input"
                defaultValue={fileName}
                style={{ height: 19 }}
              />
            </Grid>
          </Grid>
        </div>
      );
    } else if (databaseType === 'mysql') {
      return (
        <div>
          <input
            className="custom-input"
            id="host"
            name="host"
            placeholder="Host"
            defaultValue={host}
            onKeyDown={onKeyDownSI}
            onChange={(event) => sethost(event.target.value)}
            style={{ marginTop: '20px', width: '96%' }}
          />
          <input
            className="custom-input"
            id="port"
            name="port"
            placeholder="Port (Optional)"
            defaultValue={port}
            onKeyDown={onKeyDownSI}
            onChange={(event) => setport(event.target.value)}
            type="number"
            style={{ marginTop: '20px', width: '96%' }}
          />
          <input
            className="custom-input"
            id="database"
            name="database"
            placeholder="Database"
            defaultValue={database}
            onKeyDown={onKeyDownSI}
            onChange={(event) => setdatabase(event.target.value)}
            style={{ marginTop: '20px', width: '96%' }}
          />
          <input
            className="custom-input"
            id="username"
            name="username"
            placeholder="Username"
            defaultValue={username}
            onKeyDown={onKeyDownSI}
            onChange={(event) => setusername(event.target.value)}
            style={{ marginTop: '20px', width: '96%' }}
          />
          <input
            className="custom-input"
            id="password"
            name="password"
            placeholder="Password"
            defaultValue={password}
            onKeyDown={onKeyDownSI}
            onChange={(event) => setpassword(event.target.value)}
            type="password"
            style={{ marginTop: '20px', width: '96%' }}
          />
          <input
            className="custom-input"
            id="socketPath"
            name="socketPath"
            placeholder="Socket Path (Production only)"
            defaultValue={socketPath}
            onKeyDown={onKeyDownSI}
            onChange={(event) => setsocketPath(event.target.value)}
            style={{ marginTop: '20px', width: '96%' }}
          />
          <p>
            Instructions for binding the socket path can be found{' '}
            <Link
              href="https://cloud.google.com/sql/docs/mysql/connect-functions"
              target="_blank"
              color="primary"
              rel="noreferrer"
            >
              here
            </Link>
            . Instructions for creating upload file can be found{' '}
            <Link
              href="https://cloud.google.com/iam/docs/creating-managing-service-account-keys"
              target="_blank"
              color="primary"
              rel="noreferrer"
            >
              here
            </Link>
            .
          </p>
          <Grid container>
            <Grid item xs={3}>
              <input
                className="custom-input"
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
                  style={{ height: 28 }}
                >
                  Upload
                </Button>
              </label>
            </Grid>
            <Grid item xs={9}>
              <input
                className="custom-input"
                defaultValue={fileName}
                style={{ height: 19 }}
              />
            </Grid>
          </Grid>
          <Typography variant="p" color="secondary" style={{ minHeight: 25 }}>
            {message}
          </Typography>
        </div>
      );
    }
  };

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
              onChange={(e) => setdatabaseType(e.target.value)}
              style={{ marginTop: '20px' }}
            >
              <option value={'local'}>Local</option>
              <option value={'firestore'}>Firestore</option>
              <option value={'mysql'}>MySQL</option>
            </NativeSelect>
            {renderConfig()}
          </Box>
          <Box
            margin="auto"
            width="50%"
            display="flex"
            flexDirection="column"
            textAlign="center"
            padding="16px"
          >
            <LoadingButton
              onClick={onSubmit}
              loading={loading}
              type="submit"
              variant="contained"
              color="primary"
            >
              Submit
            </LoadingButton>
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
};

export default Configuration;

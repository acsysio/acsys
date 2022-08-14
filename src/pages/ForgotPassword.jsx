import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import * as Acsys from '../utils/Acsys/Acsys';

const ForgotPassword = () => {
  const [params, setParams] = useState({
    username: '',
    email: '',
    passwordOne: '',
    passwordTwo: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setIsLoading] = useState(false);
  const [error] = useState(null);

  const onChange = (event) => {
    setParams({
      ...params,
      [event.target.name]: event.target.value,
    });
  };

  const onKeyDownSI = (event) => {
    const { username, email, passwordOne } = params;
    if (event.key === 'Enter' && !(passwordOne === '' || username === '')) {
      event.preventDefault();
      event.stopPropagation();
      onSubmit();
    }
  };

  const onSubmit = async (event) => {
    const { email } = params;
    setIsLoading(false);
    await Acsys.sendResetLink(email)
      .then((result) => {
        setIsLoading(false);
        setMessage(result);
      })
      .catch((err) => {
        console.log('err', err);
      });
  };

  const initialComponent = (
    <Box
      margin="auto"
      width="80%"
      display="flex"
      flexDirection="column"
      textAlign="center"
      padding="16px"
    >
      <Typography variant="h4" color="primary">
        Reset your password
      </Typography>

      <Typography variant="h6" color="#000000" style={{ marginTop: '10px' }}>
        Enter your verified email address and a reset link will be sent to you.
      </Typography>

      <Typography variant="p" color="secondary">
        {message}
      </Typography>

      <input
        className="custom-input"
        id="email"
        name="email"
        placeholder="Email"
        margin="normal"
        color="primary"
        variant="outlined"
        type="text"
        style={{ marginTop: '20px' }}
        value={params.email}
        onKeyDown={onKeyDownSI}
        onChange={onChange}
      />

      <LoadingButton
        type="submit"
        loading={loading}
        style={{ marginTop: '20px' }}
        onClick={onSubmit}
        variant="contained"
        color="primary"
      >
        Send reset email
      </LoadingButton>

      {error && (
        <Typography variant="body1" color="error">
          {error.message}
        </Typography>
      )}
    </Box>
  );

  return (
    <Grid
      className="landing-grid"
      container
      alignItems="center"
      justify="center"
      direction="column"
    >
      <Box boxShadow={3} style={{ margin: 'auto' }}>
        <Grid
          container
          style={{
            maxWidth: '80vw',
            width: 500,
            minHeight: 300,
            background: '#ffffff',
          }}
        >
          {initialComponent}
          <div style={{ marginBottom: '150px' }} />
        </Grid>
      </Box>
    </Grid>
  );
};

export default ForgotPassword;

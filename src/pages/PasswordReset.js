import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from '@material-ui/core';
import React, { useState } from 'react';
import * as Acsys from '../utils/Acsys/Acsys';

const PasswordReset = (props) => {
  const [params, setParams] = useState({
    username: '',
    email: '',
    passwordOne: '',
    passwordTwo: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error] = useState(null);

  const onKeyDownSI = (event) => {
    const { passwordOne, passwordTwo } = params;
    if (event.key === 'Enter' && passwordOne === passwordTwo) {
      event.preventDefault();
      event.stopPropagation();
      onSubmit();
    }
  };

  const onSubmit = async (event) => {
    const { passwordOne } = params;
    setLoading(true);
    await Acsys.resetPassword(props.match.params.id, passwordOne)
      .then((result) => {
        setLoading(false);
        setMessage(result);
      })
      .catch(() => {});
  };

  const onChange = (event) => {
    setParams({
      ...params,
      [event.target.name]: event.target.value,
    });
  };
  const isInvalid = params.passwordOne !== params.passwordTwo;

  let initialComponent;

  initialComponent = (
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
        Enter the new password for your account.
      </Typography>

      <Typography variant="p" color="secondary">
        {message}
      </Typography>

      <input
        id="passwordOne"
        name="passwordOne"
        placeholder="New password"
        margin="normal"
        color="primary"
        variant="outlined"
        type="password"
        style={{ marginTop: '20px' }}
        value={params.passwordOne}
        onKeyDown={onKeyDownSI}
        onChange={onChange}
      />

      <input
        id="passwordTwo"
        name="passwordTwo"
        placeholder="Confirm new password"
        margin="normal"
        color="primary"
        variant="outlined"
        type="password"
        style={{ marginTop: '20px' }}
        value={params.passwordTwo}
        onKeyDown={onKeyDownSI}
        onChange={onChange}
      />

      <Button
        disabled={isInvalid || loading}
        type="submit"
        style={{ marginTop: '20px' }}
        onClick={onSubmit}
        variant="contained"
        color="primary"
      >
        {loading && <CircularProgress color="white" size={24} />}
        {!loading && 'Reset'}
      </Button>

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

export default PasswordReset;

import {
    Box,
    Button,
    CircularProgress,
    Grid, Hidden,
    Typography
} from '@material-ui/core';
import React, { Component } from 'react';
import * as Prom from '../../services/Acsys/Acsys';


const INITIAL_STATE = {
  username: '',
  email: '',
  passwordOne: '',
  passwordTwo: '',
  message: '',
  isInstalled: true,
  loading: false,
  error: null,
};

class ForgotPassword extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount = async () => {
    
  };

  onKeyDownSI = (event) => {
    const {
      username,
      email,
      passwordOne,
    } = this.state;
    if (event.key === 'Enter' && !(passwordOne === '' || username === '')) {
      event.preventDefault();
      event.stopPropagation();
      this.onSubmit();
    }
  };

  onSubmit = async (event) => {
    const { email } = this.state;

    this.setState({ loading: true });

    await Prom.sendResetLink(email)
      .then((result) => {
        this.setState({
          loading: false,
          message: result,
        });
      })
      .catch(() => {});
  };

  onChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  render() {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
      message,
      loading,
      error,
    } = this.state;

    const isInvalidInitial =
      passwordOne !== passwordTwo ||
      passwordOne === '' ||
      email === '' ||
      username === '';

    const isInvalid = passwordOne === '' || username === '';

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

        <Typography
          variant="h4"
          color="primary"
        >
          Reset your password
        </Typography>

        <Typography
          variant="h6"
          color="#000000"
          style={{ marginTop: '10px' }}
        >
          Enter your verified email address and a reset link will be sent to you.
        </Typography>

        <Typography
          variant="p"
          color="secondary"
          // style={{ minHeight: 25, marginTop: '60px' }}
        >
          {message}
        </Typography>

        <input
          id="email"
          name="email"
          placeholder="Email"
          margin="normal"
          color="primary"
          variant="outlined"
          type="text"
          style={{ marginTop: '20px' }}
          value={email}
          onKeyDown={this.onKeyDownRG}
          onChange={this.onChange}
        />

        <Button
          type="submit"
          style={{ marginTop: '20px' }}
          onClick={this.onSubmit}
          variant="contained"
          color="primary"
        >
          {loading && <CircularProgress color="white" size={24} />}
          {!loading && 'Send reset email'}
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
            style={{ maxWidth: '80vw', width: 500, minHeight: 300, background: '#ffffff' }}
          >
            {initialComponent}
            <div style={{ marginBottom: '150px' }} />
          </Grid>
        </Box>
      </Grid>
    );
  }
}

export default ForgotPassword;

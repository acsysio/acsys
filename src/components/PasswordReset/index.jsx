import {
    Box,
    Button,
    CircularProgress,
    Grid, Hidden,
    Typography
} from '@material-ui/core';
import React, { Component } from 'react';
import * as Prom from '../../services/Prometheus/Prom';


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

class PasswordReset extends Component {
  state = { ...INITIAL_STATE };

  componentDidMount = async () => {
    const installed = await Prom.hasAdmin();

    this.setState({
      isInstalled: installed,
    });
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

  onKeyDownRG = (event) => {
    const {
      username,
      email,
      passwordOne,
      passwordTwo,
    } = this.state;
    if (event.key === 'Enter' && !(passwordOne !== passwordTwo || passwordOne === '' || email === '' || username === '')) {
      event.preventDefault();
      event.stopPropagation();
      this.onSubmitInitial();
    }
  };

  onSubmit = async (event) => {
    const { username, passwordOne } = this.state;

    this.setState({ loading: true });

    await Prom.authenticate(username, passwordOne)
      .then((result) => {
        if (result === true) {
          window.location.reload(false);
          event.preventDefault();
        } else {
          this.setState({
            loading: false,
            message: result,
          });
        }
      })
      .catch(() => {});
  };

  onSubmitInitial = async (event) => {
    const { username, email, passwordOne } = this.state;

    this.setState({ loading: true });

    await Prom.register(username, email, passwordOne)
      .then((result) => {
        if (result === true) {
          window.location.reload(false);
          event.preventDefault();
        } else {
          this.setState({
            loading: false,
            message: result,
          });
        }
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
          Enter the new password for your account.
        </Typography>

        <Typography
          variant="p"
          color="secondary"
          // style={{ minHeight: 25, marginTop: '60px' }}
        >
          {message}
        </Typography>

        <input
          id="passwordOne"
          name="passwordOne"
          placeholder="Password"
          margin="normal"
          color="primary"
          variant="outlined"
          type="password"
          style={{ marginTop: '20px' }}
          value={passwordOne}
          onKeyDown={this.onKeyDownRG}
          onChange={this.onChange}
        />

        <input
          id="passwordTwo"
          name="passwordTwo"
          placeholder="Confirm Password"
          margin="normal"
          color="primary"
          variant="outlined"
          type="password"
          style={{ marginTop: '20px' }}
          value={passwordTwo}
          onKeyDown={this.onKeyDownRG}
          onChange={this.onChange}
        />

        <Button
          disabled={isInvalid || loading}
          type="submit"
          style={{ marginTop: '20px' }}
          onClick={this.onSubmit}
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

export default PasswordReset;

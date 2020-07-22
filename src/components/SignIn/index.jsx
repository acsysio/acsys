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

class SignInPage extends Component {
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

    if (this.state.isInstalled) {
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
            style={{ marginTop: '20px' }}
          >
            SIGN IN
          </Typography>

          <Typography
            variant="p"
            color="secondary"
            style={{ minHeight: 25, marginTop: '60px' }}
          >
            {message}
          </Typography>

          <input
            id="username"
            name="username"
            placeholder="Username"
            margin="normal"
            color="primary"
            variant="outlined"
            value={username}
            onKeyDown={this.onKeyDownSI}
            onChange={this.onChange}
          />

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
            onKeyDown={this.onKeyDownSI}
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
            {!loading && 'Sign In'}
          </Button>

          {error && (
            <Typography variant="body1" color="error">
              {error.message}
            </Typography>
          )}
        </Box>
      );
    } else {
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
            style={{ marginTop: '20px' }}
          >
            REGISTER
          </Typography>

          <Typography
            variant="p"
            color="secondary"
            style={{ minHeight: 25, marginTop: '60px' }}
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
            value={email}
            onKeyDown={this.onKeyDownRG}
            onChange={this.onChange}
          />

          <input
            id="username"
            name="username"
            placeholder="Username"
            margin="normal"
            color="primary"
            variant="outlined"
            style={{ marginTop: '20px' }}
            value={username}
            onKeyDown={this.onKeyDownRG}
            onChange={this.onChange}
          />

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
            disabled={isInvalidInitial || loading}
            type="submit"
            style={{ marginTop: '20px' }}
            onClick={this.onSubmitInitial}
            variant="contained"
            color="primary"
          >
            {loading && <CircularProgress size={24} />}
            {!loading && 'Register'}
          </Button>

          {error && (
            <Typography variant="body1" color="error">
              {error.message}
            </Typography>
          )}
        </Box>
      );
    }
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
            style={{ maxWidth: '80vw', width: 1100, minHeight: 580 }}
          >
            <Grid
              item
              sm={false}
              md={6}
              style={{ backgroundColor: 'rgba(50, 50, 50, 0.48)' }}
            >
              <Hidden smDown implementation="css">
                <Box
                  margin="auto"
                  width="80%"
                  display="flex"
                  flexDirection="column"
                  padding="16px"
                >
                  <Typography
                    variant="h3"
                    style={{
                      textAlign: 'left',
                      color: '#ffffff',
                      marginTop: '20px',
                    }}
                  >
                    Prometheus
                  </Typography>
                  <Typography
                    variant="h4"
                    style={{
                      textAlign: 'left',
                      color: '#ffffff',
                      marginTop: '20px',
                    }}
                  >
                    Data Management System
                  </Typography>
                  <Typography
                    variant="p"
                    style={{
                      textAlign: 'left',
                      color: '#ffffff',
                      marginTop: '20px',
                    }}
                  >
                    Prometheus is a data management system that automates many
                    of the backend processes found in web development.
                    Prometheus allows developers to configure a database through
                    the Prometheus web app. Once this is done users can use
                    Prometheus as a headless content management system that also
                    configures restful apis (no coding involved).
                  </Typography>
                </Box>
              </Hidden>
            </Grid>
            <Grid item xs={12} sm={12} md={6} elevation={6} square style={{background: '#ffffff'}}>
              {initialComponent}
              <div style={{ marginBottom: '150px' }} />
            </Grid>
          </Grid>
        </Box>
      </Grid>
    );
  }
}

export default SignInPage;

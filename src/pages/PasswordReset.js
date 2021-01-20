import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Typography,
} from '@material-ui/core';
import React, { Component } from 'react';
import * as Acsys from '../utils/Acsys/Acsys';

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

  constructor(props) {
    super(props);
  }

  componentDidMount = async () => {};

  onKeyDownSI = (event) => {
    const { passwordOne, passwordTwo } = this.state;
    if (event.key === 'Enter' && passwordOne === passwordTwo) {
      event.preventDefault();
      event.stopPropagation();
      this.onSubmit();
    }
  };

  onSubmit = async (event) => {
    const { passwordOne } = this.state;

    this.setState({ loading: true });

    await Acsys.resetPassword(this.props.match.params.id, passwordOne)
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

    const isInvalid = passwordOne !== passwordTwo;

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
          value={passwordOne}
          onKeyDown={this.onKeyDownSI}
          onChange={this.onChange}
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
          value={passwordTwo}
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
  }
}

export default PasswordReset;

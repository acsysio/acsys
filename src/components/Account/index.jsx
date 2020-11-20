import {
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    ExpansionPanel,
    ExpansionPanelDetails,
    ExpansionPanelSummary,
    Tooltip,
} from '@material-ui/core';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { KeyboardArrowDown } from '@material-ui/icons';
import React from 'react';
import * as Prom from '../../services/Acsys/Acsys';

const INITIAL_STATE = {
  passwordChange: false,
  message: '',
  userData: [],
  username: '',
  role: 'Administrator',
  email: '',
  password: '',
  verifyPassword: '',
  page: 0,
  rowsPerPage: 15,
  setOpen: false,
  setMsgOpen: false,
  addLoading: false,
  error: '',
};

class Account extends React.Component {
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

  handleMsgClose = () => {
    this.setState({
      setMsgOpen: false,
    });
  };

  componentDidMount = async () => {
    try {
      this.props.setHeader('Account');
      let userData;
      try {
        userData = await Prom.getData('acsys_users', [
          ['acsys_id', '=', Prom.getId()],
        ]);
      } catch (error) {}
      this.setState({
        acsys_id: userData[0].acsys_id,
        role: userData[0].role,
        username: userData[0].username,
        email: userData[0].email,
        password: userData[0].prmthCd,
        userData: userData[0],
      });
    }
    catch (error) {

    }
  };
  updateCredentials = async () => {
    const {
      acsys_id,
      role,
      username,
      email,
      currentPassword,
      password,
      verifyPassword,
    } = this.state;
    this.setState({ saving: true, saveLoading: true });
    const user = {
      acsys_id: acsys_id,
      role: role,
      mode: Prom.getMode(),
      username: username,
      email: email,
      acsysCd: password,
    };
    if (await Prom.verifyPassword(this.state.userData.acsys_id, currentPassword)) {
      if (this.state.passwordChange) {
          if (password.length > 0) {
            if (password === verifyPassword) {
              await Prom.updateUser(user);
            } else {
              this.setState({
                setMsgOpen: true,
                message: 'Passwords do not match.',
              });
            }
          } else {
            this.setState({
              setMsgOpen: true,
              message: 'Password cannot be left blank.',
            });
          }
      } else {
        await Prom.updateUser(user);
      }
    } else {
      this.setState({
        setMsgOpen: true,
        message: 'Current password is invalid.',
      });
    }
    this.setState({ setOpen: false, saveLoading: false });
  };
  render() {
    const { message, passwordChange, userData, saveLoading } = this.state;
    return (
      <div>
        <Tooltip title="Save Account Settings">
          <Button
            style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
            variant="contained"
            color="primary"
            onClick={this.handleClickOpen}
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
                <Grid style={{ height: 40 }} item xs={12}>
                  <div style={{ width: '100%' }}>
                    <h3 style={{ float: 'left' }}>Role: {userData.role}</h3>
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <h1 class="element-header">Email</h1>
                  <input
                    placeholder="Enter email"
                    defaultValue={userData.email}
                    onChange={(e) => this.setState({ email: e.target.value })}
                    type="text"
                    style={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <h1 class="element-header">Username</h1>
                  <input
                    placeholder="Enter username"
                    defaultValue={userData.username}
                    onChange={(e) =>
                      this.setState({ username: e.target.value })
                    }
                    type="text"
                    readOnly
                    style={{ width: '100%' }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid item xs={12}>
                    <h1 class="element-header">Password</h1>
                  </Grid>
                  <Grid item xs={12}>
                    <ExpansionPanel
                      style={{ clear: 'both' }}
                      onChange={(e) =>
                        this.setState({ passwordChange: !passwordChange })
                      }
                    >
                      <ExpansionPanelSummary
                        expandIcon={<KeyboardArrowDown />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                      >
                        <Typography>Change Password</Typography>
                      </ExpansionPanelSummary>
                      <ExpansionPanelDetails>
                        <input
                          placeholder="Enter new password"
                          onChange={(e) =>
                            this.setState({ password: e.target.value })
                          }
                          type="password"
                          style={{ width: '100%' }}
                        />
                      </ExpansionPanelDetails>
                      <ExpansionPanelDetails>
                        <input
                          placeholder="Confirm new password"
                          onChange={(e) =>
                            this.setState({ verifyPassword: e.target.value })
                          }
                          type="password"
                          style={{ width: '100%' }}
                        />
                      </ExpansionPanelDetails>
                    </ExpansionPanel>
                  </Grid>
                </Grid>
              </Grid>
            </div>
            <div class="element-container">
              <div style={{ height: 40 }}></div>
            </div>
          </div>
          <Dialog
            open={this.state.saveLoading}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth={'md'}
          >
            <DialogTitle id="alert-dialog-title" style={{ margin: 'auto' }}>
              Saving
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
              <input
                placeholder="Enter current password"
                onChange={(e) =>
                  this.setState({ currentPassword: e.target.value })
                }
                type="password"
                style={{ width: '100%' }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color="primary">
                No
              </Button>
              <Button
                onClick={this.updateCredentials}
                color="primary"
                disabled={saveLoading}
                autoFocus
              >
                {saveLoading && <CircularProgress size={24} />}
                {!saveLoading && 'Submit'}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.setMsgOpen}
            onClose={this.handleMsgClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{'Error!'}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {message}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleMsgClose} color="primary">
                Okay
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </div>
    );
  }
}

export default Account;

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
import LoadingDialog from '../components/Dialogs/LoadingDialog';
import MessageDialog from '../components/Dialogs/MessageDialog';
import React, { useEffect, useState } from 'react';
import * as Acsys from '../utils/Acsys/Acsys';

const Account = (props) => {
  const [passwordChange, setpasswordChange] = useState(false);
  const [message, setmessage] = useState('');
  const [userData, setUserData] = useState([]);
  const [username, setusername] = useState('');
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [currentPassword, setcurrentPassword] = useState('');
  const [verifyPassword, setverifyPassword] = useState('');
  const [setOpen, setsetOpen] = useState(false);
  const [setMsgOpen, setsetMsgOpen] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const handleClickOpen = () => {
    setsetOpen(true);
  };

  const handleClose = () => {
    setsetOpen(false);
  };

  const handleMsgClose = () => {
    setsetMsgOpen(false);
  };

  useEffect(async () => {
    try {
      props.setHeader('Account');
      let userData;
      try {
        userData = await Acsys.getData('acsys_users', [
          ['acsys_id', '=', Acsys.getId()],
        ]);
      } catch (error) {}
      setusername(userData[0].username);
      setemail(userData[0].email);
      setpassword(userData[0].prmthCd);
      setUserData(userData[0]);
    } catch (error) {}
  }, []);

  const updateCredentials = async () => {
    setSaveLoading(true);
    const user = {
      acsys_id: userData.acsys_id,
      role: userData.role,
      mode: Acsys.getMode(),
      username: username,
      email: email,
      acsys_cd: password,
    };
    if (await Acsys.verifyPassword(userData.acsys_id, currentPassword)) {
      if (passwordChange) {
        if (password.length > 0) {
          if (password === verifyPassword) {
            await Acsys.updateUser(user);
          } else {
            setsetMsgOpen(true);
            setmessage('Passwords do not match.');
          }
        } else {
          setsetMsgOpen(true);
          setmessage('Password cannot be left blank.');
        }
      } else {
        await Acsys.updateUser(user);
      }
    } else {
      setsetMsgOpen(true);
      setmessage('Current password is invalid.');
    }
    setsetOpen(false);
    setSaveLoading(false);
  };

  console.log('--------', userData);
  return (
    <div>
      <Tooltip title="Save Account Settings">
        <Button
          style={{ float: 'right', marginBottom: 20, marginLeft: 20 }}
          variant="contained"
          color="primary"
          onClick={handleClickOpen}
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
          <div className="element-container">
            <Grid container spacing={3}>
              <Grid style={{ height: 40 }} item xs={12}>
                <div style={{ width: '100%' }}>
                  <h3 style={{ float: 'left' }}>Role: {userData.role}</h3>
                </div>
              </Grid>
              <Grid item xs={12}>
                <h1 className="element-header">Email</h1>
                <input
                  placeholder="Enter email"
                  defaultValue={userData.email}
                  onChange={(e) => setemail(e.target.value)}
                  type="text"
                  style={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12}>
                <h1 className="element-header">Username</h1>
                <input
                  placeholder="Enter username"
                  defaultValue={userData.username}
                  onChange={(e) => setusername(e.target.value)}
                  type="text"
                  readOnly
                  style={{ width: '100%' }}
                />
              </Grid>
              <Grid item xs={12}>
                <Grid item xs={12}>
                  <h1 className="element-header">Password</h1>
                </Grid>
                <Grid item xs={12}>
                  <ExpansionPanel
                    style={{ clear: 'both' }}
                    onChange={(e) => setpasswordChange(!passwordChange)}
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
                        onChange={(e) => setpassword(e.target.value)}
                        type="password"
                        style={{ width: '100%' }}
                      />
                    </ExpansionPanelDetails>
                    <ExpansionPanelDetails>
                      <input
                        placeholder="Confirm new password"
                        onChange={(e) => setverifyPassword(e.target.value)}
                        type="password"
                        style={{ width: '100%' }}
                      />
                    </ExpansionPanelDetails>
                  </ExpansionPanel>
                </Grid>
              </Grid>
            </Grid>
          </div>
          <div className="element-container">
            <div style={{ height: 40 }}></div>
          </div>
        </div>
        <Dialog
          open={setOpen}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{'Update profile?'}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to update this data?
            </DialogContentText>
            <input
              placeholder="Enter current password"
              onChange={(e) => setcurrentPassword(e.target.value)}
              type="password"
              style={{ width: '100%' }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              No
            </Button>
            <Button
              onClick={updateCredentials}
              color="primary"
              disabled={saveLoading}
              autoFocus
            >
              {saveLoading && <CircularProgress size={24} />}
              {!saveLoading && 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
        <LoadingDialog loading={saveLoading} message={'Saving'} />
        <MessageDialog
          open={setMsgOpen}
          closeDialog={handleMsgClose}
          title={'Error!'}
          message={message}
        />
      </Paper>
    </div>
  );
};

export default Account;

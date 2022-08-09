import React from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  NativeSelect,
  Typography,
} from '@mui/material';

export default function NewUserDialog(props) {
  return (
    <Dialog
      open={props.open}
      onClose={props.closeDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{'Add User'}</DialogTitle>
      <DialogContent>
        <Typography variant="p" color="secondary">
          {props.message}
        </Typography>
        <NativeSelect
          onChange={(e) => props.setRole(e.target.value)}
          style={{ width: '97%' }}
        >
          <option value={'Administrator'}>Administrator</option>
          <option value={'Standard User'}>Standard User</option>
          <option value={'Contributor'}>Viewer</option>
        </NativeSelect>

        <input
          id="email"
          name="email"
          placeholder="Email"
          margin="normal"
          color="primary"
          variant="outlined"
          style={{ width: '97%', marginTop: '20px' }}
          value={props.email}
          onChange={(e) => props.setEmail(e.target.value)}
        />

        <input
          id="username"
          name="username"
          placeholder="Username"
          margin="normal"
          color="primary"
          variant="outlined"
          style={{ width: '97%', marginTop: '20px' }}
          value={props.username}
          onChange={(e) => props.setUsername(e.target.value)}
        />

        <input
          id="passwordOne"
          name="passwordOne"
          placeholder="Password"
          margin="normal"
          color="primary"
          variant="outlined"
          type="password"
          style={{ width: '97%', marginTop: '20px' }}
          value={props.passwordOne}
          onChange={(e) => props.setPasswordOne(e.target.value)}
        />

        <input
          id="passwordTwo"
          name="passwordTwo"
          placeholder="Confirm Password"
          margin="normal"
          color="primary"
          variant="outlined"
          type="password"
          style={{ width: '97%', marginTop: '20px' }}
          value={props.passwordTwo}
          onChange={(e) => props.setPasswordTwo(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={props.action} color="primary" autoFocus>
          {props.actionProcess && <CircularProgress size={24} />}
          {!props.actionProcess && 'Add'}
        </Button>
        <Button onClick={props.closeDialog} color="primary" autoFocus>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}

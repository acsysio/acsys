import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import React from 'react';
import { logOut } from '../utils/Session/session';

const acsysOut = () => logOut();

const SignOutButton = () => (
  <Tooltip title="Log Out">
    <IconButton onClick={acsysOut} color="inherit">
      <ExitToAppIcon />
    </IconButton>
  </Tooltip>
);

export default SignOutButton;

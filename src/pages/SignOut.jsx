import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import React from 'react';
import * as Session from '../utils/Session/session';

const acsysOut = () => Session.logOut();

const SignOutButton = () => (
  <Tooltip title="Log Out">
    <IconButton onClick={acsysOut} color="inherit">
      <ExitToAppIcon />
    </IconButton>
  </Tooltip>
);

export default SignOutButton;

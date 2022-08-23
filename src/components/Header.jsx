import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import Hidden from '@mui/material/Hidden';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { AccountCircle as AccountCircleIcon } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../constants/routes';
import * as Acsys from '../utils/Acsys/Acsys';
import SignOutButton from '../pages/SignOut';

export default function Header(props) {
  return (
    <div>
      <AppBar
        style={{ zIndex: 1201, background: '#232f3e', padding: 7 }}
        color="primary"
        position="fixed"
        elevation={0}
      >
        <Grid container alignItems="center">
          <Hidden mdDown>
            <img src="/acsys-logo.svg" alt="" style={{ height: 42 }} />
          </Hidden>
          <Hidden mdUp>
            <Grid item>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={props.onDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            </Grid>
          </Hidden>
          <Grid item xs />
          <Grid item>{Acsys.getUser()}</Grid>
          <Grid item>
            <Tooltip title="My Account">
              <IconButton to={ROUTES.Account} component={Link} color="inherit">
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
            <SignOutButton />
          </Grid>
        </Grid>
      </AppBar>
    </div>
  );
}

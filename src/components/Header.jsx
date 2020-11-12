import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { AccountCircle as AccountCircleIcon } from '@material-ui/icons';
import MenuIcon from '@material-ui/icons/Menu';
import React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../constants/routes';
import * as Prom from '../services/Acsys/Acsys';
import { PromConsumer } from '../services/Session/PromProvider';
import SignOutButton from './SignOut';

const INITIAL_STATE = {
  value: '',
};

class Header extends React.Component {
  state = { ...INITIAL_STATE };

  constructor(props) {
    super(props);
  }

  handleChange = (event, newValue) => {};

  render() {
    return (
      <div>
        <AppBar
          style={{ zIndex: 1201, background: '#232f3e', padding: 7 }}
          color="primary"
          position="fixed"
          elevation={0}
        >
          <Grid container spacing={1} alignItems="center">
            <Hidden smDown implementation="css">
              <img src="/acsys-logo.svg" alt="" style={{height: 45, marginLeft: 10}} />
            </Hidden>
            <Hidden mdUp implementation="css">
              <Grid item>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={this.props.onDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
              </Grid>
            </Hidden>
            <Grid item xs />
            <Grid item>{Prom.getUser()}</Grid>
            <Grid item>
              <Tooltip title="My Account">
                <IconButton
                  to={ROUTES.Account}
                  component={Link}
                  color="inherit"
                >
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
}
Header.contextType = PromConsumer;
export default Header;

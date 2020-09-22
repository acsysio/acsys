import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { createStyles, useTheme, withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
import FolderIcon from '@material-ui/icons/Folder';
import PeopleIcon from '@material-ui/icons/People';
import PermMediaOutlinedIcon from '@material-ui/icons/PhotoSizeSelectActual';
import SettingsIcon from '@material-ui/icons/Settings';
import DataBaseIcon from '@material-ui/icons/ViewAgenda';
import clsx from 'clsx';
import React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../constants/routes';
import * as Prom from '../services/Prometheus/Prom';

const styles = (theme) =>
  createStyles({
    categoryHeader: {
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    categoryHeaderPrimary: {
      color: theme.palette.common.white,
    },
    item: {
      paddingTop: 1,
      paddingBottom: 1,
      color: 'rgba(255, 255, 255, 0.7)',
      '&:hover,&:focus': {
        color: '#4fc3f7',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
      },
    },
    itemCategory: {
      backgroundColor: '#232f3e',
      // boxShadow: '0 -1px 0 #404854 inset',
      paddingTop: theme.spacing(2),
      // paddingBottom: theme.spacing(2),
    },
    firebase: {
      fontSize: 24,
      color: theme.palette.common.white,
    },
    itemPrimary: {
      fontSize: 'inherit',
    },
    itemIcon: {
      minWidth: 'auto',
      marginRight: theme.spacing(2),
    },
    toolbar: theme.mixins.appbar,
    divider: {
      marginTop: theme.spacing(2),
    },
  });

// export interface NavigatorProps extends Omit<DrawerProps, 'classes'>, WithStyles<typeof styles> {}

function Navigator(props) {
  const { classes, ...other } = props;
  const theme = useTheme();

  let categories = [
    {
      id: 'Content',
      children: [
        { id: 'Content', icon: <FolderIcon />, route: ROUTES.LogicalContent },
        {
          id: 'Storage',
          icon: <PermMediaOutlinedIcon />,
          route: ROUTES.Storage,
        },
      ],
    },
    // {
    //   id: 'General',
    //   children: [
    //       { id: 'Help', icon: <HelpIcon />, route: ROUTES.Help },
    //   ],
    // },
  ];

  if (
    Prom.getRole() === 'Administrator' &&
    Prom.getMode() === 'Administrator'
  ) {
    categories = [
      {
        id: 'Content',
        children: [
          { id: 'Content', icon: <FolderIcon />, route: ROUTES.LogicalContent },
          {
            id: 'Storage',
            icon: <PermMediaOutlinedIcon />,
            route: ROUTES.Storage,
          },
          { id: 'Database', icon: <DataBaseIcon />, route: ROUTES.Database },
        ],
      },
      {
        id: 'Administration',
        children: [
          { id: 'Users', icon: <PeopleIcon />, route: ROUTES.Users },
          { id: 'Settings', icon: <SettingsIcon />, route: ROUTES.Settings },
        ],
      },
      // {
      //   id: 'General',
      //   children: [
      //       { id: 'Help', icon: <HelpIcon />, route: ROUTES.Help },
      //   ],
      // },
    ];
  }

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const drawer = (
    <List disablePadding style={{ width: 256 }}>
      {categories.map(({ id, children }) => (
        <React.Fragment key={id}>
          <ListItem className={classes.categoryHeader}>
            <ListItemText
              classes={{
                primary: classes.categoryHeaderPrimary,
              }}
            >
              {id}
            </ListItemText>
          </ListItem>
          {children.map(({ id: childId, icon, route }) => (
            <Link to={route} style={{ textDecoration: 'none' }}>
              <ListItem key={childId} button className={clsx(classes.item)}>
                <ListItemIcon className={classes.itemIcon}>{icon}</ListItemIcon>
                <ListItemText
                  classes={{
                    primary: classes.itemPrimary,
                  }}
                >
                  {childId}
                </ListItemText>
              </ListItem>
            </Link>
          ))}
          <Divider className={classes.divider} />
        </React.Fragment>
      ))}
    </List>
  );

  const mobileDrawer = (
    <List disablePadding style={{ width: 256 }}>
      {categories.map(({ id, children }) => (
        <React.Fragment key={id}>
          <ListItem className={classes.categoryHeader}>
            <ListItemText
              classes={{
                primary: classes.categoryHeaderPrimary,
              }}
            >
              {id}
            </ListItemText>
          </ListItem>
          {children.map(({ id: childId, icon, route }) => (
            <Link to={route} style={{ textDecoration: 'none' }}>
              <ListItem
                key={childId}
                button
                onClick={props.handleDrawerToggle}
                className={clsx(classes.item)}
              >
                <ListItemIcon className={classes.itemIcon}>{icon}</ListItemIcon>
                <ListItemText
                  classes={{
                    primary: classes.itemPrimary,
                  }}
                >
                  {childId}
                </ListItemText>
              </ListItem>
            </Link>
          ))}
          <Divider className={classes.divider} />
        </React.Fragment>
      ))}
    </List>
  );

  return (
    <nav>
      <Hidden mdUp implementation="js">
        <Drawer
          style={{ width: 256 }}
          variant="temporary"
          ModalProps={{
            keepMounted: true,
          }}
          open={props.mobileOpen}
          onClose={props.handleDrawerToggle}
        >
          <IconButton
            onClick={props.handleDrawerToggle}
            style={{ color: '#ffffff', width: 50 }}
          >
            <CloseIcon />
          </IconButton>
          <ListItem className={clsx(classes.categoryHeader)}>
            {Prom.getRole() !== 'Viewer' ? (
              <select
                defaultValue={Prom.getMode()}
                onChange={(e) => props.setMode(e.target.value)}
                className="select-css"
              >
                {Prom.getRole() === 'Administrator' ? (
                  <option value="Administrator">Administrator</option>
                ) : (
                  <div />
                )}
                <option value="Standard User">Standard User</option>
                <option value="Viewer">Viewer</option>
              </select>
            ) : (
              <div />
            )}
          </ListItem>

          {mobileDrawer}
        </Drawer>
      </Hidden>
      <Hidden smDown implementation="css">
        <Drawer variant="permanent" style={{ width: 256 }}>
          <div style={{ height: 60 }} />
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
}

export default withStyles(styles)(Navigator);

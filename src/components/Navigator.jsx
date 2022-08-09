import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Hidden from '@mui/material/Hidden';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CloseIcon from '@mui/icons-material/Close';
import FolderIcon from '@mui/icons-material/Folder';
import InfoIcon from '@mui/icons-material/Info';
import PeopleIcon from '@mui/icons-material/People';
import PermMediaOutlinedIcon from '@mui/icons-material/PhotoSizeSelectActual';
import SettingsIcon from '@mui/icons-material/Settings';
import DataBaseIcon from '@mui/icons-material/ViewAgenda';
import React from 'react';
import { Link } from 'react-router-dom';
import * as ROUTES from '../constants/routes';
import * as Acsys from '../utils/Acsys/Acsys';

function Navigator(props) {
  const styles = {
    categoryHeader: {
      paddingTop: 15,
      paddingBottom: 15, 
    },
    categoryHeaderPrimary: {
      // color: theme.palette.common.white,
    },
    item: {
      paddingTop: 1,
      paddingBottom: 1,
      color: '#ffffff',
      '&:hover,&:focus': {
        color: '#c5a8ff',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
      },
    },
    itemCategory: {
      backgroundColor: '#232f3e',
      
    },
    firebase: {
      fontSize: 24,
      // color: theme.palette.common.white,
    },
    itemPrimary: {
      fontSize: 'inherit',
      color: '#ffffff',
    },
    itemIcon: {
      minWidth: 'auto',
      color: '#ffffff',
      marginRight: 15,
    },
    divider: {
      backgroundColor: '#404854',
      marginTop: 15,
    },
  };

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
  ];

  if (
    Acsys.getRole() === 'Administrator' &&
    Acsys.getMode() === 'Administrator'
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
    ];
  }

  const drawer = (
    <List disablePadding style={{ width: 256 }}>
      {categories.map(({ id, children }) => (
        <React.Fragment key={id}>
          <ListItem style={styles.categoryHeader}>
            <ListItemText>
              {id}
            </ListItemText>
          </ListItem>
          {children.map(({ id: childId, icon, route }) => (
            <Link to={route} style={{ textDecoration: 'none' }}>
              <ListItem key={childId} button style={styles.item}>
                <ListItemIcon style={styles.itemIcon}>{icon}</ListItemIcon>
                <ListItemText style={styles.itemPrimary}>
                  {childId}
                </ListItemText>
              </ListItem>
            </Link>
          ))}
          <Divider style={styles.divider} />
        </React.Fragment>
      ))}
      <ListItem style={styles.categoryHeader}>
        <ListItemText>
          General
        </ListItemText>
      </ListItem>
      <a
        href="https://acsys.io/"
        target="_blank"
        style={{ textDecoration: 'none' }}
      >
        <ListItem key="Info" button style={styles.item}>
          <ListItemIcon style={styles.itemIcon}>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText style={styles.itemPrimary}>
            Info
          </ListItemText>
        </ListItem>
      </a>
      <Divider style={styles.divider} />
    </List>
  );

  const mobileDrawer = (
    <List disablePadding style={{ width: 256 }}>
      {categories.map(({ id, children }) => (
        <React.Fragment key={id}>
          <ListItem style={styles.categoryHeader}>
            <ListItemText>
              {id}
            </ListItemText>
          </ListItem>
          {children.map(({ id: childId, icon, route }) => (
            <Link to={route} style={{ textDecoration: 'none' }}>
              <ListItem
                key={childId}
                button
                onClick={props.handleDrawerToggle}
                style={styles.item}
              >
                <ListItemIcon style={styles.itemIcon}>{icon}</ListItemIcon>
                <ListItemText style={styles.itemPrimary}>
                  {childId}
                </ListItemText>
              </ListItem>
            </Link>
          ))}
          <Divider style={styles.divider} />
        </React.Fragment>
      ))}
      <ListItem style={styles.categoryHeader}>
        <ListItemText>
          General
        </ListItemText>
      </ListItem>
      <a
        href="https://acsys.io/"
        target="_blank"
        style={{ textDecoration: 'none' }}
      >
        <ListItem key="Info" button style={styles.item}>
          <ListItemIcon style={styles.itemIcon}>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText style={styles.itemPrimary}>
            Info
          </ListItemText>
        </ListItem>
      </a>
      <Divider style={styles.divider} />
    </List>
  );

  return (
    <nav>
      <Hidden lgUp implementation="js">
        <Drawer
          style={{ width: 256 }}
          variant="temporary"
          PaperProps={{
            sx: {
              backgroundColor: '#18202c',
              color: '#ffffff',
            },
          }}
          ModalProps={{
            keepMounted: true,
          }}
          open={props.mobileOpen}
          onClose={props.handleDrawerToggle}
        >
          <div style={{ height: 80 }} />
          {/* <IconButton
            onClick={props.handleDrawerToggle}
            style={{ color: '#ffffff', width: 50 }}
          >
            <CloseIcon />
          </IconButton> */}
          <ListItem>
            {Acsys.getRole() !== 'Viewer' ? (
              <select
                defaultValue={Acsys.getMode()}
                onChange={(e) => props.setMode(e.target.value)}
                className="select-css"
              >
                {Acsys.getRole() === 'Administrator' ? (
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
      <Hidden mdDown implementation="css">
        <Drawer
          variant="permanent"
          style={{ width: 256 }}
          PaperProps={{
            sx: {
              backgroundColor: '#18202c',
              color: '#ffffff',
            },
          }}
        >
          <div style={{ height: 60 }} />
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  );
}

export default Navigator;

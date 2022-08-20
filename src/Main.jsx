import { createTheme, ThemeProvider } from '@mui/material/styles';
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import Configuration from './pages/Configuration';
import * as Acsys from './utils/Acsys/Acsys';
import { AcsysProvider } from './utils/Session/AcsysProvider';
import * as serviceWorker from './serviceWorker';

let theme = createTheme({
  palette: {
    primary: {
      light: '#c5a8ff',
      main: '#b79afe',
      dark: '#7735e3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    h5: {
      fontWeight: 500,
      fontSize: 26,
      letterSpacing: 0.5,
    },
    button: {
      textTransform: 'none',
      padding: 0,
    },
  },
  shape: {
    borderRadius: 8,
  },
  props: {
    MuiTab: {
      disableRipple: true,
    },
  },
  mixins: {
    toolbar: {
      minHeight: 48,
    },
  },
});

theme = {
  ...theme,
  overrides: {
    MuiDrawer: {
      paper: {
        backgroundColor: '#18202c',
      },
    },
    MuiButton: {
      label: {
        textTransform: 'none',
      },
      contained: {
        boxShadow: 'none',
        '&:active': {
          boxShadow: 'none',
        },
      },
    },
    MuiTabs: {
      root: {
        marginLeft: theme.spacing(1),
      },
      indicator: {
        height: 3,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        backgroundColor: theme.palette.common.white,
      },
    },
    MuiTab: {
      root: {
        textTransform: 'none',
        margin: '0 16px',
        minWidth: 0,
        padding: 0,
        [theme.breakpoints.up('md')]: {
          padding: 0,
          minWidth: 0,
        },
      },
    },
    MuiIconButton: {
      root: {
        padding: theme.spacing(1),
      },
    },
    MuiTooltip: {
      tooltip: {
        borderRadius: 4,
      },
    },
    MuiDivider: {
      root: {
        backgroundColor: '#404854',
      },
    },
    MuiListItemText: {
      primary: {
        fontWeight: theme.typography.fontWeightMedium,
      },
    },
    MuiListItemIcon: {
      root: {
        color: 'inherit',
        marginRight: 0,
        '& svg': {
          fontSize: 20,
        },
      },
    },
    MuiAvatar: {
      root: {
        width: 32,
        height: 32,
      },
    },
  },
};

const init = async () => {
  const rootElement = document.getElementById('root');
  const root = createRoot(rootElement);
  const con = await Acsys.isConnected();
  if (con) {
    root.render(
      <ThemeProvider theme={theme}>
        <AcsysProvider>
          <App />
        </AcsysProvider>
      </ThemeProvider>
    );
  } else {
    root.render(
      <body>
        <ThemeProvider theme={theme}>
          <Configuration />
        </ThemeProvider>
      </body>
    );
  }
};

init();

serviceWorker.unregister();

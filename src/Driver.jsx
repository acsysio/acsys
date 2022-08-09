import AppBar from '@mui/material/AppBar';
import Grid from '@mui/material/Grid';
import Hidden from '@mui/material/Hidden';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import React, { lazy, useContext, useEffect, useState } from 'react';
import {
  Navigate,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom';
import * as Acsys from './utils/Acsys/Acsys';
import Footer from './components/Footer';
import Header from './components/Header';
import Navigator from './components/Navigator';
import * as Session from './utils/Session/session';
import { AcsysContext } from './utils/Session/AcsysProvider';
import SignInPage from './pages/SignIn';

export default function Driver(props) {
  const context = useContext(AcsysContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mode, setMode] = useState();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const setRootMode = async (mode) => {
    await Acsys.setMode(mode);
    setMode(mode);
  };

  useEffect(() => {
    setMode(Acsys.getMode());
  });

  const renderApp = () => {
    if (Session.getRefreshSession()) {
      return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Header
            mode={mode}
            setMode={setRootMode}
            header={context.getHeader()}
            onDrawerToggle={handleDrawerToggle}
          />
          <Navigator
            mode={mode}
            setMode={setRootMode}
            mobileOpen={mobileOpen}
            handleDrawerToggle={handleDrawerToggle}
          />

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              marginTop: 50,
            }}
          >
            <Hidden smDown implementation="css">
              <AppBar
                color="primary"
                component="div"
                style={{
                  zIndex: 0,
                  color: '#18202c',
                  background: '#eaeff1',
                  paddingTop: 20,
                }}
                position="static"
                elevation={0}
              >
                <Toolbar>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item style={{ marginRight: 20 }}>
                      <Typography color="inherit" variant="h4" component="h1">
                        {context.getHeader()}
                      </Typography>
                    </Grid>
                    <Grid item xs />
                    {Acsys.getRole() !== 'Viewer' ? (
                      <Grid item>
                        <Typography color="inherit" variant="p">
                          Perspective:
                        </Typography>
                      </Grid>
                    ) : (
                      <div />
                    )}
                    <Grid item style={{ width: 150 }}>
                      {Acsys.getRole() !== 'Viewer' ? (
                        <select
                          defaultValue={Acsys.getMode()}
                          onChange={(e) => setRootMode(e.target.value)}
                          className="select-css"
                        >
                          {Acsys.getRole() === 'Administrator' ? (
                            <option value={'Administrator'}>Administrator</option>
                          ) : (
                            <div />
                          )}
                          <option value={'Standard User'}>Standard User</option>
                          <option value={'Viewer'}>Viewer</option>
                        </select>
                      ) : (
                        <div />
                      )}
                    </Grid>
                  </Grid>
                </Toolbar>
              </AppBar>
            </Hidden>
            <main
              style={{ flex: 1, padding: '48px 26px', background: '#eaeff1' }}
            >
              <div style={{ maxWidth: '80vw', margin: 'auto' }}>
                <div style={{ flex: 1, maxWidth: 1236, margin: 'auto' }}>
                  {/* <Navigate from="/" to={ROUTES.LogicalContent} /> */}
                  <Outlet />
                </div>
              </div>
            </main>
            <footer style={{ padding: 16, background: '#eaeff1' }}>
              <Footer />
            </footer>
          </div>
        </div>
      );
    } else {
      return <SignInPage />;
    }
  };

  return (
    renderApp()
  );
}

import AppBar from '@material-ui/core/AppBar';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import * as Prom from '../services/Prometheus/Prom';
import Footer from './Footer';
import Header from './Header';
import Navigator from './Navigator';
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import * as ROUTES from '../constants/routes';
const Account = lazy(() => import('./Account'));
const CollectionView = lazy(() => import('./CollectionView'));
const Database = lazy(() => import('./Database'));
const DocumentView = lazy(() => import('./DocumentView'));
const LogicalContent = lazy(() => import('./LogicalContent'));
const Settings = lazy(() => import('./Settings'));
const Storage = lazy(() => import('./Storage'));
const Users = lazy(() => import('./Users'));

const INITIAL_STATE = {
  header: '',
  mobileOpen: false,
};

class Driver extends React.Component {
  state = { ...INITIAL_STATE };

  constructor(props) {
    super(props);
  }

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  setMode = async (mode) => {
    await Prom.setMode(mode);
    this.setState({ mode: mode });
  };

  setHeader = (header) => {
    this.setState({ header: header });
  };

  componentDidMount = async () => {
    this.setState({ mode: Prom.getMode() });
  };

  render() {
    return (
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Router>
          <Header
            mode={this.state.mode}
            setMode={this.setMode}
            header={this.state.header}
            onDrawerToggle={this.handleDrawerToggle}
          />
          <Navigator
            mode={this.state.mode}
            setMode={this.setMode}
            mobileOpen={this.state.mobileOpen}
            handleDrawerToggle={this.handleDrawerToggle}
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
                        {this.state.header}
                      </Typography>
                    </Grid>
                    <Grid item xs />
                    {Prom.getRole() !== 'Viewer' ? (
                      <Grid item>
                        <Typography color="inherit" variant="p">
                          Perspective:
                        </Typography>
                      </Grid>
                    ) : (
                      <div />
                    )}
                    <Grid item style={{ width: 150 }}>
                      {Prom.getRole() !== 'Viewer' ? (
                        <select
                          defaultValue={Prom.getMode()}
                          onChange={(e) => this.setMode(e.target.value)}
                          className="select-css"
                        >
                          {Prom.getRole() === 'Administrator' ? (
                            <option value={'Administrator'}>
                              Administrator
                            </option>
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
                  <Redirect from="/" to={ROUTES.LogicalContent} />
                  <Suspense fallback={<div/>}>
                    <Switch>
                      <Route
                        path={ROUTES.LogicalContent}
                        render={(props) => (
                          <LogicalContent {...props} setHeader={this.setHeader} />
                        )}
                      />
                      <Route
                        path={ROUTES.CollectionView}
                        render={(props) => (
                          <CollectionView {...props} setHeader={this.setHeader} />
                        )}
                      />
                      <Route
                        path={ROUTES.DocumentView}
                        render={(props) => (
                          <DocumentView {...props} setHeader={this.setHeader} />
                        )}
                      />
                      <Route
                        path={ROUTES.Storage}
                        render={(props) => (
                          <Storage {...props} setHeader={this.setHeader} />
                        )}
                      />
                      <Route
                        path={ROUTES.Account}
                        render={(props) => (
                          <Account {...props} setHeader={this.setHeader} />
                        )}
                      />
                      {Prom.getRole() === 'Administrator' ? (
                        <div>
                          <Route
                            path={ROUTES.Database}
                            render={(props) => (
                              <Database {...props} setHeader={this.setHeader} />
                            )}
                          />
                          <Route
                            path={ROUTES.Users}
                            render={(props) => (
                              <Users {...props} setHeader={this.setHeader} />
                            )}
                          />
                          <Route
                            path={ROUTES.Settings}
                            render={(props) => (
                              <Settings {...props} setHeader={this.setHeader} />
                            )}
                          />
                        </div>
                      ) : (
                        <div />
                      )}
                    </Switch>
                  </Suspense>
                </div>
              </div>
            </main>
            <footer style={{ padding: 16, background: '#eaeff1' }}>
              <Footer />
            </footer>
          </div>
        </Router>
      </div>
    );
  }
}

export default Driver;

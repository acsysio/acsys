import React from 'react';
import 'react-quill/dist/quill.snow.css';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import '../../css/prometheus.css';
import '../../css/react-datetime.css';
import { getRefreshSession } from '../../services/Session/session';
import Driver from '../Driver';
import SignInPage from '../SignIn';
import PasswordReset from '../PasswordReset';
import ForgotPassword from '../ForgotPassword';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Route
          path="/PasswordReset/:id"
          render={(props) => <PasswordReset {...props} />}
        />
        <Route path="/ForgotPassword" render={() => <ForgotPassword />} />
        <Route exact path="/">
          <Redirect to="/SignIn" />
        </Route>
        <Route path="/LogicalContent">
          <Redirect to="/SignIn" />
        </Route>
        <Route path="/CollectionView">
          <Redirect to="/SignIn" />
        </Route>
        <Route path="/DocumentView">
          <Redirect to="/SignIn" />
        </Route>
        <Route path="/Storage">
          <Redirect to="/SignIn" />
        </Route>
        <Route path="/Database">
          <Redirect to="/SignIn" />
        </Route>
        <Route path="/Users">
          <Redirect to="/SignIn" />
        </Route>
        <Route path="/Settings">
          <Redirect to="/SignIn" />
        </Route>
        <Route path="/Account">
          <Redirect to="/SignIn" />
        </Route>
        <Route
          path="/SignIn"
          render={() => (getRefreshSession() ? <Driver /> : <SignInPage />)}
        />
      </Router>
    </div>
  );
}

export default App;

import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './css/acsys.css';
import './css/react-datetime.css';
import * as Session from './utils/Session/session';
import Loading from './pages/Loading';
import SignInPage from './pages/SignIn';
import Driver from './Driver';
import ForgotPassword from './pages/ForgotPassword';
import PasswordReset from './pages/PasswordReset';

export default function App() {
  return (
    <div>
      <Router>
        <Suspense fallback={<Loading />}>
          <Switch>
            <Route
              path="/PasswordReset/:id"
              render={(props) => <PasswordReset {...props} />}
            />
            <Route path="/ForgotPassword" render={() => <ForgotPassword />} />
            <Route
              path="/"
              render={() => (Session.getRefreshSession() ? <Driver /> : <SignInPage />)}
            />
          </Switch>
        </Suspense>
      </Router>
    </div>
  );
}

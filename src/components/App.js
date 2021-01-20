import React, { lazy, Suspense } from 'react';
import 'react-quill/dist/quill.snow.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import '../css/acsys.css';
import '../css/react-datetime.css';
import { getRefreshSession } from '../utils/Session/session';
import Loading from './Loading';

const SignInPage = lazy(() => import('../pages/SignIn'));
const PasswordReset = lazy(() => import('../pages/PasswordReset'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));

const Driver = lazy(() => import('./Driver'));

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
              render={() => (getRefreshSession() ? <Driver /> : <SignInPage />)}
            />
          </Switch>
        </Suspense>
      </Router>
    </div>
  );
}

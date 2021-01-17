import React, { lazy, Suspense } from 'react';
import 'react-quill/dist/quill.snow.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import '../../css/acsys.css';
import '../../css/react-datetime.css';
import { getRefreshSession } from '../../services/Session/session';
import Loading from '../Loading';
import './App.css';

const SignInPage = lazy(() => import('../SignIn'));
const PasswordReset = lazy(() => import('../PasswordReset'));
const ForgotPassword = lazy(() => import('../ForgotPassword'));

const Driver = lazy(() => import('../Driver'));

export default function App() {
  return (
    <div className="App">
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

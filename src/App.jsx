import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './css/acsys.css';
import './css/react-datetime.css';
import * as Acsys from './utils/Acsys/Acsys';
import * as ROUTES from './constants/routes';
import Loading from './pages/Loading';
import Driver from './Driver';
import ForgotPassword from './pages/ForgotPassword';
import PasswordReset from './pages/PasswordReset';

const Account = lazy(() => import('./pages/Account'));
const CollectionView = lazy(() => import('./pages/CollectionView'));
const Database = lazy(() => import('./pages/Database'));
const DocumentView = lazy(() => import('./pages/DocumentView'));
const LogicalContent = lazy(() => import('./pages/LogicalContent'));
const Settings = lazy(() => import('./pages/Settings'));
const Storage = lazy(() => import('./pages/Storage'));
const Users = lazy(() => import('./pages/Users'));

export default function App() {
  return (
    <div>
      <Router>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route
              path={ROUTES.PasswordReset}
              render={(props) => <PasswordReset {...props} />}
            />
            <Route path={ROUTES.ForgotPassword} render={() => <ForgotPassword />} />
            <Route path="/" element={<Driver />}>
              <Route index element={<LogicalContent />} />
              <Route
                path={ROUTES.LogicalContent}
                element={<LogicalContent />}
              />
              <Route
                path={ROUTES.CollectionView}
                element={
                  <CollectionView />
                }
              />
              <Route
                path={ROUTES.DocumentView}
                element={
                  <DocumentView />
                }
              />
              <Route
                path={ROUTES.Storage}
                element={
                  <Storage />
                }
              />
              <Route
                path={ROUTES.Account}
                element={
                  <Account />
                }
              />
              {Acsys.getRole() === 'Administrator' ? (
                <Route>
                  <Route
                    path={ROUTES.Database}
                    element={
                      <Database />
                    }
                  />
                  <Route
                    path={ROUTES.Users}
                    element={
                      <Users />
                    }
                  />
                  <Route
                    path={ROUTES.Settings}
                    element={
                      <Settings />
                    }
                  />
                </Route>
              ) : (
                <Route />
              )}
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

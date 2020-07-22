import React from 'react';
import 'react-quill/dist/quill.snow.css';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import '../../css/prometheus.css';
import '../../css/react-datetime.css';
import { getRefreshSession } from '../../services/Session/session';
import Driver from '../Driver';
import SignInPage from '../SignIn';
import './App.css';

function App() {
  return (
    <div className="App">
      <Router>
        <Route
          path="/"
          render={() => (getRefreshSession() ? <Driver /> : <SignInPage />)}
        />
      </Router>
    </div>
  );
}

export default App;

import React, { lazy, Suspense } from 'react';
// import 'react-quill/dist/quill.snow.css';
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

// import { Link, Route, Routes } from 'react-router-dom'

// // Auto generates routes from files under ./pages
// // https://vitejs.dev/guide/features.html#glob-import
// const pages = import.meta.glob('./pages/*.jsx', { eager: true })

// const routes = Object.keys(pages).map((path) => {
//   const name = path.match(/\.\/pages\/(.*)\.jsx$/)[1]
//   return {
//     name,
//     path: name === 'Home' ? '/' : `/${name.toLowerCase()}`,
//     component: pages[path].default
//   }
// })

// export function App() {
//   return (
//     <>
//       <nav>
//         <ul>
//           {routes.map(({ name, path }) => {
//             return (
//               <li key={path}>
//                 <Link to={path}>{name}</Link>
//               </li>
//             )
//           })}
//         </ul>
//       </nav>
//       <Routes>
//         {routes.map(({ path, component: RouteComp }) => {
//           return <Route key={path} path={path} element={<RouteComp />}></Route>
//         })}
//       </Routes>
//     </>
//   )
// }


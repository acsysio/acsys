import Cookies from 'js-cookie';

export const getId = () => {
  const id = Cookies.get('acsys_id');
  return id;
};

export const getRole = () => {
  const role = Cookies.get('acsys_role');
  return role;
};

export const getMode = () => {
  const mode = Cookies.get('acsys_mode');
  return mode;
};

export const setMode = (newMode) => {
  Cookies.remove('acsys_mode');
  Cookies.set('acsys_mode', newMode);
};

export const getUser = () => {
  const user = Cookies.get('acsys_user');
  return user;
};

export const getEmail = () => {
  const email = Cookies.get('acsys_email');
  return email;
};

export const getSession = () => {
  const jwt = Cookies.get('acsys_session');
  let session;
  try {
    if (jwt) {
      const base64Url = jwt.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      session = JSON.parse(window.atob(base64));
      const today = parseInt(new Date().getTime().toString().substr(0, 10));
      const difference = session.exp - today;
      if (difference <= 0) {
        session = null;
      }
    }
  } catch (error) {
    console.log(error);
  }
  return session;
};

export const getRefreshSession = () => {
  const jwt = Cookies.get('acsys_refreshToken');
  let session;
  try {
    if (jwt) {
      const base64Url = jwt.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      session = JSON.parse(window.atob(base64));
      const today = parseInt(new Date().getTime().toString().substr(0, 10));
      const difference = session.exp - today;
      if (difference <= 0) {
        session = null;
      }
    }
  } catch (error) {
    console.log(error);
  }
  return session;
};

export const getToken = () => {
  return Cookies.get('acsys_session');
};

export const getRefreshToken = () => {
  return Cookies.get('acsys_refreshToken');
};

export const logOut = () => {
  Cookies.remove('acsys_id');
  Cookies.remove('acsys_user');
  Cookies.remove('acsys_email');
  Cookies.remove('acsys_mode');
  Cookies.remove('acsys_session');
  Cookies.remove('acsys_refreshToken');
  window.location.href = '/';
};

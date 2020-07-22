import Cookies from 'js-cookie';

export const getId = () => {
  const id = Cookies.get('prmths_id');
  return id;
};

export const getRole = () => {
  const role = Cookies.get('prmths_role');
  return role;
};

export const getMode = () => {
  const mode = Cookies.get('prmths_mode');
  return mode;
};

export const setMode = (newMode) => {
  Cookies.remove('prmths_mode');
  Cookies.set('prmths_mode', newMode);
};

export const getUser = () => {
  const user = Cookies.get('prmths_user');
  return user;
};

export const getEmail = () => {
  const email = Cookies.get('prmths_email');
  return email;
};

export const getSession = () => {
  const jwt = Cookies.get('prmths_session');
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
  const jwt = Cookies.get('prmths_refreshToken');
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
  return Cookies.get('prmths_session');
};

export const getRefreshToken = () => {
  return Cookies.get('prmths_refreshToken');
};

export const logOut = () => {
  Cookies.remove('prmths_id');
  Cookies.remove('prmths_user');
  Cookies.remove('prmths_email');
  Cookies.remove('prmths_mode');
  Cookies.remove('prmths_session');
  Cookies.remove('prmths_refreshToken');
  window.location.reload();
};

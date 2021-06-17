import Cookies from 'js-cookie';
import uniqid from 'uniqid';
import * as Session from '../Session/session';

export const getId = () => {
  return Session.getId();
};

export const getRole = () => {
  return Session.getRole();
};

export const getUser = () => {
  return Session.getUser();
};

export const getEmail = () => {
  return Session.getEmail();
};

export const getMode = () => {
  return Session.getMode();
};

export const setMode = async (newMode) => {
  return new Promise(async (resolve, reject) => {
    await updateUser({
      acsys_id: getId(),
      username: getUser(),
      email: getEmail(),
      role: getRole(),
      mode: newMode,
    })
      .then(() => {
        Session.setMode(newMode);
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
};

export const getUnique_id = () => {
  return uniqid();
};

const promFetch = (url, options = {}) => {
  const { timeout = 15000, ...rest } = options;
  if (rest.signal)
    throw new Error('Signal not supported in timeoutable promFetch');
  const controller = new AbortController();
  const { signal } = controller;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('Timeout for Promise'));
      controller.abort();
      window.location.reload();
    }, timeout);
    fetch(url, { signal, ...rest })
      .finally(() => clearTimeout(timer))
      .then(resolve, reject);
  });
};

export const checkToken = () => {
  return new Promise((resolve, reject) => {
    try {
      if (Session.getSession()) {
        resolve(true);
      } else {
        let token;
        let refreshToken;
        promFetch('/api/refresh', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${Session.getRefreshToken()}`,
          },
        })
          .then((response) => response.json())
          .then((json) => {
            token = json.token;
            refreshToken = json.refreshToken;
            Cookies.set('acsys_session', token);
            Cookies.set('acsys_refreshToken', refreshToken);
            resolve(true);
          })
          .catch((response) => {
            resolve(false);
          });
      }
    } catch (error) {
      Session.logOut();
      reject();
    }
  });
};

export const getProjectName = async () => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/getProjectName', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json.value);
            })
            .catch((error) => {
              console.log(error);
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const getOpenPageUrl = async (
  table,
  where,
  limit,
  order_by,
  order,
  direction,
  currentPage
) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    const apiString = `/api/getOpenPageUrl?table=${table}&options=${JSON.stringify(
      {
        where,
        limit,
        order_by,
        order,
        direction,
        currentPage,
      }
    )}`;
    promFetch(apiString, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json.url);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        resolve([]);
      });
  });
};

export const getOpenUrl = async (table, where, limit, order_by, order) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    const apiString = `/api/getOpenUrl?table=${table}&options=${JSON.stringify({
      where,
      limit,
      order_by,
      order,
    })}`;
    promFetch(apiString, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json.url);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        resolve([]);
      });
  });
};

export const restart = async () => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/restart', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(() => {
        Session.logOut();
      })
      .catch(() => {
        Session.logOut();
      });
    resolve(true);
  });
};

export const setInitialLocalDatabaseConfig = async (projectName) => {
  return new Promise((resolve, reject) => {
    promFetch('/api/setInitialLocalDatabaseConfig', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectName,
      }),
    })
      .then((response) => {
        Session.logOut();
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json.value);
          });
          resolve();
        } else {
          reject();
        }
      })
      .catch(reject);
  });
};

export const setLocalDatabaseConfig = async (projectName) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/setLocalDatabaseConfig', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        projectName,
      }),
    })
      .then((response) => {
        Session.logOut();
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json.value);
          });
          resolve();
        } else {
          reject();
        }
      })
      .catch(reject);
  });
};

export const setInitialFirestoreConfig = async (config) => {
  return new Promise((resolve, reject) => {
    promFetch('/api/setInitialFirestoreConfig', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: config,
    })
      .then((response) => {
        Session.logOut();
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json.value);
          });
          resolve();
        } else {
          reject();
        }
      })
      .catch(reject);
  });
};

export const setFirestoreConfig = async (config) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/setFirestoreConfig', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: config,
    })
      .then((response) => {
        Session.logOut();
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json.value);
          });
          resolve();
        } else {
          reject();
        }
      })
      .catch(reject);
  });
};

export const setInitialMysqlConfig = async (
  host,
  port,
  database,
  username,
  password,
  socketPath,
  config
) => {
  const formData = new FormData();
  formData.append('host', host);
  formData.append('port', port);
  formData.append('database', database);
  formData.append('username', username);
  formData.append('password', password);
  formData.append('socketPath', socketPath);
  formData.append('file', config);
  return new Promise((resolve, reject) => {
    promFetch('/api/setInitialMysqlConfig', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
      body: formData,
    })
      .then((response) => {
        Session.logOut();
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json.value);
          });
          resolve();
        } else {
          reject();
        }
      })
      .catch(reject);
  });
};

export const setMysqlConfig = async (
  host,
  port,
  database,
  username,
  password,
  socketPath,
  config
) => {
  await checkToken();
  const formData = new FormData();
  formData.append('host', host);
  formData.append('port', port);
  formData.append('database', database);
  formData.append('username', username);
  formData.append('password', password);
  formData.append('socketPath', socketPath);
  formData.append('file', config);
  return new Promise((resolve, reject) => {
    promFetch('/api/setMysqlConfig', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: formData,
    })
      .then((response) => {
        Session.logOut();
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json.value);
          });
          resolve();
        } else {
          reject();
        }
      })
      .catch(reject);
  });
};

export const setEmailConfig = async (config) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/setEmailConfig', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify(config),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json.value);
          });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(reject);
  });
};

export const getEmailConfig = async () => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/getEmailConfig', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              resolve([]);
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const getDatabaseConfig = async () => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/getDatabaseConfig', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const setStorageConfig = async (config) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/setStorageConfig', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify(config),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json.value);
          });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(reject);
  });
};

export const getStorageConfig = async () => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/getStorageConfig', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const register = (username, email, password) => {
  return new Promise((resolve, reject) => {
    const role = 'Administrator';

    let user;
    let token;
    let refreshToken;

    const userData = {
      acsys_id: uniqid(),
      email,
      username,
      role,
      mode: role,
      password,
    };

    promFetch('/api/register', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: userData,
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.message) {
          resolve(json.message);
        } else {
          user = json.username;
          token = json.token;
          refreshToken = json.refreshToken;
          Cookies.set('acsys_id', userData.acsys_id);
          Cookies.set('acsys_role', userData.role);
          Cookies.set('acsys_mode', userData.mode);
          Cookies.set('acsys_user', user);
          Cookies.set('acsys_email', email);
          Cookies.set('acsys_session', token);
          Cookies.set('acsys_refreshToken', refreshToken);
          resolve(true);
        }
      })
      .catch((response) => {
        resolve(false);
      });
  });
};

export const sendResetLink = async (email) => {
  return new Promise((resolve, reject) => {
    promFetch('/api/sendResetLink', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json.message);
          });
        } else {
          reject();
        }
      })
      .catch(reject);
  });
};

export const resetPassword = async (acsys_id, password) => {
  return new Promise((resolve, reject) => {
    promFetch('/api/resetPassword', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        acsys_id,
        password,
      }),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json.message);
          });
        } else {
          reject();
        }
      })
      .catch(reject);
  });
};

export const createUser = async (user) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/createUser', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        data: user,
      }),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            if (json.message) {
              resolve(json.message);
            } else {
              resolve(true);
            }
          });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(reject);
  });
};

export const updateUser = async (user) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/updateUser', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        data: user,
      }),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json);
          });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(reject);
  });
};

export const getUsers = async (user) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch(`/api/getUsers?user=${user}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const authenticate = (username, password) => {
  return new Promise((resolve, reject) => {
    let acsys_id;
    let role;
    let mode;
    let user;
    let email;
    let token;
    let refreshToken;
    promFetch('/api/authenticate', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: { username },
        password: { password },
      }),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.message) {
          resolve(json.message);
        } else {
          acsys_id = json.acsys_id;
          role = json.role;
          mode = json.mode;
          user = json.username;
          email = json.email;
          token = json.token;
          refreshToken = json.refreshToken;
          Cookies.set('acsys_id', acsys_id);
          Cookies.set('acsys_role', role);
          Cookies.set('acsys_mode', mode);
          Cookies.set('acsys_user', user);
          Cookies.set('acsys_email', email);
          Cookies.set('acsys_session', token);
          Cookies.set('acsys_refreshToken', refreshToken);
          resolve(true);
        }
      })
      .catch((response) => {
        resolve(false);
      });
  });
};

export const isStateless = async () => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/isStateless', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        resolve(json);
      })
      .catch((error) => {
        resolve(false);
      });
  });
};

export const isConnected = () => {
  return new Promise((resolve, reject) => {
    promFetch('/api/isConnected')
      .then((response) => response.json())
      .then((json) => {
        resolve(json);
      })
      .catch((error) => {
        resolve(false);
      });
  });
};

export const getDatabaseType = async () => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/getDatabaseType', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        resolve(false);
      });
  });
};

export const isStorageConnected = async () => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/loadStorageConfig', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((json) => {
        resolve(json.value);
      })
      .catch((error) => reject(false));
  });
};

export const hasAdmin = () => {
  return new Promise((resolve, reject) => {
    promFetch('/api/hasAdmin', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((json) => {
        resolve(json.value);
      })
      .catch((error) => reject(false));
  });
};

export const getDefaultUsername = async () => {
  return new Promise((resolve, reject) => {
    promFetch('/api/getDefaultUsername', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        resolve(false);
      });
  });
};

export const getDefaultPassword = async () => {
  return new Promise((resolve, reject) => {
    promFetch('/api/getDefaultPassword', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        resolve(false);
      });
  });
};

export const verifyPassword = async (acsys_id, password) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/verifyPassword', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({ acsys_id, password }),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json.value);
          });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(reject);
  });
};

export const getTableData = async () => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/getTableData', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        resolve([]);
      });
  });
};

export const getTables = async () => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/getTables', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const getTableSize = async (table) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch(`/api/getTableSize?table=${table}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json.value);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const increment = async (table, field, start, num) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/increment', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        table,
        field,
        start,
        num,
      }),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          resolve(response);
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(reject);
  });
};

export const repositionViews = async (entry, oldPosition, position) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/repositionViews', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        entry,
        oldPosition,
        position,
      }),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          resolve(response);
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(reject);
  });
};

export const createTable = async (table, entry) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/createTable', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        table,
        entry,
      }),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json);
          });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(reject);
  });
};

export const dropTable = async (table) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/dropTable', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        table,
      }),
    })
      .then((response) => {
        if (response.statusText === 'Unauthorized') {
          Session.logOut();
          reject();
        } else {
          resolve(response);
        }
      })
      .catch(reject);
  });
};

export const getData = async (table, where, limit, order_by, order) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    const apiString = `/api/readData?table=${table}&options=${JSON.stringify({
      where,
      limit,
      order_by,
      order,
    })}`;
    promFetch(apiString, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        resolve([]);
      });
  });
};

export const getPage = async (
  table,
  where,
  limit,
  order_by,
  order,
  direction,
  currentPage
) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    const apiString = `/api/readPage?table=${table}&options=${JSON.stringify({
      where,
      limit,
      order_by,
      order,
      direction,
      currentPage,
    })}`;
    promFetch(apiString, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const insertData = async (table, entry) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/insertData', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        table,
        entry,
      }),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json);
          });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(reject);
  });
};

export const updateData = async (table, entry, where) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/updateData', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        table,
        entry,
        keys: where,
      }),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          resolve(response);
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(reject);
  });
};

export const deleteData = async (table, entry) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/deleteData', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        table,
        entry,
      }),
    })
      .then((response) => {
        if (response.statusText === 'Unauthorized') {
          Session.logOut();
          reject();
        } else {
          resolve(response);
        }
      })
      .catch(reject);
  });
};

export const getOpenData = (table, where, limit, order_by, order) => {
  return new Promise((resolve, reject) => {
    const apiString = `/api/readOpenData?table=${table}&options=${JSON.stringify(
      {
        where,
        limit,
        order_by,
        order,
      }
    )}`;
    promFetch(apiString, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const insertOpenData = (table, entry) => {
  return new Promise((resolve, reject) => {
    promFetch('/api/insertOpenData', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table,
        entry,
      }),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json);
          });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(reject);
  });
};

export const updateOpenData = (table, entry, where) => {
  return new Promise((resolve, reject) => {
    promFetch('/api/updateOpenData', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table,
        entry,
        keys: where,
      }),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          resolve(response);
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(reject);
  });
};

export const deleteOpenData = (table, entry) => {
  return new Promise((resolve, reject) => {
    promFetch('/api/deleteOpenData', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        table,
        entry,
      }),
    })
      .then((response) => {
        if (response.statusText === 'Unauthorized') {
          Session.logOut();
          reject();
        } else {
          resolve(response);
        }
      })
      .catch(reject);
  });
};

export const deleteView = async (view_id) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/deleteView', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        view_id,
      }),
    })
      .then((response) => {
        if (response.statusText === 'Unauthorized') {
          Session.logOut();
          reject();
        } else {
          resolve(response);
        }
      })
      .catch(reject);
  });
};

export const unlockTable = async (table_name) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/unlockTable', {
      method: 'Post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        table_name,
      }),
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const lockTable = async (table_name) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/lockTable', {
      method: 'Post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        table_name,
      }),
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const getCurrentBucket = async () => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/getCurrentBucket', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        resolve(false);
      });
  });
};

export const setStorageBucket = async (config) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/setStorageBucket', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify(config),
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json.value);
          });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(reject);
  });
};

export const getStorageBuckets = async () => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/getStorageBuckets', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then((response) => response.json())
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        resolve(false);
      });
  });
};

export const syncFiles = async () => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/syncFiles', {
      method: 'Post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const createNewFolder = async (folder, parent) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    if (parent.length > 1) {
      parent = parent.substring(1);
    } else {
      parent = '';
    }
    promFetch('/api/createNewFolder', {
      method: 'Post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        folder: `${folder}/`,
        parent,
      }),
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const uploadFile = async (data, destination) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    if (destination !== '/') {
      formData.append('destination', destination.substring(1));
    } else {
      formData.append('destination', '');
    }
    formData.append('file', data);
    promFetch('/api/uploadFile', {
      headers: {
        Authorization: `Bearer ${Session.getToken()}`,
      },
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        if (response.statusText !== 'Unauthorized') {
          response.json().then((json) => {
            resolve(json.value);
          });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch((error) => {
        console.error(error);
      });
  });
};

export const getStorageURL = async (url) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch(`/api/getStorageURL?url=${url}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json.data);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const makeFilePublic = async (fileName) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/makeFilePublic', {
      method: 'Post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        fileName,
      }),
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const makeFilePrivate = async (fileName) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/makeFilePrivate', {
      method: 'Post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        fileName,
      }),
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

export const deleteFile = async (fileName) => {
  await checkToken();
  return new Promise((resolve, reject) => {
    promFetch('/api/deleteFile', {
      method: 'Post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Session.getToken()}`,
      },
      body: JSON.stringify({
        fileName,
      }),
    })
      .then(async (response) => {
        if (response.statusText !== 'Unauthorized') {
          response
            .json()
            .then((json) => {
              resolve(json);
            })
            .catch(() => {
              reject();
            });
        } else {
          Session.logOut();
          reject();
        }
      })
      .catch(() => {
        reject();
      });
  });
};

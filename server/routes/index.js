const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const Config = require('../config/config.js');
const DataDriver = require('../db.js');
const StorageDriver = require('../storage.js');

const router = express.Router();

const configKey = require('../config/config.json');

const config = new Config();
config.initialize();

let data;
data = new DataDriver();

let storage;
storage = new StorageDriver();

data.initialize();
storage.initialize(data);

express().use(express.static('./config'));

router.get('/isConnected', function (req, res) {
  if (data.isConnected()) {
    res.send(true);
  } else {
    res.send(false);
  }
});

router.get('/hasAdmin', function (req, res) {
  const options = {
    where: [['role', '=', 'Administrator']],
    limit: parseInt(1),
  };

  data
    .getDocs('prmths_users', options)
    .then((result, reject) => {
      if (result.length > 0) {
        res.send((rData = { value: true }));
      } else {
        res.send((rData = { value: false }));
      }
    })
    .catch(() => {
      res.send((rData = { value: false }));
    });
});

router.post('/register', function (req, res) {
  const userData = req.body.data;
  const options = {
    where: [['role', '=', 'Administrator']],
    limit: parseInt(1),
  };

  data
    .getDocs('prmths_users', options)
    .then((result, reject) => {
      if (result.length > 0) {
        res.json({ message: 'Action not available.' });
      } else {
        try {
          if (result.details.length > 0) {
            res.json({ message: result.details });
          }
        } catch (error) {}
        bcrypt.hash(userData.password, 8, function (err, hash) {
          const dataModel = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            role: userData.role,
            mode: userData.mode,
            prmthsCd: hash,
          };
          data
            .insert('prmths_users', dataModel)
            .then((action) => {
              const token = jwt.sign({ sub: hash }, configKey.secret, {
                expiresIn: '1d',
              });
              const refreshToken = jwt.sign({ sub: hash }, configKey.secret, {
                expiresIn: '3d',
              });
              res.json({
                id: dataModel.id,
                role: dataModel.role,
                username: dataModel.username,
                token,
                refreshToken,
              });
            })
            .catch((action) => {
              res.send(action);
            });
        });
      }
    })
    .catch((error) => {
      console.log(error);
      res.send((rData = { value: false }));
    });
});

router.post('/verifyPassword', function (req, res) {
  data.verifyPassword(req.body.id).then((result) => {
    bcrypt.compare(req.body.password, result, function (err, outcome) {
      if (outcome) {
        res.send({ value: true });
      } else {
        res.send({ value: false });
      }
    });
  });
});

router.post('/createUser', function (req, res) {
  const userData = req.body.data;
  const options = {
    where: [['email', '=', userData.email]],
    limit: parseInt(1),
  };

  data
    .getDocs('prmths_users', options)
    .then((result, reject) => {
      if (result.length > 0) {
        res.json({ message: 'Email already in use.' });
      } else {
        const options = {
          where: [['username', '=', userData.username]],
          limit: parseInt(1),
        };

        data
          .getDocs('prmths_users', options)
          .then((result, reject) => {
            if (result.length > 0) {
              res.json({
                message: 'Username already in use.',
              });
            } else {
              bcrypt.hash(userData.password, 8, function (err, hash) {
                const dataModel = {
                  id: userData.id,
                  username: userData.username,
                  email: userData.email,
                  mode: userData.mode,
                  role: userData.role,
                  prmthsCd: hash,
                };
                data
                  .insert('prmths_users', dataModel)
                  .then((result) => {
                    res.send(true);
                  })
                  .catch((result) => {
                    res.send(result);
                  });
              });
            }
          })
          .catch(() => {
            res.send((rData = { value: false }));
          });
      }
    })
    .catch(() => {
      res.send((rData = { value: false }));
    });
});

router.post('/updateUser', function (req, res) {
  const userData = req.body.data;
  bcrypt.hash(userData.prmthsCd, 8, function (err, hash) {
    let dataModel;
    if (userData.prmthsCd === undefined) {
      dataModel = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        mode: userData.mode,
      };
    } else {
      dataModel = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        mode: userData.mode,
        prmthsCd: hash,
      };
    }
    data
      .update('prmths_users', dataModel, [['id', '=', dataModel.id]])
      .then((result) => {
        res.json({ result });
      })
      .catch((result) => {
        res.send(result);
      });
  });
});

router.post('/authenticate', function (req, res) {
  const cUsername = req.body.username.username;
  const cPassword = `${req.body.password.password}`;

  const options = {
    where: [['username', '=', cUsername]],
  };
  data
    .getDocs('prmths_users', options)
    .then((result) => {
      bcrypt.compare(cPassword, result[0].prmthsCd, function (err, outcome) {
        if (outcome) {
          const token = jwt.sign(
            { sub: result[0].prmthsCd },
            configKey.secret,
            {
              expiresIn: '1d',
            }
          );
          const refreshToken = jwt.sign(
            { sub: result[0].prmthsCd },
            configKey.secret,
            {
              expiresIn: '3d',
            }
          );
          res.json({
            id: result[0].id,
            role: result[0].role,
            mode: result[0].mode,
            username: result[0].username,
            email: result[0].email,
            token,
            refreshToken,
          });
        } else {
          res.status(400).json({
            message: 'Username or password is incorrect.',
          });
        }
      });
    })
    .catch((result) => {
      res.status(400).json({
        message: 'Username or password is incorrect.',
      });
    });
});

router.post('/refresh', function (req, res) {
  const token = jwt.sign({ sub: configKey.secret }, configKey.secret, {
    expiresIn: '1d',
  });
  const refreshToken = jwt.sign({ sub: configKey.secret }, configKey.secret, {
    expiresIn: '3d',
  });
  res.json({ token, refreshToken });
});

router.get('/getProjectName', function (req, res) {
  data
    .getProjectName()
    .then((result) => {
      res.send((rData = { value: result }));
    })
    .catch(() => {
      res.send((rData = { value: false }));
    });
});

router.get('/getAll', function (req, res) {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch((err) => next(err));
});

router.get('/getUsers', function (req, res) {
  data.getUsers(req.query.user).then((result, reject) => {
    res.send(result);
  });
});

router.post('/increment', function (req, res) {
  incrementData = req.body;
  data
    .increment(
      incrementData.table,
      incrementData.field,
      incrementData.start,
      incrementData.num
    )
    .then((result) => {
      res.send(result);
    });
});

router.post('/repositionViews', function (req, res) {
  repoData = req.body;
  data.repositionViews(repoData.entry, repoData.position).then((result) => {
    res.send(result);
  });
});

router.post('/createTable', function (req, res) {
  insertData = req.body;
  data.createTable(insertData.table, insertData.entry).then((result) => {
    res.send(result);
  });
});

router.post('/dropTable', function (req, res) {
  tableData = req.body;
  data.deleteDocs(tableData.table).then((result) => {
    res.send(result);
  });
});

router.get('/readData', function (req, res) {
  const options = JSON.parse(req.query.options);
  data.getDocs(req.query.table, options).then((result, reject) => {
    res.send(result);
  });
});

router.get('/readPage', function (req, res) {
  data.getPage(req.query.table, req.query.options).then((result, reject) => {
    res.send(result);
  });
});

router.post('/insertData', function (req, res) {
  insertData = req.body;
  data.insert(insertData.table, insertData.entry).then((result) => {
    res.send(result);
  });
});

router.post('/updateData', function (req, res) {
  updateData = req.body;
  data
    .update(updateData.table, updateData.entry, updateData.keys)
    .then((result) => {
      res.send(result);
    });
});

router.post('/deleteData', function (req, res) {
  deleteData = req.body;
  data.deleteDocs(deleteData.table, deleteData.entry).then((result) => {
    res.send(result);
  });
});

router.get('/readOpenData', function (req, res) {
  const { table } = req.query;
  const options = JSON.parse(req.query.options);
  data
    .checkOpenTable(table)
    .then((result) => {
      if (result) {
        data.getDocs(table, options).then((result, reject) => {
          res.send(result);
        });
      } else {
        res.send(false);
      }
    })
    .catch(() => {
      res.send(false);
    });
});

router.post('/insertOpenData', function (req, res) {
  insertData = req.body;
  data
    .checkOpenTable(insertData.table)
    .then((result) => {
      if (result) {
        data.insert(insertData.table, insertData.entry).then((result) => {
          res.send(result);
        });
      } else {
        res.send(false);
      }
    })
    .catch(() => {
      res.send(false);
    });
});

router.post('/updateOpenData', function (req, res) {
  updateData = req.body;
  data
    .checkOpenTable(updateData.table)
    .then((result) => {
      if (result) {
        data
          .update(updateData.table, updateData.entry, updateData.keys)
          .then((result) => {
            res.send(result);
          });
      } else {
        res.send(false);
      }
    })
    .catch(() => {
      res.send(false);
    });
});

router.post('/deleteOpenData', function (req, res) {
  deleteData = req.body;
  data
    .checkOpenTable(deleteData.table)
    .then((result) => {
      if (result) {
        data.deleteDocs(deleteData.table, deleteData.entry).then((result) => {
          res.send(result);
        });
      } else {
        res.send(false);
      }
    })
    .catch(() => {
      res.send(false);
    });
});

router.post('/deleteView', function (req, res) {
  deleteData = req.body;
  data
    .deleteDocs('prmths_document_details', [
      ['contentId', '=', deleteData.viewId],
    ])
    .then((result) => {
      data
        .deleteDocs('prmths_views', [['id', '=', deleteData.viewId]])
        .then((result) => {
          data
            .deleteDocs('prmths_logical_content', [
              ['viewId', '=', deleteData.viewId],
            ])
            .then((result) => {
              res.send(result);
            });
        });
    });
});

router.get('/getTableData', function (req, res) {
  data.getTableData().then((result) => {
    res.send(result);
  });
});

router.get('/getTables', function (req, res) {
  data.listTables().then((result) => {
    res.send(result);
  });
});

router.get('/getTableSize', function (req, res) {
  data.getTableSize(req.query.table).then((result, reject) => {
    res.send((rData = { value: result }));
  });
});

router.post('/unlockTable', function (req, res) {
  data.unlockTable(req.body).then((result, reject) => {
    res.send(result);
  });
});

router.post('/lockTable', function (req, res) {
  data.lockTable(req.body.table).then((result, reject) => {
    res.send(result);
  });
});

router.post('/syncFiles', function (req, res) {
  storage.syncFiles().then((result, reject) => {
    res.send(result);
  });
});

router.post('/createNewFolder', function (req, res) {
  storage
    .createNewFolder(req.body.folder, req.body.parent)
    .then((result, reject) => {
      res.send(result);
    });
});

router.post('/uploadFile', function (req, res) {
  storage
    .uploadFile(req.files.file, req.body.destination)
    .then((result, reject) => {
      res.send(result);
    });
});

router.get('/getStorageURL', function (req, res) {
  storage.getStorageURL(req.query.url).then((result, reject) => {
    res.send(
      JSON.stringify({
        data: result,
      })
    );
  });
});

router.post('/makeFilePublic', function (req, res) {
  storage.makeFilePublic(req.body.fileName).then((result, reject) => {
    res.send(result);
  });
});

router.post('/makeFilePrivate', function (req, res) {
  storage.makeFilePrivate(req.body.fileName).then((result, reject) => {
    res.send(result);
  });
});

router.post('/deleteFile', function (req, res) {
  storage.deleteFile(req.body.fileName).then((result, reject) => {
    res.send(result);
  });
});

router.post('/restart', function (req, res) {
  console.log(`This is pid ${process.pid}`);
  setTimeout(function () {
    process.on('exit', function () {
      require('child_process').spawn(process.argv.shift(), process.argv, {
        cwd: process.cwd(),
        detached: true,
        stdio: 'inherit',
      });
    });
    process.exit();
  }, 5000);
});

router.post('/setInitialDatabaseConfig', async function (req, res) {
  try {
    if (!data.isConnected()) {
      try {
        await config
          .setConfig(req.body)
          .then(async () => {
            return new Promise((resolve) => setTimeout(resolve, 5000));
          })
          .catch(() => {
            res.send(false);
          });
        await config
          .setStorageConfig(req.body)
          .then(async () => {})
          .catch(() => {
            res.send(false);
          });
        fs.writeFile(
          './prometheus.service.config.json',
          JSON.stringify(req.body).replace(/\\\\/g, '\\'),
          async function (err) {
            if (err) {
              res.send(err);
            } else {
              res.send(true);
            }
          }
        );
      } catch (error) {
        res.send(false);
      }
    } else {
      res.send(false);
    }
  } catch (error) {
    res.send(false);
  }
});

router.get('/loadDatabaseConfig', async function (req, res) {
  await config
    .getConfig()
    .then((result) => {
      if (result.length > 0) {
        res.send(true);
      } else {
        res.send(false);
      }
    })
    .catch(() => {
      res.send(false);
    });
});

router.post('/setDatabaseConfig', async function (req, res) {
  const configData = {
    type: req.body.type,
    project_id: req.body.project_id,
    private_key_id: req.body.private_key_id,
    private_key: req.body.private_key,
    client_email: req.body.client_email,
    client_id: req.body.client_id,
    auth_uri: req.body.auth_uri,
    token_uri: req.body.token_uri,
    auth_provider_x509_cert_url: req.body.auth_provider_x509_cert_url,
    client_x509_cert_url: req.body.client_x509_cert_url,
  };

  try {
    await config
      .setConfig(configData)
      .then(async () => {
        return new Promise((resolve) => setTimeout(resolve, 5000));
      })
      .catch(() => {
        res.send(false);
      });
    await config
      .setStorageConfig(configData)
      .then(async () => {})
      .catch(() => {
        res.send(false);
      });
    fs.writeFile(
      './prometheus.service.config.json',
      JSON.stringify(configData).replace(/\\\\/g, '\\'),
      async function (err) {
        if (err) {
          res.send(err);
        } else {
          res.send(true);
        }
      }
    );
  } catch (error) {
    res.send(false);
  }
});

router.get('/getDatabaseConfig', function (req, res) {
  config
    .getStorageType()
    .then((conf) => {
      try {
        fs.readFile('./prometheus.service.config.json', function (err, result) {
          if (err) {
            res.send((rData = { value: false }));
          } else {
            res.send(result);
          }
        });
      } catch (error) {
        res.send((rData = { value: false }));
      }
    })
    .catch(() => {
      res.send((rData = { value: false }));
    });
});

router.get('/loadStorageConfig', async function (req, res) {
  console.log(await config.getStorageType());
  if ((await config.getStorageType()) === 'gcp') {
    try {
      fs.readFile('./prometheus.service.config.json', function (
        err,
        dataConfig
      ) {
        if (err) {
          res.send((rData = { value: false }));
        } else {
          storage
            .initialize(data)
            .then((result) => {
              res.send((rData = { value: true }));
            })
            .catch((result) => {
              res.send((rData = { value: false }));
            });
        }
      });
    } catch (error) {
      res.send((rData = { value: false }));
    }
  } else {
    res.send((rData = { value: false }));
  }
});

module.exports = router;

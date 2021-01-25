const express = require('express');
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const uniquid = require('uniqid');
const nodemailer = require('nodemailer');
const path = require('path');
const Config = require('../config/config');
const SqliteDriver = require('../data-drivers/sqlitedb');
const FirestoreDriver = require('../data-drivers/firestoredb');
const MysqlDriver = require('../data-drivers/mysqldb');
const StorageDriver = require('../storage-drivers/gcpstorage');
const StatelessStorageDriver = require('../storage-drivers/gcpstorageStateless');
const LocalStorage = require('../storage-drivers/localstorage');

const router = express.Router();

const config = new Config();

let data;
let storage;

function removeDir(path) {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path);

    files.forEach(function (filename) {
      if (fs.statSync(path + '/' + filename).isDirectory()) {
        removeDir(path + '/' + filename);
      } else {
        fs.unlinkSync(path + '/' + filename);
      }
    });
    fs.rmdirSync(path);
  } else {
    console.log('Directory path not found.');
  }
}

async function initialize() {
  await config.initialize();

  const dbType = await config.getDatabaseType();

  if (process.env.DATABASE_TYPE === undefined) {
    if (dbType === 'firestore') {
      data = new FirestoreDriver();
      storage = new StorageDriver();
    } else if (dbType === 'mysql') {
      data = new MysqlDriver();
      storage = new StorageDriver();
    } else if (dbType === 'local') {
      data = new SqliteDriver();
      storage = new LocalStorage();
    }
    await data.initialize(config);
    await storage.initialize(config, data);
  } else {
    storage = new StatelessStorageDriver();
    if (dbType === 'firestore') {
      data = new FirestoreDriver();
      await data.initialize(config);
      await storage.initialize(
        config,
        data,
        data.getBucketName(),
        data.getBucket()
      );
    } else if (dbType === 'mysql') {
      const fdata = new FirestoreDriver();
      data = new MysqlDriver();
      await fdata.initialize(config);
      await data.initialize(config);
      await storage.initialize(
        config,
        data,
        fdata.getBucketName(),
        fdata.getBucket()
      );
    }
  }
}

initialize();

express().use(express.static('./config'));

router.get('/isStateless', function (req, res) {
  if (process.env.DATABASE_TYPE === undefined) {
    res.send(false);
  } else {
    res.send(true);
  }
});

router.get('/isConnected', function (req, res) {
  if (data.isConnected()) {
    res.send(true);
  } else {
    res.send(false);
  }
});

router.get('/getDatabaseType', async function (req, res) {
  const type = await config.getDatabaseType();
  res.json(type);
});

router.get('/hasAdmin', function (req, res) {
  const options = {
    where: [['role', '=', 'Administrator']],
    limit: parseInt(1),
  };

  data
    .getDocs('acsys_users', options)
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
    .getDocs('acsys_users', options)
    .then((result, reject) => {
      if (result.length > 0) {
        res.json({ message: 'Action not available.' });
      } else {
        try {
          if (result.details.length > 0) {
            res.json({
              message:
                'Please make sure that Cloud Firestore database exists for this project.',
            });
          }
        } catch (error) {}
        bcrypt.hash(userData.password, 8, function (err, hash) {
          const dataModel = {
            acsys_id: userData.acsys_id,
            email: userData.email,
            username: userData.username,
            role: userData.role,
            mode: userData.mode,
            acsys_cd: hash,
          };
          data
            .insert('acsys_users', dataModel)
            .then(async (action) => {
              const token = jwt.sign({ sub: hash }, await config.getSecret(), {
                expiresIn: '1d',
              });
              const refreshToken = jwt.sign(
                { sub: hash },
                await config.getSecret(),
                {
                  expiresIn: '3d',
                }
              );
              res.json({
                acsys_id: dataModel.acsys_id,
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

router.get('/getDefaultUsername', async function (req, res) {
  if (process.env.DEFAULT_USERNAME === undefined) {
    res.json('');
  } else {
    res.json(process.env.DEFAULT_USERNAME);
  }
});

router.get('/getDefaultPassword', async function (req, res) {
  if (process.env.DEFAULT_PASSWORD === undefined) {
    res.json('');
  } else {
    res.json(process.env.DEFAULT_PASSWORD);
  }
});

router.post('/verifyPassword', function (req, res) {
  data.verifyPassword(req.body.acsys_id).then((result) => {
    bcrypt.compare(req.body.password, result, function (err, outcome) {
      if (outcome) {
        res.send({ value: true });
      } else {
        res.send({ value: false });
      }
    });
  });
});

router.post('/sendResetLink', function (req, res) {
  data
    .getDocs('acsys_email_settings', {})
    .then((emailSettings) => {
      const { email } = req.body;
      const options = {
        where: [['email', '=', email]],
        limit: parseInt(1),
      };
      data
        .getDocs('acsys_users', options)
        .then((result, reject) => {
          if (result.length > 0) {
            const resetOptions = {
              where: [['user_id', '=', result[0].acsys_id]],
              limit: parseInt(1),
            };
            data
              .getDocs('acsys_user_reset', resetOptions)
              .then((userResult, reject) => {
                if (userResult.length > 0) {
                  const date = new Date();
                  if (date.getTime() < userResult[0].expiration_date) {
                    res.send({ message: 'Email has been sent.' });
                  } else {
                    const expDate = date.getTime() + 5 * 60000;
                    const dataModel = {
                      acsys_id: uniquid(),
                      user_id: result[0].acsys_id,
                      expiration_date: expDate,
                    };
                    data
                      .update('acsys_user_reset', dataModel)
                      .then((action) => {
                        const transporter = nodemailer.createTransport({
                          host: emailSettings[0].host,
                          port: emailSettings[0].port,
                          auth: {
                            user: emailSettings[0].username,
                            pass: emailSettings[0].password,
                          },
                        });

                        const message = {
                          to: email,
                          subject: 'Credential update',
                          html: `<p>Please follow the below link to reset your password.</p><a href="${req.get(
                            'host'
                          )}/PasswordReset/${
                            dataModel.acsys_id
                          }">reset password</a><p>This link will expire in 5 minutes.</p>`,
                        };

                        transporter
                          .sendMail(message)
                          .then((info) => {
                            res.send({ message: 'Email has been sent.' });
                          })
                          .catch((error) => {
                            res.send({ message: 'Error sending email.' });
                          });
                      })
                      .catch((action) => {
                        res.send({ message: 'Error.' });
                      });
                  }
                } else {
                  const date = new Date();
                  const expDate = date.getTime() + 5 * 60000;
                  const dataModel = {
                    acsys_id: uniquid(),
                    user_id: result[0].acsys_id,
                    expiration_date: expDate,
                  };
                  data
                    .insert('acsys_user_reset', dataModel)
                    .then((action) => {
                      const transporter = nodemailer.createTransport({
                        host: emailSettings[0].host,
                        port: emailSettings[0].port,
                        auth: {
                          user: emailSettings[0].username,
                          pass: emailSettings[0].password,
                        },
                      });

                      const message = {
                        to: email,
                        subject: 'Credential update',
                        html: `<p>Please follow the below link to reset your password.</p><a href="${req.get(
                          'host'
                        )}/PasswordReset/${
                          dataModel.acsys_id
                        }">reset password</a><p>This link will expire in 5 minutes.</p>`,
                      };

                      transporter
                        .sendMail(message)
                        .then((info) => {
                          res.send({ message: 'Email has been sent.' });
                        })
                        .catch((error) => {
                          res.send({ message: 'Error sending email.' });
                        });
                    })
                    .catch((action) => {
                      res.send({ message: 'Error.' });
                    });
                }
              })
              .catch(() => {
                res.send({ message: 'Email not found.' });
              });
          } else {
            res.send({ message: 'Email not found.' });
          }
        })
        .catch((error) => {});
    })
    .catch(() => {
      res.send({ message: 'Email server is not configured' });
    });
});

router.post('/resetPassword', function (req, res) {
  const { acsys_id, password } = req.body;
  const options = {
    where: [['acsys_id', '=', acsys_id]],
    limit: parseInt(1),
  };
  data
    .getDocs('acsys_user_reset', options)
    .then((result, reject) => {
      if (result.length > 0) {
        const date = new Date();
        if (date.getTime() < result[0].expiration_date) {
          const userOptions = {
            where: [['acsys_id', '=', result[0].user_id]],
            limit: parseInt(1),
          };
          data
            .getDocs('acsys_users', userOptions)
            .then((userResult, reject) => {
              bcrypt.hash(password, 8, function (err, hash) {
                const dataModel = {
                  acsys_id: userResult[0].acsys_id,
                  role: userResult[0].role,
                  mode: userResult[0].mode,
                  email: userResult[0].email,
                  username: userResult[0].username,
                  acsys_cd: hash,
                };
                data
                  .update('acsys_users', dataModel)
                  .then((action) => {
                    data
                      .deleteDocs('acsys_user_reset', result)
                      .then((deleteResult) => {
                        res.send({ message: 'Password has been reset.' });
                      })
                      .catch((error) => {
                        res.send({ message: 'Password has been reset.' });
                      });
                  })
                  .catch((action) => {
                    res.send({ message: 'Error.' });
                  });
              });
            })
            .catch((error) => {
              res.send({ message: 'Error.' });
            });
        } else {
          res.send({ message: 'Error.' });
        }
      } else {
        res.send({ message: 'Error.' });
      }
    })
    .catch(() => {
      res.send({ message: 'Error.' });
    });
});

router.post('/createUser', function (req, res) {
  const userData = req.body.data;
  const options = {
    where: [['email', '=', userData.email]],
    limit: parseInt(1),
  };

  data
    .getDocs('acsys_users', options)
    .then((result, reject) => {
      if (result.length > 0) {
        res.json({ message: 'Email already in use.' });
      } else {
        const options = {
          where: [['username', '=', userData.username]],
          limit: parseInt(1),
        };

        data
          .getDocs('acsys_users', options)
          .then((result, reject) => {
            if (result.length > 0) {
              res.json({
                message: 'Username already in use.',
              });
            } else {
              bcrypt.hash(userData.password, 8, function (err, hash) {
                const dataModel = {
                  acsys_id: userData.acsys_id,
                  email: userData.email,
                  username: userData.username,
                  role: userData.role,
                  mode: userData.mode,
                  acsys_cd: hash,
                };
                data
                  .insert('acsys_users', dataModel)
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
  bcrypt.hash(userData.acsys_cd, 8, function (err, hash) {
    let dataModel;
    if (userData.acsys_cd === undefined) {
      dataModel = {
        acsys_id: userData.acsys_id,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        mode: userData.mode,
      };
    } else {
      dataModel = {
        acsys_id: userData.acsys_id,
        email: userData.email,
        username: userData.username,
        role: userData.role,
        mode: userData.mode,
        acsys_cd: hash,
      };
    }
    data
      .update('acsys_users', dataModel, [['acsys_id', '=', dataModel.acsys_id]])
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
    .getDocs('acsys_users', options)
    .then((result) => {
      bcrypt.compare(
        cPassword,
        result[0].acsys_cd,
        async function (err, outcome) {
          if (outcome) {
            const token = jwt.sign(
              { sub: result[0].acsys_cd },
              await config.getSecret(),
              {
                expiresIn: '1d',
              }
            );
            const refreshToken = jwt.sign(
              { sub: result[0].acsys_cd },
              await config.getSecret(),
              {
                expiresIn: '3d',
              }
            );
            res.json({
              acsys_id: result[0].acsys_id,
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
        }
      );
    })
    .catch((result) => {
      res.status(400).json({
        message: 'Username or password is incorrect.',
      });
    });
});

router.post('/refresh', async function (req, res) {
  const token = jwt.sign(
    { sub: await config.getSecret() },
    await config.getSecret(),
    {
      expiresIn: '1d',
    }
  );
  const refreshToken = jwt.sign(
    { sub: await config.getSecret() },
    await config.getSecret(),
    {
      expiresIn: '3d',
    }
  );
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

router.get('/getOpenPageUrl', function (req, res) {
  const url =
    req.protocol +
    '://' +
    req.get('host') +
    '/api/readOpenPage?table=' +
    req.query.table +
    '&options=' +
    req.query.options;
  res.send((rdata = { url: url }));
});

router.get('/getOpenUrl', function (req, res) {
  const url =
    req.protocol +
    '://' +
    req.get('host') +
    '/api/readOpenData?table=' +
    req.query.table +
    '&options=' +
    req.query.options;
  res.send((rdata = { url: url }));
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
  data
    .repositionViews(repoData.entry, repoData.oldPosition, repoData.position)
    .then((result) => {
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
  deleteData = req.body;
  data.dropTable(deleteData.table).then((result) => {
    data
      .dropTable('acsys_' + deleteData.table)
      .then(() => {
        res.send(result);
      })
      .catch(() => {
        res.send(result);
      });
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
        res.send('Error: Table must be unlocked before it can be accessed.');
      }
    })
    .catch(() => {
      res.send(false);
    });
});

router.get('/readOpenPage', function (req, res) {
  const { table } = req.query;
  data
    .checkOpenTable(table)
    .then((result) => {
      if (result) {
        data
          .getPage(req.query.table, req.query.options)
          .then((result, reject) => {
            res.send(result);
          });
      } else {
        res.send('Error: Table must be unlocked before it can be accessed.');
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
        res.send('Error: Table must be unlocked before it can be accessed.');
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
        res.send('Error: Table must be unlocked before it can be accessed.');
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
        res.send('Error: Table must be unlocked before it can be accessed.');
      }
    })
    .catch(() => {
      res.send(false);
    });
});

router.post('/deleteView', function (req, res) {
  deleteData = req.body;
  data
    .deleteDocs('acsys_document_details', [
      ['content_id', '=', deleteData.view_id],
    ])
    .then((result) => {
      data
        .deleteDocs('acsys_views', [['acsys_id', '=', deleteData.view_id]])
        .then((result2) => {
          data
            .deleteDocs('acsys_logical_content', [
              ['viewId', '=', deleteData.view_id],
            ])
            .then((result3) => {
              data.reorgViews().then((result4) => {
                res.send(result4);
              });
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
  data.lockTable(req.body.table_name).then((result, reject) => {
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
  storage.getStorageURL(req).then((result, reject) => {
    res.send(
      JSON.stringify({
        data: result,
      })
    );
  });
});

router.get('/getFile', async function (req, res) {
  const file = path.resolve('files/' + req.query.file);
  if (req.query.token !== undefined) {
    const token = req.query.token;
    try {
      const decoded = jwt.verify(token, await config.getSecret());
      if (decoded) {
        const today = parseInt(new Date().getTime().toString().substr(0, 10));
        const difference = decoded.exp - today;
        if (difference <= 0) {
          res.send('Link has expired.');
        }
        res.sendFile(file);
      } else {
        res.send('File could not be retrieved.');
      }
    } catch (error) {
      res.send('File could not be retrieved.');
    }
  } else {
    res.sendFile(file);
  }
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

router.post('/setInitialLocalDatabaseConfig', async function (req, res) {
  try {
    const { projectName } = req.body;
    await config.format();
    await config.initialize();
    fs.unlink('./acsys.service.config.json', function (err) {});
    removeDir('./files');
    data = new SqliteDriver();
    storage = new LocalStorage();
    await config
      .setConfig('local', projectName)
      .then(async () => {
        await data.initialize(config);
      })
      .catch(() => {
        res.send(false);
      });
    await config
      .setStorageConfig('local')
      .then(async () => {
        storage.initialize(config, data);
      })
      .catch(() => {
        res.send(false);
      });
    res.send(true);
  } catch (error) {
    res.send(false);
  }
});

router.post('/setLocalDatabaseConfig', async function (req, res) {
  try {
    const { projectName } = req.body;
    await config.format();
    await config.initialize();
    fs.unlink('./acsys.service.config.json', function (err) {});
    removeDir('./files');
    data = new SqliteDriver();
    storage = new LocalStorage();
    await config
      .setConfig('local', projectName)
      .then(async () => {
        await data.initialize(config);
      })
      .catch(() => {
        res.send(false);
      });
    await config
      .setStorageConfig('local')
      .then(async () => {
        storage.initialize(config, data);
      })
      .catch(() => {
        res.send(false);
      });
    res.send(true);
  } catch (error) {
    res.send(false);
  }
});

router.post('/setInitialFirestoreConfig', async function (req, res) {
  try {
    await config.format();
    await config.initialize();
    fs.unlink('./acsys.service.config.json', function (err) {});
    removeDir('./files');
    data = new FirestoreDriver();
    storage = new StorageDriver();
    await config
      .setConfig('firestore', 'firestore')
      .then(async () => {
        return new Promise((resolve) => setTimeout(resolve, 5000));
      })
      .catch(() => {
        res.send(false);
      });
    await config
      .setStorageConfig('gcp')
      .then(async () => {})
      .catch(() => {
        res.send(false);
      });
    fs.writeFile(
      './acsys.service.config.json',
      JSON.stringify(req.body).replace(/\\\\/g, '\\'),
      async function (err) {
        if (err) {
          res.send(err);
        } else {
          data.initialize(config);
          storage.initialize(config, data);
          res.send(true);
        }
      }
    );
  } catch (error) {
    res.send(false);
  }
});

router.post('/setFirestoreConfig', async function (req, res) {
  try {
    await config.format();
    await config.initialize();
    fs.unlink('./acsys.service.config.json', function (err) {});
    removeDir('./files');
    data = new FirestoreDriver();
    storage = new StorageDriver();
    await config
      .setConfig('firestore', 'firestore')
      .then(async () => {
        return new Promise((resolve) => setTimeout(resolve, 5000));
      })
      .catch(() => {
        res.send(false);
      });
    await config
      .setStorageConfig('gcp')
      .then(async () => {})
      .catch(() => {
        res.send(false);
      });
    fs.writeFile(
      './acsys.service.config.json',
      JSON.stringify(req.body).replace(/\\\\/g, '\\'),
      async function (err) {
        if (err) {
          res.send(err);
        } else {
          data.initialize(config);
          storage.initialize(config, data);
          res.send(true);
        }
      }
    );
  } catch (error) {
    res.send(false);
  }
});

router.post('/setInitialMysqlConfig', async function (req, res) {
  try {
    await config.format();
    await config.initialize();
    fs.unlink('./acsys.service.config.json', function (err) {});
    removeDir('./files');
    data = new MysqlDriver();
    storage = new StorageDriver();
    const mysqlConfig = {
      host: req.body.host,
      port: req.body.port,
      database: req.body.database,
      username: req.body.username,
      password: req.body.password,
      socketPath: req.body.socketPath,
    };
    await config
      .setConfig('mysql', 'mysql')
      .then(async () => {
        return new Promise((resolve) => setTimeout(resolve, 3000));
      })
      .catch(() => {
        res.send(false);
      });
    await config
      .setMysqlConfig(mysqlConfig)
      .then(async () => {
        return new Promise((resolve) => setTimeout(resolve, 2000));
      })
      .catch(() => {
        res.send(false);
      });
    await config
      .setStorageConfig('gcp')
      .then(async () => {})
      .catch(() => {
        res.send(false);
      });
    req.files.file.mv('./acsys.service.config.json', async function (err) {
      if (err) {
        res.send(err);
      } else {
        data.initialize(config);
        storage.initialize(config, data);
        res.send(true);
      }
    });
  } catch (error) {
    res.send(false);
  }
});

router.post('/setMysqlConfig', async function (req, res) {
  try {
    await config.format();
    await config.initialize();
    fs.unlink('./acsys.service.config.json', function (err) {});
    removeDir('./files');
    data = new MysqlDriver();
    storage = new StorageDriver();
    const mysqlConfig = {
      host: req.body.host,
      port: req.body.port,
      database: req.body.database,
      username: req.body.username,
      password: req.body.password,
      socketPath: req.body.socketPath,
    };
    await config
      .setConfig('mysql', 'mysql')
      .then(async () => {
        return new Promise((resolve) => setTimeout(resolve, 3000));
      })
      .catch(() => {
        res.send(false);
      });
    await config
      .setMysqlConfig(mysqlConfig)
      .then(async () => {
        return new Promise((resolve) => setTimeout(resolve, 2000));
      })
      .catch(() => {
        res.send(false);
      });
    await config
      .setStorageConfig('gcp')
      .then(async () => {})
      .catch(() => {
        res.send(false);
      });
    req.files.file.mv('./acsys.service.config.json', async function (err) {
      if (err) {
        res.send(err);
      } else {
        data.initialize(config);
        storage.initialize(config, data);
        res.send(true);
      }
    });
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

router.get('/getDatabaseConfig', async function (req, res) {
  const type = await config.getDatabaseType();
  if (type === 'local') {
    await config
      .getConfig()
      .then((result) => {
        res.send((rData = { project_name: result }));
      })
      .catch(() => {
        res.send((rData = { value: false }));
      });
  } else if (type === 'firestore') {
    try {
      fs.readFile('./acsys.service.config.json', function (err, result) {
        if (err) {
          res.send((rData = { value: false }));
        } else {
          res.send(result);
        }
      });
    } catch (error) {
      res.send((rData = { value: false }));
    }
  } else if (type === 'mysql') {
    try {
      fs.readFile('./acsys.service.config.json', async function (err, result) {
        if (err) {
          res.send((rData = { value: false }));
        } else {
          await config
            .getMysqlConfig()
            .then((dataConfig) => {
              const storageObject = JSON.parse(result);
              const response = Object.assign(dataConfig, storageObject);
              res.send(response);
            })
            .catch(() => {
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

router.get('/loadStorageConfig', async function (req, res) {
  if (process.env.DATABASE_TYPE === undefined) {
    const type = await config.getStorageType();
    if (type === 'gcp') {
      try {
        fs.readFile('./acsys.service.config.json', function (err, dataConfig) {
          if (err) {
            res.send((rData = { value: false }));
          } else {
            storage
              .initialize(config, data)
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
    } else if (type === 'local') {
      res.send((rData = { value: true }));
    } else {
      res.send((rData = { value: false }));
    }
  } else {
    res.send((rData = { value: true }));
  }
});

router.get('/getCurrentBucket', async function (req, res) {
  const bucket = await storage.getCurrentBucket();
  res.json(bucket);
});

router.post('/setStorageBucket', async function (req, res) {
  const bucket = req.body.bucket;
  data.deleteDocs('acsys_storage_settings').then(() => {
    const configData = {
      bucket: bucket,
    };
    data.insert('acsys_storage_settings', configData).then(() => {
      storage.setBucket(bucket).then(() => {
        storage.syncFiles().then((result, reject) => {
          res.send(result);
        });
      });
    });
  });
  res.send(false);
});

router.get('/getStorageBuckets', async function (req, res) {
  const buckets = await storage.getBuckets();
  res.json(buckets);
});

router.post('/setEmailConfig', async function (req, res) {
  try {
    const configData = {
      host: req.body.host,
      port: req.body.port,
      username: req.body.username,
      password: req.body.password,
    };

    data
      .getDocs('acsys_email_settings', {})
      .then((result, reject) => {
        if (result.length > 0) {
          data
            .update('acsys_email_settings', configData)
            .then((result) => {
              res.send(true);
            })
            .catch((error) => {
              res.send(false);
            });
        } else {
          data
            .insert('acsys_email_settings', configData)
            .then((result) => {
              res.send(true);
            })
            .catch((error) => {
              res.send(false);
            });
        }
      })
      .catch((error) => {
        res.send(false);
      });
  } catch (error) {
    res.send(false);
  }
});

router.get('/getEmailConfig', async function (req, res) {
  data
    .getDocs('acsys_email_settings', {})
    .then((result, reject) => {
      res.send(result);
    })
    .catch(() => {
      res.send(false);
    });
});

module.exports = router;

const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
let db;

class Config {
  initialize() {
    return new Promise(async (resolve, reject) => {
      if (process.env.DATABASE_TYPE === undefined) {
        db = new sqlite3.Database('./dbase.db', (err) => {
          if (err) {
            console.error(err.message);
          }
          console.log('Connected to the database.');
        });

        db.serialize(async function () {
          await db.run(
            'CREATE TABLE IF NOT EXISTS acsys_configuration (type TEXT, config TEXT)'
          );
          await db.run(
            'CREATE TABLE IF NOT EXISTS acsys_storeconfig (type TEXT, config TEXT)'
          );
          await db.run(
            'CREATE TABLE IF NOT EXISTS acsys_mysql_config (host TEXT, port INT, database TEXT, username TEXT, password TEXT, socketPath TEXT)'
          );
        });
      }
      resolve(true);
    });
  }

  format() {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT NAME FROM SQLITE_MASTER WHERE TYPE = 'table' AND NAME NOT LIKE 'sqlite_%' AND NAME NOT LIKE 'acsys_configuration' AND NAME NOT LIKE 'acsys_storeconfig' AND NAME NOT LIKE 'acsys_mysql_config'`;
      await db.all(query, [], async (error, rows) => {
        if (rows === undefined || error) {
          resolve([]);
        } else {
          for (const row of rows) {
            await db.run(`DROP TABLE IF EXISTS ${row.name}`);
          }
        }
      });
      resolve(true);
    });
  }

  setConfig(databaseType, projectName) {
    return new Promise((resolve, reject) => {
      db.serialize(async function () {
        await db.run('DELETE FROM acsys_configuration');
        let stmt = await db.prepare(
          'INSERT INTO acsys_configuration VALUES (?, ?)'
        );
        stmt.run(databaseType, projectName);
        stmt.finalize();
        resolve(true);
      });
    });
  }

  setMysqlConfig(config) {
    return new Promise((resolve, reject) => {
      db.serialize(async function () {
        await db.run('DELETE FROM acsys_mysql_config');
        let stmt = await db.prepare(
          'INSERT INTO acsys_mysql_config VALUES (?, ?, ?, ?, ?, ?)'
        );
        let port = config.port;
        if (!port) {
          port = 0;
        }
        stmt.run(
          config.host,
          config.port,
          config.database,
          config.username,
          config.password,
          config.socketPath
        );
        stmt.finalize();
        resolve(true);
      });
    });
  }

  getConfig() {
    return new Promise((resolve, reject) => {
      if (process.env.DATABASE_TYPE === undefined) {
        db.serialize(async function () {
          const sql = 'SELECT * FROM acsys_configuration';
          await db.all(sql, [], (err, rows) => {
            if (rows.length > 0) {
              if (rows[0].config.length > 0) {
                resolve(rows[0].config);
              } else {
                resolve(err);
              }
            } else {
              resolve(err);
            }
          });
        });
      } else {
        resolve('default-value');
      }
    });
  }

  getMysqlConfig() {
    return new Promise((resolve, reject) => {
      if (process.env.DATABASE_TYPE === undefined) {
        db.serialize(async function () {
          const sql = 'SELECT * FROM acsys_mysql_config';
          await db.all(sql, [], (err, rows) => {
            if (rows.length > 0) {
              if (rows[0].host.length > 0) {
                const config = {
                  host: rows[0].host,
                  database: rows[0].database,
                  port: rows[0].port,
                  username: rows[0].username,
                  password: rows[0].password,
                  socketPath: rows[0].socketPath,
                };
                resolve(config);
              } else {
                resolve(err);
              }
            } else {
              resolve(err);
            }
          });
        });
      } else {
        let config = '';
        let port;
        let socketPath = '';
        if (process.env.DATABASE_PORT !== undefined) {
          port = parseInt(process.env.DATABASE_PORT);
        }
        if (process.env.SOCKET_PATH !== undefined) {
          socketPath = process.env.SOCKET_PATH;
        }
        config = {
          host: process.env.DATABASE_HOST,
          database: process.env.DATABASE,
          port: port,
          username: process.env.DATABASE_USERNAME,
          password: process.env.PASSWORD,
          socketPath: socketPath,
        };
        resolve(config);
      }
    });
  }

  getDatabaseType() {
    return new Promise((resolve, reject) => {
      if (process.env.DATABASE_TYPE === undefined) {
        db.serialize(async function () {
          await db.each(
            'SELECT * FROM acsys_configuration',
            function (err, row) {
              if (row.config.length > 0) {
                resolve(row.type);
              } else {
                resolve('');
              }
            }
          );
        });
      } else {
        resolve(process.env.DATABASE_TYPE);
      }
    });
  }

  setStorageConfig(config) {
    return new Promise((resolve, reject) => {
      db.serialize(async function () {
        await db.run('DELETE FROM acsys_storeconfig');
        const stmt = await db.prepare(
          'INSERT INTO acsys_storeconfig VALUES (?, ?)'
        );
        stmt.run(`${config}`, `${config} storage`);
        stmt.finalize();
        resolve(true);
      });
    });
  }

  loadStorageConfig() {
    return new Promise((resolve, reject) => {
      db.serialize(async function () {
        await db.each('SELECT * FROM acsys_storeconfig', function (err, row) {
          if (row.config.length > 0) {
            resolve(row.config);
          } else {
            resolve(err);
          }
        });
      });
    });
  }

  getStorageType() {
    return new Promise((resolve, reject) => {
      db.serialize(async function () {
        const sql = 'SELECT * FROM acsys_storeconfig';
        await db.all(sql, [], (err, rows) => {
          if (rows.length > 0) {
            resolve(rows[0].type);
          } else {
            resolve(err);
          }
        });
      });
    });
  }

  getSecret() {
    return new Promise((resolve, reject) => {
      if (process.env.API_SECRET === undefined) {
        if (process.env.DATABASE_TYPE === undefined) {
          fs.readFile(
            'server/config/config.json',
            { encoding: 'utf8', flag: 'r' },
            (err, data) => {
              if (err) {
                resolve('default-key');
              } else {
                const key = JSON.parse(data);
                resolve(key.secret);
              }
            }
          );
        } else {
          resolve('default-key');
        }
      } else {
        resolve(process.env.API_SECRET);
      }
    });
  }
}

module.exports = Config;

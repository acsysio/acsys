const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
let db;

class Config {
  initialize() {
    return new Promise(async (resolve, reject) => {
      db = new sqlite3.Database('./dbase.db', (err) => {
        if (err) {
          console.error(err.message);
        }
        console.log('Connected to the database.');
      });

      db.serialize(async function () {
        await db.run(
          'CREATE TABLE IF NOT EXISTS prmths_configuration (type TEXT, config TEXT)'
        );
        await db.run(
          'CREATE TABLE IF NOT EXISTS prmths_storeconfig (type TEXT, config TEXT)'
        );
      });
      
      resolve(true);
    });
  }

  format() {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT NAME FROM SQLITE_MASTER WHERE TYPE = 'table' AND NAME NOT LIKE 'sqlite_%' AND NAME NOT LIKE 'prmths_configuration' AND NAME NOT LIKE 'prmths_storeconfig'`;
      await db.all(query, [], async (error, rows) => {
        if (rows === undefined || error) {
          resolve([]);
        } else {
          for (const row of rows) {
            await db.run(
              `DROP TABLE IF EXISTS ${row.name}`
            );
          }
        }
      });
      resolve(true);
    });
  }

  setConfig(databaseType, projectName, config) {
    return new Promise((resolve, reject) => {
      db.serialize(async function () {
        await db.run('DELETE FROM prmths_configuration');

        let stmt = await db.prepare(
          'INSERT INTO prmths_configuration VALUES (?, ?)'
        );

        stmt.run(databaseType, projectName);

        stmt.finalize();

        if(databaseType === 'mysql') {
          await db.run(
            'CREATE TABLE IF NOT EXISTS prmths_mysql_configuration (host TEXT, database TEXT, port INT, username TEXT, password TEXT)'
          );
          stmt = await db.prepare(
            'INSERT INTO prmths_mysql_configuration VALUES (?, ?, ?, ?, ?)'
          );
  
          stmt.run(config.host, config.database, config.port, config.username, config.password);
  
          stmt.finalize();
        }

        resolve(true);
      });
    });
  }

  getConfig() {
    return new Promise((resolve, reject) => {
      db.serialize(async function () {
        const sql = 'SELECT * FROM prmths_configuration';
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
    });
  }

  getMysqlConfig() {
    return new Promise((resolve, reject) => {
      db.serialize(async function () {
        const sql = 'SELECT * FROM prmths_mysql_configuration';
        await db.all(sql, [], (err, rows) => {
          if (rows.length > 0) {
            if (rows[0].host.length > 0) {
              const config = {
                host: rows[0].host,
                database: rows[0].database,
                port: rows[0].port,
                username: rows[0].username,
                password: rows[0].password,
              }
              resolve(config);
            } else {
              resolve(err);
            }
          } else {
            resolve(err);
          }
        });
      });
    });
  }

  getDatabaseType() {
    return new Promise((resolve, reject) => {
      db.serialize(async function () {
        await db.each('SELECT * FROM prmths_configuration', function (
          err,
          row
        ) {
          if (row.config.length > 0) {
            resolve(row.type);
          } else {
            resolve('');
          }
        });
      });
    });
  }

  setStorageConfig(config) {
    return new Promise((resolve, reject) => {
      db.serialize(async function () {
        await db.run('DELETE FROM prmths_storeconfig');
        const stmt = await db.prepare(
          'INSERT INTO prmths_storeconfig VALUES (?, ?)'
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
        await db.each('SELECT * FROM prmths_storeconfig', function (err, row) {
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
        const sql = 'SELECT * FROM prmths_storeconfig';
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
      fs.readFile('server/config/config.json', {encoding:'utf8', flag:'r'}, (err, data) => {
        if (err) {
          resolve('default-key');
        }
        else {
          const key = JSON.parse(data);
          resolve(key.secret);
        }
      });
    });
  }
}

module.exports = Config;

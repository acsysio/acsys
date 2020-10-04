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

  setConfig(databaseType, projectName, config) {
    return new Promise((resolve, reject) => {
      db.serialize(async function () {
        await db.run('DELETE FROM prmths_configuration');

        const stmt = await db.prepare(
          'INSERT INTO prmths_configuration VALUES (?, ?)'
        );

        if (databaseType === 'sqlite') {
          stmt.run('sqlite', projectName);
        } else if (databaseType === 'firestore') {
          stmt.run('firestore', JSON.stringify(config));
        }

        stmt.finalize();

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
        await db.run("DELETE FROM prmths_storeconfig WHERE type = 'gcp'");
        const stmt = await db.prepare(
          'INSERT INTO prmths_storeconfig VALUES (?, ?)'
        );
        stmt.run('gcp', JSON.stringify(config));
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
            if (rows[0].config.length > 0) {
              resolve(rows[0].type);
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
}

module.exports = Config;

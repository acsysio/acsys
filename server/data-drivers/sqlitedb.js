const sqlite3 = require('sqlite3').verbose();

let db;

let connected = false;

class SqliteDriver {
  initialize() {
    return new Promise(async (resolve, reject) => {
      db = new sqlite3.Database('./dbase.db', (err) => {
        if (err) {
          connected = false;
        }
        db.serialize(async function () {
          await db.run(
            'CREATE TABLE IF NOT EXISTS prmths_users (id TEXT, email TEXT, username TEXT, role TEXT, mode TEXT, prmthsCd TEXT)'
          );
          await db.run(
            'CREATE TABLE IF NOT EXISTS prmths_logical_content (id TEXT, name TEXT, description TEXT, viewId TEXT, source_collection TEXT, position INT, tableKeys TEXT)'
          );
          await db.run(
            'CREATE TABLE IF NOT EXISTS prmths_views (id TEXT, isRemovable BOOLEAN, isTableMode BOOLEAN, linkTable TEXT, linkViewId TEXT, viewOrder TEXT, orderBy TEXT, rowNum INT)'
          );
          await db.run(
            'CREATE TABLE IF NOT EXISTS prmths_document_details (id TEXT, contentId TEXT, collection TEXT, control TEXT, field_name TEXT, isVisibleOnPage BOOLEAN, isVisibleOnTable BOOLEAN, type TEXT, isKey BOOLEAN, viewOrder INT, width INT)'
          );
        });
        connected = true;
        resolve(true);
      });
      resolve(false);
    });
  }

  isConnected() {
    return connected;
  }

  getProjectName() {
    return new Promise(async (resolve, reject) => {
      const query = 'SELECT CONFIG FROM CONFIGURATION LIMIT 1';
      await db.all(query, [], (error, rows) => {
        if (rows === undefined) {
          resolve('');
        } else {
          resolve(rows[0].config);
        }
      });
    });
  }

  createUser(data) {
    return new Promise((resolve, reject) => {
      db.serialize(async function () {
        const insertData = Object.values(data);

        const values = [];

        let placeholders = '';

        for (let i = 0; i < insertData.length; i++) {
          let insert = '';
          if (typeof insertData[i] === 'string') {
            insert = `'${insertData[i]}'`;
          } else {
            insert = insertData[i];
          }
          if (i === 0) {
            placeholders += `${insert}`;
          } else {
            placeholders += `, ${insert}`;
          }
        }

        const sql = `INSERT INTO PRMTHS_USERS VALUES (${placeholders})`;

        console.log(sql);

        db.run(sql, function (err) {
          if (err) {
            resolve(false);
          }
          resolve(true);
        });
      });
    });
  }

  verifyPassword(id) {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT * FROM PRMTHS_USERS WHERE ID = '${id}'`;
      await db.all(query, [], (error, rows) => {
        if (rows === undefined || error) {
          resolve(false);
        } else {
          resolve(rows[0].prmthsCd);
        }
      });
    });
  }

  getUsers(user) {
    return new Promise(async (resolve, reject) => {
      const query = 'SELECT * FROM PRMTHS_USERS';
      await db.all(query, [], (error, rows) => {
        if (rows === undefined || error) {
          resolve([]);
        } else {
          resolve(rows);
        }
      });
    });
  }

  async getTableData() {
    return new Promise(async (resolve, reject) => {
      const collectionArr = [];
      const query = `SELECT NAME FROM SQLITE_MASTER WHERE TYPE = 'table' AND NAME NOT LIKE 'sqlite_%' AND NAME NOT LIKE 'prmths_%'`;
      await db.all(query, [], async (error, rows) => {
        if (rows === undefined || error) {
          resolve([]);
        } else {
          for (const row of rows) {
            const count = await this.getTableSize(row.name);
            const data = {
              table: row.name,
              rows: count,
            };
            collectionArr.push(data);
          }
          resolve(collectionArr);
        }
      });
    });
  }

  listTables() {
    return new Promise(async (resolve, reject) => {
      const collectionArr = [];
      const query = `SELECT NAME FROM SQLITE_MASTER WHERE TYPE = 'table' AND NAME NOT LIKE 'sqlite_%' AND NAME NOT LIKE 'prmths_%'`;
      await db.all(query, [], (error, rows) => {
        if (rows === undefined || error) {
          resolve([]);
        } else {
          rows.forEach((row) => {
            collectionArr.push(row.name);
          });
          resolve(collectionArr);
        }
      });
    });
  }

  getTableSize(collectionName) {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT COUNT(*) AS NUM FROM '${collectionName}'`;
      await db.all(query, [], (error, rows) => {
        if (rows === undefined || error) {
          resolve(0);
        } else {
          resolve(rows[0].NUM);
        }
      });
    });
  }

  increment(collectionName, field, start, num) {
    return new Promise((resolve, reject) => {
      let counter = num + 1;
      const query = db.collection(collectionName);
      query
        .where(field, '>=', start)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const data = doc.data();
            data[field] = counter;
            db.collection(collectionName).doc(doc.id).update(data);
            counter++;
          });
          resolve(true);
        })
        .catch(reject);
    });
  }

  repositionViews(data, pos) {
    return new Promise(async (resolve, reject) => {
      const query = 'SELECT * FROM PRMTHS_LOGICAL_CONTENT ORDER BY POSITION';
      await db.all(query, [], async (error, rows) => {
        if (rows === undefined || error) {
          resolve();
        } else {
          let newPos = 1;
          for (const row of rows) {
            if (pos === row.position) {
              if (pos === 1) {
                newPos++;
              }
              if (row.id === data.id) {
              } else {
                const sql = `UPDATE PRMTHS_LOGICAL_CONTENT SET POSITION = ${newPos} WHERE ID = '${row.id}'`;
                db.serialize(async function () {
                  await db.run(sql, function (err) {
                    console.log(err);
                  });
                });
                console.log(sql);
                newPos++;
              }
            }
            if (row.id === data.id) {
              // db.collection('prmths_logical_content').doc(doc.id).update(data);
            } else {
              const sql = `UPDATE PRMTHS_LOGICAL_CONTENT SET POSITION = ${newPos} WHERE ID = '${row.id}'`;
              db.serialize(async function () {
                await db.run(sql, function (err) {
                  console.log(err);
                });
              });
              console.log(sql);
              newPos++;
            }
          }
        }
        resolve();
      });
    });
  }

  createTable(collectionName, data) {
    return new Promise((resolve, reject) => {
      db.collection(collectionName)
        .add(data)
        .then((docRef) => resolve(docRef))
        .catch(reject);
    });
  }

  unlockTable(data) {
    return new Promise((resolve, reject) => {
      let query;
      query = db.collection('prmths_open_tables');
      query = query.where('table', '==', data.table);
      query
        .get()
        .then((snapshot) => {
          const objects = [];
          snapshot.forEach((doc) => {
            objects.push(doc.data());
          });
          if (objects.length > 0) {
            resolve(objects);
          } else {
            db.collection('prmths_open_tables')
              .add(data)
              .then((docRef) => resolve(docRef))
              .catch(reject);
          }
        })
        .catch((error) => {
          resolve(error);
        });
    });
  }

  lockTable(table) {
    return new Promise((resolve, reject) => {
      let query;
      // START -- construct collection reference
      query = db.collection('prmths_open_tables');
      query = query.where('table', '==', table);

      // END -- construct collection reference
      query
        .get()
        .then((snapshot) => {
          const objects = [];

          snapshot.forEach((doc) => {
            db.collection('prmths_open_tables')
              .doc(doc.id)
              .delete()
              .then(() => resolve(true))
              .catch(() => reject(false));
          });
          resolve();
        })
        .catch(reject);
    });
  }

  getPage(collectionName, condition) {
    return new Promise(async (resolve, reject) => {
      const options = JSON.parse(condition);
      let query = db.collection(collectionName);
      let pivot = db.collection(collectionName);

      if (options) {
        if (options.where !== undefined && options.where) {
          options.where.forEach((tuple) => {
            try {
              if (tuple[1] == '=') {
                tuple[1] = '==';
              }
              pivot = pivot.where(tuple[0], tuple[1], tuple[2]);
            } catch (error) {}
          });
        }

        if (options.orderBy !== undefined && options.orderBy) {
          options.orderBy.forEach((orderBy) => {
            if (orderBy !== undefined && orderBy.length > 0) {
              if (options.order) {
                query = query.orderBy(orderBy, options.order);
              } else {
                query = query.orderBy(orderBy);
              }
            }
          });
        }

        if (options.direction === 'next') {
          var tempDoc;
          await pivot.get().then((snapshot) => {
            snapshot.forEach((doc) => {
              tempDoc = doc;
            });
          });
          query = query.startAfter(tempDoc);
          query = query.limit(options.limit);
        }

        if (options.direction === 'prev') {
          var tempDoc;
          await pivot.get().then((snapshot) => {
            snapshot.forEach((doc) => {
              tempDoc = doc;
            });
          });
          query = query.endBefore(tempDoc);
          query = query.limitToLast(options.limit);
        }
      }
      query
        .get()
        .then((snapshot) => {
          const objects = [];
          snapshot.forEach((doc) => {
            objects.push(doc.data());
          });
          resolve(objects);
        })
        .catch((error) => {
          resolve(error);
        });
    });
  }

  getDocs(table, options) {
    return new Promise(async (resolve, reject) => {
      let query = `SELECT * FROM ${table} `;
      // query = db.collection(collectionName);

      if (options) {
        if (
          options.where !== undefined &&
          options.where &&
          options.where.length > 0
        ) {
          query += `WHERE `;
          options.where.forEach((tuple, index) => {
            try {
              let value = '';
              // if (tuple[1] == '=') {
              //   tuple[1] = '==';
              // }
              if (typeof tuple[2] === 'string') {
                value = `'${tuple[2]}'`;
              } else {
                value = tuple[2];
              }
              if (index === 0) {
                query += `${tuple[0]} ${tuple[1]} ${value} `;
              } else {
                query += `AND ${tuple[0]} ${tuple[1]} ${value} `;
              }
            } catch (error) {}
          });
        }

        if (options.orderBy !== undefined && options.orderBy) {
          options.orderBy.forEach((orderBy) => {
            if (orderBy !== undefined && orderBy.length > 0) {
              if (options.order) {
                query += `ORDER BY ${orderBy} ${options.order} `;
              } else {
                query += `ORDER BY ${orderBy} `;
              }
            }
          });
        }

        if (options.limit !== undefined && options.limit) {
          query += `LIMIT ${options.limit}`;
        }
      }
      await db.all(query, [], (error, rows) => {
        if (rows === undefined || error) {
          console.log(error);
          resolve([]);
        } else {
          resolve(rows);
        }
      });
    });
  }

  insert(table, data) {
    return new Promise((resolve, reject) => {
      db.serialize(async function () {
        const insertData = Object.values(data);

        const values = [];

        let placeholders = '';

        for (let i = 0; i < insertData.length; i++) {
          let insert = '';
          if (
            typeof insertData[i] === 'string' ||
            typeof insertData[i] === 'object'
          ) {
            insert = `'${insertData[i]}'`;
          } else {
            insert = insertData[i];
          }
          if (i === 0) {
            placeholders += `${insert}`;
          } else {
            placeholders += `, ${insert}`;
          }
        }

        const sql = `INSERT INTO ${table} VALUES (${placeholders})`;

        console.log(sql);

        db.run(sql, function (err) {
          if (err) {
            console.log(err);
            resolve(false);
          }
          resolve(true);
        });
      });
    });
  }

  update(collectionName, data, options) {
    return new Promise((resolve, reject) => {
      let query = db.collection(collectionName);
      if (options) {
        if (options[0][0]) {
          options.forEach((tuple) => {
            try {
              if (tuple[1] == '=') {
                tuple[1] = '==';
              }
              query = query.where(tuple[0], tuple[1], tuple[2]);
            } catch (error) {}
          });
        }
      }
      query
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            db.collection(collectionName)
              .doc(doc.id)
              .update(data)
              .then(() => resolve(true))
              .catch(() => reject(false));
          });
          resolve();
        })
        .catch(reject);
    });
  }

  deleteDocs(collectionName, options) {
    return new Promise((resolve, reject) => {
      let query;
      // START -- construct collection reference
      query = db.collection(collectionName);
      if (options) {
        if (options[0][0]) {
          options.forEach((tuple) => {
            try {
              if (tuple[1] == '=') {
                tuple[1] = '==';
              }
              query = query.where(tuple[0], tuple[1], tuple[2]);
            } catch (error) {}
          });
        }
      }

      // END -- construct collection reference
      query
        .get()
        .then((snapshot) => {
          const objects = [];

          snapshot.forEach((doc) => {
            db.collection(collectionName)
              .doc(doc.id)
              .delete()
              .then(() => resolve(true))
              .catch(() => reject(false));
          });
          resolve();
        })
        .catch(reject);
    });
  }

  checkOpenTable(collectionName) {
    return new Promise((resolve, reject) => {
      let query;
      query = db.collection('prmths_open_tables');
      query = query.where('table', '==', collectionName);
      query
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            resolve(true);
          });
          resolve(false);
        })
        .catch((error) => {
          resolve(false);
        });
    });
  }
}

module.exports = SqliteDriver;

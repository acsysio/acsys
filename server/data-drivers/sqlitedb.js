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
            'CREATE TABLE IF NOT EXISTS prmths_logical_content (id TEXT, name TEXT, description TEXT, tableKeys TEXT, viewId TEXT, source_collection TEXT, position INT)'
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
    return new Promise((resolve, reject) => {
      let query;
      query = db.collection('prmths_users');
      query = query.where('id', '==', id);
      query
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const data = doc.data();
            resolve(data.prmthsCd);
          });
          resolve(false);
        })
        .catch((error) => {
          resolve(false);
        });
    });
  }

  getUsers(user) {
    return new Promise(async (resolve, reject) => {
      const query = 'SELECT * FROM PRMTHS_USERS';
      await db.all(query, [], (error, rows) => {
        if (rows === undefined || error) {
          console.log(error);
          resolve([]);
        } else {
          console.log(rows);
          resolve(rows);
        }
      });
    });
  }

  getTableData() {
    return new Promise((resolve, reject) => {
      const collectionArr = [];
      const expr = /prmths_/;
      db.listCollections()
        .then(async (collections) => {
          for (const collection of collections) {
            if (!expr.test(`${collection.id}`)) {
              const count = await this.getTableSize(collection.id);
              const row = {
                table: collection.id,
                rows: count,
              };
              collectionArr.push(row);
            }
            // collectionArr.push(collection.id);
          }
          resolve(collectionArr);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  listTables() {
    return new Promise((resolve, reject) => {
      const collectionArr = [];
      const expr = /prmths_/;
      db.listCollections()
        .then((collections) => {
          for (const collection of collections) {
            if (!expr.test(`${collection.id}`)) {
              collectionArr.push(collection.id);
            }
            // collectionArr.push(collection.id);
          }
          resolve(collectionArr);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getTableSize(collectionName) {
    return new Promise((resolve, reject) => {
      let query;
      query = db.collection(collectionName);
      query
        .get()
        .then((snapshot) => {
          resolve(snapshot.size);
        })
        .catch(reject);
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
    return new Promise((resolve, reject) => {
      let query;
      query = db.collection('prmths_logical_content');
      query = query.orderBy('position');
      query
        .get()
        .then((snapshot) => {
          let newPos = 1;
          snapshot.forEach((doc) => {
            if (pos === doc.data().position) {
              if (pos === 1) {
                newPos++;
              }
              if (doc.data().id === data.id) {
                // newPos++;
              } else {
                const newEntry = doc.data();
                newEntry.position = newPos;
                db.collection('prmths_logical_content')
                  .doc(doc.id)
                  .update(newEntry);
                newPos++;
              }
            }
            if (doc.data().id === data.id) {
              db.collection('prmths_logical_content').doc(doc.id).update(data);
            } else {
              const newEntry = doc.data();
              newEntry.position = newPos;
              db.collection('prmths_logical_content')
                .doc(doc.id)
                .update(newEntry);
              newPos++;
            }
          });
          resolve();
        })
        .catch((error) => {
          resolve(error);
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
      console.log(query);

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

        const sql = `INSERT INTO ${table} VALUES (${placeholders})`;

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

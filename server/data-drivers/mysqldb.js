const mysql = require('mysql');

let db;

let connected = false;

class MysqlDriver {
  initialize(config) {
    return new Promise(async (resolve, reject) => {
      //do mysql config load here
      db = mysql.createConnection({
        host     : '',
        port     : '',
        database : '',
        user     : '',
        password : '' 
      });
      db.connect();
      db.query('CREATE TABLE IF NOT EXISTS prmths_users (id TEXT, email TEXT, username TEXT, role TEXT, mode TEXT, prmthsCd TEXT)', (error, rows) => {

      });
      db.query('CREATE TABLE IF NOT EXISTS prmths_logical_content (id TEXT, name TEXT, description TEXT, viewId TEXT, source_collection TEXT, position INT, tableKeys TEXT)', (error, rows) => {
      
      });
      db.query('CREATE TABLE IF NOT EXISTS prmths_views (id TEXT, isRemovable BOOLEAN, isTableMode BOOLEAN, linkTable TEXT, linkViewId TEXT, viewOrder TEXT, orderBy TEXT, rowNum INT)', (error, rows) => {

      });
      db.query('CREATE TABLE IF NOT EXISTS prmths_document_details (id TEXT, contentId TEXT, collection TEXT, control TEXT, field_name TEXT, isVisibleOnPage BOOLEAN, isVisibleOnTable BOOLEAN, type TEXT, isKey BOOLEAN, viewOrder INT, width INT)', (error, rows) => {

      });
      db.query('CREATE TABLE IF NOT EXISTS prmths_email_settings (host TEXT, port INT, username TEXT, password TEXT)', (error, rows) => {

      });
      db.query('CREATE TABLE IF NOT EXISTS prmths_open_tables (table_name TEXT)', (error, rows) => {

      });
      db.query('CREATE TABLE IF NOT EXISTS prmths_storage_items (id TEXT, fileOrder INT, parent TEXT, name TEXT, contentType TEXT, isPublic BOOLEAN, timeCreated TEXT, updated TEXT)', (error, rows) => {

      });
      db.query('CREATE TABLE IF NOT EXISTS prmths_user_reset (id TEXT, user_id Text, expiration_date INT)', (error, rows) => {

      });
      connected = true;
      resolve(true);
    });
  }

  isConnected() {
    return connected;
  }

  getProjectName() {
    return new Promise(async (resolve, reject) => {
      const query = 'SELECT CONFIG FROM PRMTHS_CONFIGURATION LIMIT 1';
      await db.query(query, (error, rows) => {
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

      db.query(sql, function (err) {
        if (err) {
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  verifyPassword(id) {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT * FROM PRMTHS_USERS WHERE ID = '${id}'`;
      await db.query(query, (error, rows) => {
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
      const query = `SELECT * FROM PRMTHS_USERS WHERE USERNAME != '${user}'`;
      await db.query(query, (error, rows) => {
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
      const query = `SHOW TABLES`;
      await db.query(query, async (error, rows) => {
        if (rows === undefined || error) {
          resolve([]);
        } else {
          for (const row of rows) {
            if(Object.values(row)[0].substring(0, 7) !== 'prmths_') {
              const count = await this.getTableSize(Object.values(row)[0]);
              const data = {
                table: Object.values(row)[0],
                rows: count,
              };
              collectionArr.push(data);
            }
          }
          resolve(collectionArr);
        }
      });
    });
  }

  listTables() {
    return new Promise(async (resolve, reject) => {
      const collectionArr = [];
      const query = `SHOW TABLES`;
      await db.query(query, (error, rows) => {
        if (rows === undefined || error) {
          resolve([]);
        } else {
          rows.forEach((row) => {
            if(Object.values(row)[0].substring(0, 7) !== 'prmths_') {
              collectionArr.push(Object.values(row)[0]);
            }
          });
          resolve(collectionArr);
        }
      });
    });
  }

  getTableSize(collectionName) {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT COUNT(*) AS NUM FROM ${collectionName}`;
      await db.query(query, (error, rows) => {
        if (rows === undefined || error) {
          resolve(0);
        } else {
          resolve(rows[0].NUM);
        }
      });
    });
  }

  increment(collectionName, options, field, start, num) {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT * FROM ${collectionName} WHERE ${field} >= ${start}`;
      await db.query(query, async (error, rows) => {
        if (rows === undefined || error) {
          resolve();
        } else {
          const counter = num + 1;
          for (const row of rows) {
            const updateData = row;

            updateData[field] = counter;

            counter++;

            let placeholders = '';

            for (let i = 0; i < updateData.length; i++) {
              let update = '';
              if (
                typeof updateData[i] === 'string' ||
                typeof updateData[i] === 'object'
              ) {
                update = `'${updateData[i]}'`;
              } else {
                update = updateData[i];
              }
              if (i === 0) {
                placeholders += `${updateData[i].field_name} = ${update}`;
              } else {
                placeholders += `, ${updateData[i].field_name} = ${update}`;
              }
            }

            let query = `UPDATE ${collectionName} SET (${placeholders}) `;

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

            db.query(query, function (err) {
              console.log(err);
            });
          }
        }
        resolve();
      });
    });
  }

  repositionViews(data, pos) {
    return new Promise(async (resolve, reject) => {
      const query = 'SELECT * FROM PRMTHS_LOGICAL_CONTENT ORDER BY POSITION';
      await db.query(query, async (error, rows) => {
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
                db.query(sql, function (err) {
                  console.log(err);
                });
                newPos++;
              }
            }
            if (row.id === data.id) {
            } else {
              const sql = `UPDATE PRMTHS_LOGICAL_CONTENT SET POSITION = ${newPos} WHERE ID = '${row.id}'`;
              db.query(sql, function (err) {
                console.log(err);
              });
              newPos++;
            }
          }
        }
        resolve();
      });
    });
  }

  createTable(tableName, data) {
    return new Promise((resolve, reject) => {
      const insertData = Object.values(data);

      const dataKeys = Object.keys(data);

      let placeholders = '';

      for (let i = 0; i < insertData.length; i++) {
        let insert = '';
        if (
          typeof insertData[i] === 'string' ||
          typeof insertData[i] === 'object'
        ) {
          insert = `${dataKeys[i]} TEXT`;
        } else if (
          typeof insertData[i] === 'number' ||
          typeof insertData[i] === 'bigint'
        ) {
          insert = `${dataKeys[i]} INT`;
        } else if (typeof insertData[i] === 'boolean') {
          insert = `${dataKeys[i]} BOOLEAN`;
        }
        if (i === 0) {
          placeholders += `${insert}`;
        } else {
          placeholders += `, ${insert}`;
        }
      }

      let sql = `CREATE TABLE ${tableName} (${placeholders})`;

      db.query(sql, function (err) {
        if (err) {
          console.log(err);
          resolve(false);
        }

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

        sql = `INSERT INTO ${tableName} VALUES (${placeholders})`;

        db.query(sql, function (err) {
          if (err) {
            console.log(err);
            resolve(false);
          }
          resolve(true);
        });
      });
    });
  }

  unlockTable(data) {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT * FROM prmths_open_tables WHERE TABLE_NAME = ${data.table_name}`;
      await db.query(query, (error, rows) => {
        if (rows === undefined || error) {
          const sql = `INSERT INTO prmths_open_tables VALUES ('${data.table_name}')`;
          db.query(sql, function (err) {
            if (err) {
              resolve(false);
            }
            resolve(true);
          });
        } else {
          const sql = `UPDATE prmths_open_tables SET TABLE_NAME = ${data.table_name}`;
          db.query(sql, function (err) {
            if (err) {
              resolve(false);
            }
            resolve(true);
          });
        }
      });
    });
  }

  lockTable(table) {
    return new Promise(async (resolve, reject) => {
      const query = `DELETE FROM prmths_open_tables WHERE TABLE_NAME = '${table}'`;
      await db.query(query, (error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  getPage(table, condition) {
    return new Promise(async (resolve, reject) => {
      const options = JSON.parse(condition);
      let query = `SELECT * FROM ${table} `;

      if (options) {
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

        if (options.direction === 'next') {
          const offset = options.currentPage * options.limit;
          query += `LIMIT ${offset},${options.limit}`;
        }

        if (options.direction === 'prev') {
          const offset = (options.currentPage - 2) * options.limit + 1;
          query += `LIMIT ${offset},${options.limit}`;
        }
      }
      await db.query(query, (error, rows) => {
        if (rows === undefined || error) {
          console.log(error);
          resolve([]);
        } else {
          resolve(rows);
        }
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
          query += `LIMIT 0,${options.limit}`;
        }
      }
      await db.query(query, (error, rows) => {
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

      db.query(sql, function (err) {
        if (err) {
          console.log(err);
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  update(collectionName, data, options) {
    return new Promise((resolve, reject) => {
      const updateData = Object.values(data);

      const dataKeys = Object.keys(data);

      let placeholders = '';

      for (let i = 0; i < updateData.length; i++) {
        let update = '';
        if (
          typeof updateData[i] === 'string' ||
          typeof updateData[i] === 'object'
        ) {
          update = `'${updateData[i]}'`;
        } else {
          update = updateData[i];
        }
        if (i === 0) {
          placeholders += `${dataKeys[i]} = ${update}`;
        } else {
          placeholders += `, ${dataKeys[i]} = ${update}`;
        }
      }

      let query = `UPDATE ${collectionName} SET ${placeholders} `;

      if (options) {
        query += `WHERE `;
        options.forEach((tuple, index) => {
          try {
            let value = '';
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

      db.query(query, function (err) {
        if (err) {
          console.log(err);
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  deleteDocs(collectionName, options) {
    return new Promise(async (resolve, reject) => {
      let query = `DELETE FROM ${collectionName} `;
      if (options) {
        query += `WHERE `;
        options.forEach((tuple, index) => {
          try {
            let value = '';
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
      await db.query(query, (error) => {
        if (error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  checkOpenTable(collectionName) {
    return new Promise(async (resolve, reject) => {
      const query = `SELECT * FROM prmths_open_tables WHERE TABLE_NAME = '${collectionName}'`;
      await db.query(query, (error, rows) => {
        if (rows === undefined || error) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}

module.exports = MysqlDriver;

const admin = require('firebase-admin');

let auth;
let db;

let connected = false;

class DataDriver {
  initialize() {
    return new Promise(async (resolve, reject) => {
      let serviceAccount;
      if (process.env.DATABASE_TYPE !== undefined) {
        serviceAccount = {
          type: process.env.TYPE,
          project_id: process.env.PROJECT_ID,
          private_key_id: process.env.PRIVATE_KEY_ID,
          private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
          client_email: process.env.CLIENT_EMAIL,
          client_id: process.env.CLIENT_ID,
          auth_uri: process.env.AUTH_URI,
          token_uri: process.env.TOKEN_URI,
          auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
          client_x509_cert_url: process.env.CLIENT_X509_CERT_URL,
        };
      } else {
        serviceAccount = require('../../acsys.service.config.json');
      }
      try {
        admin.initializeApp({
          // credential: admin.credential.cert(serviceAccount),
          credential: admin.credential.cert(serviceAccount),
        });
        auth = admin.auth();
        db = admin.firestore();
        if (db.projectId.length > 0) {
          connected = true;
        }
        resolve(true);
      } catch (error) {
        console.log(error);
        connected = false;
      }
      resolve(false);
    });
  }

  isConnected() {
    return connected;
  }

  getBucketName() {
    if (process.env.BUCKET === undefined) {
      return db.projectId + '.appspot.com';
    } else {
      return process.env.BUCKET;
    }
  }

  getBucket() {
    if (process.env.BUCKET === undefined) {
      return admin.storage().bucket(db.projectId + '.appspot.com');
    } else {
      return admin.storage().bucket(process.env.BUCKET);
    }
  }

  getProjectName() {
    return new Promise((resolve, reject) => {
      if (db.projectId) {
        resolve(db.projectId);
      } else {
        resolve('');
      }
    });
  }

  doCreateInitialUserWithEmailAndPassword(username, email, password) {
    auth
      .createUserWithEmailAndPassword(email, password)
      .then((authUser) => {
        if (authUser.user)
          return setDoc('acsys_users', {
            uid: authUser.user.uid,
            role: 'Administrator',
            username,
            email,
          });
      })
      .catch();
  }

  createUser(data) {
    return new Promise((resolve, reject) => {
      db.collection('acsys_users')
        .add(data)
        .then((docRef) => resolve(docRef))
        .catch((error) => {
          reject(error);
        });
    });
  }

  collection(collectionName) {
    db.collection(collectionName);
  }

  verifyPassword(id) {
    return new Promise((resolve, reject) => {
      let query;
      query = db.collection('acsys_users');
      query = query.where('acsys_id', '==', id);
      query
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const data = doc.data();
            resolve(data.acsys_cd);
          });
          resolve(false);
        })
        .catch((error) => {
          resolve(false);
        });
    });
  }

  getUsers(user) {
    return new Promise((resolve, reject) => {
      let query;
      query = db.collection('acsys_users');
      query
        .get()
        .then((snapshot) => {
          const objects = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.username !== user) {
              objects.push(data);
            }
          });
          resolve(objects);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getTableData() {
    return new Promise((resolve, reject) => {
      const collectionArr = [];
      const expr = /acsys_/;
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
      const expr = /acsys_/;
      db.listCollections()
        .then((collections) => {
          for (const collection of collections) {
            if (!expr.test(`${collection.id}`)) {
              collectionArr.push(collection.id);
            }
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
        .catch((error) => {
          reject(error);
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
        .catch((error) => {
          reject(error);
        });
    });
  }

  repositionViews(data, old, pos) {
    return new Promise((resolve, reject) => {
      let newPos = 1;
      let query;
      query = db.collection('acsys_logical_content');
      query = query.orderBy('position');
      query
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            if (old > pos) {
              if (pos === doc.data().position) {
                newPos++;
              }
            }
            if (doc.data().acsys_id === data.acsys_id) {
              db.collection('acsys_logical_content').doc(doc.id).update(data);
            } else {
              const newEntry = doc.data();
              newEntry.position = newPos;
              db.collection('acsys_logical_content')
                .doc(doc.id)
                .update(newEntry);
              newPos++;
            }
            if (pos > old) {
              if (pos === doc.data().position) {
                newPos++;
              }
            }
          });
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  reorgViews() {
    return new Promise((resolve, reject) => {
      let newPos = 1;
      let query;
      query = db.collection('acsys_logical_content');
      query = query.orderBy('position');
      query
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const newEntry = doc.data();
            newEntry.position = newPos;
            db.collection('acsys_logical_content').doc(doc.id).update(newEntry);
            newPos++;
          });
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  createTable(collectionName, data) {
    return new Promise((resolve, reject) => {
      db.collection(collectionName)
        .add(data)
        .then((docRef) => resolve(docRef))
        .catch((error) => {
          reject(error);
        });
    });
  }

  unlockTable(data) {
    return new Promise((resolve, reject) => {
      let query;
      query = db.collection('acsys_open_tables');
      query = query.where('table_name', '==', data.table_name);
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
            db.collection('acsys_open_tables')
              .add(data)
              .then((docRef) => resolve(docRef))
              .catch((error) => {
                reject(error);
              });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  lockTable(table_name) {
    return new Promise((resolve, reject) => {
      let query;
      // START -- construct collection reference
      query = db.collection('acsys_open_tables');
      query = query.where('table_name', '==', table_name);

      // END -- construct collection reference
      query
        .get()
        .then((snapshot) => {
          const objects = [];

          snapshot.forEach((doc) => {
            db.collection('acsys_open_tables')
              .doc(doc.id)
              .delete()
              .then(() => resolve(true))
              .catch(() => reject(false));
          });
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
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

        if (options.order_by !== undefined && options.order_by) {
          options.order_by.forEach((order_by) => {
            if (order_by !== undefined && order_by.length > 0) {
              if (options.order) {
                query = query.orderBy(order_by, options.order);
              } else {
                query = query.orderBy(order_by);
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
          reject(error);
        });
    });
  }

  getDocs(collectionName, options) {
    return new Promise((resolve, reject) => {
      let query;
      query = db.collection(collectionName);

      if (options) {
        if (options.limit !== undefined && options.limit) {
          query = query.limit(options.limit);
        }
        if (options.where !== undefined && options.where) {
          options.where.forEach((tuple) => {
            try {
              if (tuple[1] == '=') {
                tuple[1] = '==';
              }
              query = query.where(tuple[0], tuple[1], tuple[2]);
            } catch (error) {}
          });
        }

        if (options.order_by !== undefined && options.order_by) {
          options.order_by.forEach((order_by) => {
            if (order_by !== undefined && order_by.length > 0) {
              if (options.order) {
                query = query.orderBy(order_by, options.order);
              } else {
                query = query.orderBy(order_by);
              }
            }
          });
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
          reject(error);
        });
    });
  }

  doc(collectionName, uid) {
    collection(collectionName).doc(uid);
  }

  getDocById(collectionName, uid) {
    return new Promise((resolve, reject) => {
      doc(collectionName, uid)
        .get()
        .then((doc) => {
          if (doc.exists) resolve(doc);
          else reject(`No Document with uid: ${uid}`);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  insert(collectionName, data) {
    return new Promise((resolve, reject) => {
      db.collection(collectionName)
        .add(data)
        .then((docRef) => resolve(docRef))
        .catch((error) => {
          reject(error);
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
        .catch((error) => {
          reject(error);
        });
    });
  }

  deleteDoc(collectionName, docId) {
    return new Promise((resolve, reject) => {
      db.collection(collectionName)
        .doc(docId)
        .delete()
        .then(() => resolve(true))
        .catch((error) => reject(error));
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
            db.collection(collectionName).doc(doc.id).delete();
          });
          resolve(true);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  dropTable(collectionName) {
    return new Promise((resolve, reject) => {
      let query = db.collection(collectionName);
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
        .catch((error) => {
          reject(error);
        });
    });
  }

  checkOpenTable(collectionName) {
    return new Promise((resolve, reject) => {
      let query;
      query = db.collection('acsys_open_tables');
      query = query.where('table_name', '==', collectionName);
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

module.exports = DataDriver;

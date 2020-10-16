/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const jwt = require('jsonwebtoken');

let config;
let db;
const searchDir = function (dir) {
  fs.readdir(dir, async function (err, files) {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    for (let i = 0; i < files.length; i += 1) {
      const parent = dir.substring(8) + '/';
      let tempFileName;
      let parentName;
      let fileName = files[i];
      if (dir === './files') {
        parentName = '/';
        tempFileName = files[i];
      }
      else {
        parentName = parent;
        tempFileName = parent + files[i];
      }
      
      if (
        !tempFileName.includes('/') ||
        (tempFileName.indexOf('/') ===
          tempFileName.lastIndexOf('/') &&
          tempFileName.charAt(tempFileName.length - 1) === '/')
      ) {
        parentName = '/';
      } else if (
        tempFileName.indexOf('/') !== tempFileName.lastIndexOf('/') &&
        tempFileName.charAt(tempFileName.length - 1) === '/'
      ) {
        const tempName = tempFileName.substring(
          0,
          tempFileName.lastIndexOf('/')
        );
        parentName = tempName.substring(
          0,
          tempName.lastIndexOf('/') + 1
        );
      }

      if (fileName !== 'undefined') {
        let order = 1;
        let type = mime.contentType(files[i]);
        if (type === false) {
          tempFileName += '/';
          fileName += '/';
          type = 'Folder';
          order = 0;
        }
        if (fileName.substring(fileName.length - 1) === '/') {
          type = 'Folder';
          order = 0;
        }
        const dateCreated = await fs.lstatSync(dir + '/' + files[i]).birthtime;
        const dateUpdated = await fs.lstatSync(dir + '/' + files[i]).mtime;
        const object = {
          id: tempFileName,
          fileOrder: order,
          parent: parentName,
          name: fileName,
          contentType: type,
          isPublic: false,
          timeCreated: `${
            monthNames[dateCreated.getMonth()]
          } ${dateCreated.getDate()}, ${dateCreated.getFullYear()}`,
          updated: `${
            monthNames[dateUpdated.getMonth()]
          } ${dateUpdated.getDate()}, ${dateUpdated.getFullYear()}`,
        };
        await db.insert('prmths_storage_items', object);
        if (type === 'Folder') {
          searchDir(dir + '/' + files[i]);
        }
      }
    }
  });
}

const removeDir = function (path) {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path);

    files.forEach(function(filename) {
      if (fs.statSync(path + "/" + filename).isDirectory()) {
        removeDir(path + filename + "/");
      } else {
        fs.unlink(path + "/" + filename,
        async function (err) {
            if (!err) {
                await db
                .deleteDocs('prmths_storage_items', [['id', '=', path.substring(8) + filename]]);
            }
        });
      }
    });
    fs.rmdir(path,
      async function (err) {
          if (!err) {
              await db
              .deleteDocs('prmths_storage_items', [['id', '=', path.substring(8)]]);
          }
      });
  }
}

class LocalStorageDriver {
  initialize(configuration, database) {
    return new Promise((resolve) => {
        config = configuration;
        db = database;
        fs.mkdir('./files', async function (err) {});
        resolve(true);
    });
  }

  syncFiles() {
    return new Promise((resolve) => {
      db.deleteDocs('prmths_storage_items')
        .then(() => {
          searchDir('./files');
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  uploadFile(file, destination) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
        const writeName = destination + file.name;
        file.mv('./files/' + writeName);
        const monthNames = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];

        let parentName = destination;
        let order = 1;
        let type = file.mimetype;
        if (type === 'application/x-www-form-urlencoded;charset=UTF-8') {
            type = 'Folder';
            order = 0;
        }
        if (destination.length < 1) {
            parentName = '/';
        }
        const dateCreated = new Date();
        const dateUpdated = new Date();
        const object = {
            id: writeName,
            fileOrder: order,
            parent: parentName,
            name: file.name,
            contentType: type,
            isPublic: false,
            timeCreated: `${
            monthNames[dateCreated.getMonth()]
            } ${dateCreated.getDate()}, ${dateCreated.getFullYear()}`,
            updated: `${
            monthNames[dateUpdated.getMonth()]
            } ${dateUpdated.getDate()}, ${dateUpdated.getFullYear()}`,
        };

        db.insert('prmths_storage_items', object)
            .then(() => {
            resolve(true);
            })
            .catch(() => {
            resolve(false);
            });
    });
  }

  createNewFolder(folder, parent) {
    return new Promise((resolve, reject) => {
        const writeName = parent + folder;
        fs.mkdir(
            `./files/${writeName}`,
            async function (err) {
                if (err) {
                    res.send(err);
                } else {
                    const monthNames = [
                        'Jan',
                        'Feb',
                        'Mar',
                        'Apr',
                        'May',
                        'Jun',
                        'Jul',
                        'Aug',
                        'Sep',
                        'Oct',
                        'Nov',
                        'Dec',
                    ];
            
                    let order = 0;
                    let type = 'Folder';
                    let parentName = parent;
                    if (parentName === '') {
                      parentName = '/';
                    }
                    const dateCreated = new Date();
                    const dateUpdated = new Date();
                    const object = {
                        id: writeName,
                        fileOrder: order,
                        parent: parentName,
                        name: folder,
                        contentType: type,
                        isPublic: false,
                        timeCreated: `${
                        monthNames[dateCreated.getMonth()]
                        } ${dateCreated.getDate()}, ${dateCreated.getFullYear()}`,
                        updated: `${
                        monthNames[dateUpdated.getMonth()]
                        } ${dateUpdated.getDate()}, ${dateUpdated.getFullYear()}`,
                    };
            
                    db.insert('prmths_storage_items', object)
                        .then(() => {
                          resolve(true);
                        })
                        .catch(() => {
                          resolve(false);
                        });
                }
            }
        );
    });
  }

  getStorageURL(req) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const options = {
        where: [['id', '=', req.query.url]],
      };
      await db.getDocs('prmths_storage_items', options)
        .then(async (result) => {
          if (Boolean(result.length > 0 && result[0].isPublic)) {
            const url = req.protocol + '://' + req.get('host') + '/api/getFile?file=' + req.query.url;
            resolve(url);
          }
          else {
            const token = jwt.sign({ sub: req.query.url }, await config.getSecret(), {
              expiresIn: '1d',
            });
            const url = req.protocol + '://' + req.get('host') + '/api/getFile?file=' + req.query.url + '&token=' + token;
            resolve(url);
          }
        });
    });
  }

  makeFilePublic(referenceName) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
        await db
        .update('prmths_storage_items', { isPublic: true }, [
          ['id', '=', referenceName],
        ])
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  makeFilePrivate(referenceName) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
        await db
        .update('prmths_storage_items', { isPublic: false }, [
          ['id', '=', referenceName],
        ])
        .then(() => {
          resolve(true);
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  deleteFile(referenceName) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      if (referenceName.charAt(referenceName.length - 1) === '/') {
        removeDir('./files/' + referenceName);
        resolve(true);
      }
      else {
        fs.unlink('./files/' + referenceName,
        async function (err) {
            if (err) {
                resolve(false);
            } else {
                await db
                .deleteDocs('prmths_storage_items', [['id', '=', referenceName]])
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    resolve(false);
                });
            }
        });
      }
    });
  }
}

module.exports = LocalStorageDriver;

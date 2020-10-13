/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
const path = require('path');
const fs = require('fs');
const temp = require('temp').track();
const mime = require('mime-types');

let storage;
let db;
let projectId;

class LocalStorageDriver {
  initialize(database) {
    return new Promise((resolve) => {
        db = database;
        resolve(true);
    });
  }

  syncFiles() {
    return new Promise((resolve) => {
      db.deleteDocs('prmths_storage_items')
        .then(() => {
          fs.readdir('./files', async function (err, files) {
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
              const tempFileName = files[i];
              let parentName = tempFileName.substring(
                0,
                tempFileName.lastIndexOf('/') + 1
              );
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
              let fileName;
              if (parentName !== '/') {
                fileName = tempFileName.substring(
                  parentName.length,
                  tempFileName.length
                );
              } else {
                fileName = tempFileName.substring(0, tempFileName.length);
              }
              if (fileName !== 'undefined') {
                let order = 1;
                let type = mime.contentType(files[i]);
                if (type === false) {
                  type = 'Folder';
                }
                if (fileName.substring(fileName.length - 1) === '/') {
                  type = 'Folder';
                  order = 0;
                }
                const dateCreated = await fs.lstatSync('./files/' + files[i]).birthtime;
                const dateUpdated = await fs.lstatSync('./files/' + files[i]).mtime;
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

                db.insert('prmths_storage_items', object);
              }
            }
            resolve(true);
          });
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
      const url = req.protocol + '://' + req.get('host') + '/api/getFile?file=' + req.query.url;
      resolve(url);
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
    });
  }
}

module.exports = LocalStorageDriver;

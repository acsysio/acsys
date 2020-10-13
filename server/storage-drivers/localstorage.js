/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
const path = require('path');
const fs = require('fs');
const temp = require('temp').track();

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
        .then(async () => {
          await storage.getFiles(
            {
              prefix: '',
            },
            async function (err, files) {
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
                const tempFileName = files[i].name;
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
                  const metaData = await files[i].getMetadata();
                  const isPublic = await files[i].isPublic();
                  let order = 1;
                  let type = metaData[0].contentType;
                  if (fileName.substring(fileName.length - 1) === '/') {
                    type = 'Folder';
                    order = 0;
                  }
                  const dateCreated = new Date(metaData[0].timeCreated);
                  const dateUpdated = new Date(metaData[0].updated);
                  const object = {
                    id: tempFileName,
                    fileOrder: order,
                    parent: parentName,
                    name: fileName,
                    contentType: type,
                    isPublic: isPublic[0],
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
            }
          );
        })
        .catch(() => {
          resolve(false);
        });
    });
  }

  uploadFile(file, destination) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
        const { name, data, mimetype } = file;
        const writeName = destination + name;
        fs.writeFile(
            `./files/${writeName}`,
            file,
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
            
                    let parentName = destination;
                    let order = 1;
                    let type = mimetype;
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
                        id: name,
                        fileOrder: order,
                        parent: parentName,
                        name,
                        contentType: type,
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

  getStorageURL(referenceName) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      // const file = storage.file(referenceName.replace(/ /g, '_'));
      // const isPublic = await file.isPublic();
      // let url = '';
      // if (isPublic[0]) {
      //   resolve(
      //     `https://storage.googleapis.com/${projectId}.appspot.com/${referenceName}`
      //   );
      // } else {
      //   const today = new Date();
      //   const expires = new Date();
      //   expires.setDate(today.getDate() + 1);
      //   url = await file.getSignedUrl({
      //     action: 'read',
      //     expires: expires.getTime(),
      //   });
      //   resolve(url[0]);
      // }
      resolve('');
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
        fs.unlink(referenceName,
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

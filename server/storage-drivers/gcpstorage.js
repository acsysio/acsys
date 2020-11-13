/* eslint-disable no-await-in-loop */
/* eslint-disable class-methods-use-this */
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const temp = require('temp').track();

let storage;
let db;
let projectId;

class StorageDriver {
  initialize(config, database) {
    return new Promise((resolve) => {
      try {
        fs.readFile('./acsys.service.config.json', 'utf8', function (
          err,
          data
        ) {
          if (err) {
            console.log(err);
          } else {
            fs.realpath('./acsys.service.config.json', 'utf8', function (
              _error,
              path
            ) {
              try {
                const config = JSON.parse(data);
                const gStorage = new Storage({
                  projectId: config.project_id,
                  keyFilename: path.replace(/\\/g, '/'),
                });
                storage = gStorage.bucket(`${config.project_id}.appspot.com`);
                db = database;
                projectId = config.project_id;
              } catch (error2) {
                console.log(error2);
              }
            });

            resolve(true);
          }
        });
      } catch (error) {
        resolve(false);
      }
    });
  }

  syncFiles() {
    return new Promise((resolve) => {
      db.deleteDocs('acsys_storage_items')
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

                  db.insert('acsys_storage_items', object);
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

      const blob = storage.file(writeName.replace(/ /g, '_'));
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: mimetype,
        },
      });

      await blobStream
        .on('finish', async () => {
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
            id: blob.name,
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

          db.insert('acsys_storage_items', object)
            .then(() => {
              resolve(true);
            })
            .catch(() => {
              resolve(false);
            });
        })
        .on('error', () => {
          resolve(false);
        })
        .end(data);
    });
  }

  createNewFolder(folder, parent) {
    return new Promise((resolve, reject) => {
      const { data } = temp;
      const writeName = parent + folder;
      const blob = storage.file(writeName.replace(/ /g, '_'));
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: 'application/x-www-form-urlencoded;charset=UTF-8',
        },
      });

      blobStream
        .on('finish', async () => {
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
          const metaData = await blob.getMetadata();
          const fileName = parent + folder;

          let parentName = parent;
          if (parentName === '') {
            parentName = '/';
          }
          const order = 0;
          const type = 'Folder';
          const dateCreated = new Date(metaData[0].timeCreated);
          const dateUpdated = new Date(metaData[0].updated);
          const object = {
            id: fileName,
            fileOrder: order,
            parent: parentName,
            name: folder,
            contentType: type,
            timeCreated: `${
              monthNames[dateCreated.getMonth()]
            } ${dateCreated.getDate()}, ${dateCreated.getFullYear()}`,
            updated: `${
              monthNames[dateUpdated.getMonth()]
            } ${dateUpdated.getDate()}, ${dateUpdated.getFullYear()}`,
          };

          db.insert('acsys_storage_items', object)
            .then(() => {
              resolve(true);
            })
            .catch(() => {
              resolve(false);
            });
        })
        .on('error', (error) => {
          reject(error);
        })
        .end(data);
    });
  }

  getStorageURL(req) {
    const referenceName = req.query.url;
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const file = storage.file(referenceName.replace(/ /g, '_'));
      const isPublic = await file.isPublic();
      let url = '';
      if (isPublic[0]) {
        resolve(
          `https://storage.googleapis.com/${projectId}.appspot.com/${referenceName}`
        );
      } else {
        const today = new Date();
        const expires = new Date();
        expires.setDate(today.getDate() + 1);
        url = await file.getSignedUrl({
          action: 'read',
          expires: expires.getTime(),
        });
        resolve(url[0]);
      }
    });
  }

  makeFilePublic(referenceName) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const blob = storage.file(referenceName.replace(/ /g, '_'));
      const metaData = await blob.getMetadata();
      await blob.makePublic(async function () {
        if (
          metaData[0].contentType ===
          'application/x-www-form-urlencoded;charset=UTF-8'
        ) {
          const files = await db.getDocs('acsys_storage_items', {
            where: [['parent', '=', referenceName]],
          });
          files.forEach(async (file) => {
            const fileBlob = storage.file(file.id.replace(/ /g, '_'));
            await fileBlob.makePublic(async function () {
              await db.update('acsys_storage_items', { isPublic: true }, [
                ['id', '=', file.id],
              ]);
            });
          });
        }
        await db
          .update('acsys_storage_items', { isPublic: true }, [
            ['id', '=', referenceName],
          ])
          .then(() => {
            resolve(true);
          })
          .catch(() => {
            resolve(false);
          });
      });
    });
  }

  makeFilePrivate(referenceName) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const blob = storage.file(referenceName.replace(/ /g, '_'));
      const metaData = await blob.getMetadata();
      await blob.makePrivate(async function () {
        if (
          metaData[0].contentType ===
          'application/x-www-form-urlencoded;charset=UTF-8'
        ) {
          const files = await db.getDocs('acsys_storage_items', {
            where: [['parent', '=', referenceName]],
          });
          files.forEach(async (file) => {
            const fileBlob = storage.file(file.id.replace(/ /g, '_'));
            await fileBlob.makePrivate(async function () {
              await db.update('acsys_storage_items', { isPublic: false }, [
                ['id', '=', file.id],
              ]);
            });
          });
        }
        await db
          .update('acsys_storage_items', { isPublic: false }, [
            ['id', '=', referenceName],
          ])
          .then(() => {
            resolve(true);
          })
          .catch(() => {
            resolve(false);
          });
      });
    });
  }

  deleteFile(referenceName) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      const blob = storage.file(referenceName.replace(/ /g, '_'));
      await storage.getFiles(
        {
          prefix: referenceName,
        },
        async function (err, files) {
          for (let i = 0; i < files.length; i += 1) {
            files[i].delete(
              await db.deleteDocs('acsys_storage_items', [
                ['id', '=', referenceName],
              ])
            );
          }
          await blob.delete(async function () {
            await db
              .deleteDocs('acsys_storage_items', [['id', '=', referenceName]])
              .then(() => {
                resolve(true);
              })
              .catch(() => {
                resolve(false);
              });
          });
        }
      );
    });
  }
}

module.exports = StorageDriver;

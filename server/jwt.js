const expressJwt = require('express-jwt');
const fs = require('fs');
const uniquid = require('../src/utils/uniquid');
const configFile = 'server/config/config.json';
let secret = 'default-key';
const algorithms = ['sha1', 'RS256', 'HS256'];

function jwt() {
  try {
    if (process.env.API_SECRET !== undefined) {
      secret = process.env.API_SECRET;
    } else {
      if (process.env.DATABASE_TYPE === undefined) {
        if (!fs.existsSync(configFile)) {
          const key = uniquid();
          fs.writeFileSync(
            configFile,
            JSON.stringify({ secret: key }).replace(/\\\\/g, '\\')
          );
        }
        const data = fs.readFileSync(configFile, {
          encoding: 'utf8',
          flag: 'r',
        });
        secret = JSON.parse(data).secret;
      }
    }
  } catch (error) {}
  return expressJwt({ secret, algorithms }).unless({
    path: [
      // public routes that don't require authentication
      '/api/hasAdmin',
      '/api/register',
      '/api/getDefaultUsername',
      '/api/getDefaultPassword',
      '/api/sendResetLink',
      '/api/resetPassword',
      '/api/authenticate',
      '/api/isConnected',
      '/api/setInitialLocalDatabaseConfig',
      '/api/setInitialFirestoreConfig',
      '/api/setInitialMysqlConfig',
      '/api/readOpenData',
      '/api/readOpenPage',
      '/api/insertOpenData',
      '/api/updateOpenData',
      '/api/deleteOpenData',
      '/api/getFile',
    ],
  });
}

module.exports = jwt;

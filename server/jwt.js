const expressJwt = require('express-jwt');
const fs = require('fs');
const uniquid = require('uniqid');
const configFile = 'server/config/config.json';
let secret = 'default-key';

function jwt() {
  const key = uniquid();
  try {
    if (!fs.existsSync(configFile)) {
      fs.writeFileSync(
        configFile,
        JSON.stringify({"secret": key}).replace(/\\\\/g, '\\')
      );
    }
    const data = fs.readFileSync(configFile, {encoding:'utf8', flag:'r'});
    secret = JSON.parse(data).secret;
  }
  catch (error) {

  }
  return expressJwt({ secret }).unless({
    path: [
      // public routes that don't require authentication
      '/api/hasAdmin',
      '/api/register',
      '/api/sendResetLink',
      '/api/resetPassword',
      '/api/authenticate',
      '/api/isConnected',
      '/api/setInitialLocalDatabaseConfig',
      '/api/setInitialFirestoreConfig',
      '/api/setInitialMysqlConfig',
      '/api/readOpenData',
      '/api/insertOpenData',
      '/api/updateOpenData',
      '/api/deleteOpenData',
      '/api/getFile',
    ],
  });
}

module.exports = jwt;

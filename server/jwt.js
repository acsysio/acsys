const expressJwt = require('express-jwt');
const config = require('./config/config.json');

function jwt() {
  const { secret } = config;
  return expressJwt({ secret }).unless({
    path: [
      // public routes that don't require authentication
      '/api/hasAdmin',
      '/api/register',
      '/api/sendResetLink',
      '/api/resetPassword',
      '/api/authenticate',
      '/api/isConnected',
      '/api/setInitialDatabaseConfig',
      '/api/readOpenData',
      '/api/insertOpenData',
      '/api/updateOpenData',
      '/api/deleteOpenData',
    ],
  });
}

module.exports = jwt;

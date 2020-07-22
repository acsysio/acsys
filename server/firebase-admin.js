const admin = require('firebase-admin');

class FBAdmin {
  // eslint-disable-next-line class-methods-use-this
  getAdmin(dataConfig) {
    admin.initializeApp(JSON.parse(dataConfig));
    return admin;
  }
}

module.exports = FBAdmin;

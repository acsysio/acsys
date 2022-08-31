let ppid = '';
let pid = '';
let address = '';
let mac = '';
let networkInterfaces;
let os = require('os');

ppid =
  typeof process !== 'undefined' && process.ppid
    ? process.ppid.toString(20)
    : '';

pid =
  typeof process !== 'undefined' && process.pid ? process.pid.toString(20) : '';

if (os.networkInterfaces) {
  networkInterfaces = os.networkInterfaces();
}

if (networkInterfaces) {
  for (let index in networkInterfaces) {
    const networkInterface = networkInterfaces[index];
    const length = networkInterface.length;
    for (let i = 0; i < length; i++) {
      if (
        networkInterface[i] !== undefined &&
        networkInterface[i].mac &&
        networkInterface[i].mac != '00:00:00:00:00:00'
      ) {
        mac = networkInterface[i].mac;
        break;
      }
    }
  }
  address = mac ? parseInt(mac.replace(/\:|\D+/gi, '')).toString(32) : '';
}

module.exports = module.exports.default = function (prefix) {
  return (
    (prefix ? prefix : '') + Date.now().toString(20) + address + ppid + pid
  );
};

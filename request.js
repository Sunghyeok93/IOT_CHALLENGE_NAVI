const request = require('request');

module.exports = (option = { encoding: null }) =>
  new Promise((resolve, reject) => {
    request(option, (err, response, body) => {
      if (err) return reject(err);
      return resolve(body);
    });
  });

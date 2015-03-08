// Author: Christopher Rankin
// TODO: I'm sure the connection pooling here is goign to cause a problem need to figure out a better way to handle connections.

var conf = require('../config/database.js');

module.exports = function() {
  var db = require('knex')(conf);

  return function *database(next) {
    this.database = db;
    yield next;
  };
};

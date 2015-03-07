// Author: Christopher Rankin
// TODO: I'm sure the connection pooling here is goign to cause a problem need to figure out a better way to handle connections.
module.exports = function() {
  var db = require('knex')({
    client: 'pg',
    connection: {
      host: 'localhost',
      user: '',
      password: '',
      database: ''
    }
  });

  return function *database(next) {
    this.database = db;
    yield next;
  };
};

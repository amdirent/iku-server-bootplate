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
    this.pangea_api = db;
    yield next;
  };
};

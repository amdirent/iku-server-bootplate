var auth = require('basic-auth');

require('../lib/string');

function validateAuthToken(callback) {
  var that = this;
  this.user = auth(this);

  if (!this.user) { this.throw(401); }; // Send response message
  // Transform the user name(auth token) into UUID format then lookup in DB.
  this.user.name = this.user.name.insertCharAtIndeces('-', [8, 13, 18, 23]);

  this.database('accounts').where('auth_token', this.user.name)
  .exec(function(err, records) {
    if (err || records.length === 0) {
      if (err) { console.log(err); }
      callback(null, false); 
    } else {
      that.account = records[0];
      callback(null, true); 
    }
  });
};

module.exports = function *authenticate(next) {
  // Lookup user credentail in the database
  var valid = yield validateAuthToken;

  if (!this.user || !valid) {
    this.throw(401, 'Valid API key not provided.');
  } else {
    yield next;
  }
};

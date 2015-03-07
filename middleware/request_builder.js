//var parse = require('co-body');

module.exports = function *requestBuilder(next) {
  var that = this;
  this.data = this.request.body || {};
  this.table = this.params.table;

  if (!this.table) {
    // This conditional needs to be re-written as a regex to match any version.
    if (this.originalUrl === '/v1/accounts') {
      this.table = 'accounts';  
    } else {
      this.throw(401); // Need to create a more accurate error message here.
    }
  }

  if(this.account) {
    this.data.account_id = this.account.id;

    // Throw unauthorized if trying to access another accounts information
    if (this.table === 'accounts') {
      if (this.params) {
        if (parseInt(this.params.id) !== parseInt(this.data.account_id)) {
          this.throw(401);
        }
      }
    }
  }

  yield next;
};

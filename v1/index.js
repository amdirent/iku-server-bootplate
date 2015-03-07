// Author: Christopher Rankin
// TODO: Pretty print by default
// TODO: All request/responses should be application/json
var moment  = require('moment');

var scope = function (ctx) {
 var query = {id: ctx.params.id};

 if (ctx.table === 'accounts') {
   query.auth_token = ctx.account.auth_token;
 } else {
   query.account_id = ctx.account.id;
 } 

 return query;
};

var v1 = {
  // CREATE
  create: function *(next) {
    var that = this;

    var insertRecord = function(callback) {
      that.data.created_at = moment().format();
      that.database.insert(that.data)
      .returning('id')
      .into(that.table)
      .then(function(ids) { callback(null, ids[0]); })
      .catch(function(err) { that.throw(500, err); });
    };

    this.record_id = yield insertRecord;
    
    yield next;

    this.set('Location', '/v1/' + this.table + '/' + this.record_id);
    this.status = 201;
    this.body = true;
  },
  
  // READ
  read: function *(next) {
    var that = this;

    var getRecords = function(callback) {
      if (that.params.id) {
        var sqlQuery = {'id': that.params.id};
        if (that.table !== 'accounts') { sqlQuery.account_id = that.account.id; }
        if(that.query.user && that.table == 'queues') {
          sqlQuery.username = that.query.user;
          that.database(that.table).select(that.database.raw("queues.*, array_agg(distributions.item_id) as user_item_ids"))
            .where(sqlQuery)
            .join('distributions', 'queue_id', '=', 'id')
            .groupBy('id')
            .then(function(records) { callback(null, records[0]); })
            .catch(function(err) { that.throw(500, err); });
        } else {
          that.database(that.table).select()
            .where(sqlQuery)
            .then(function(records) { callback(null, records[0]); })
            .catch(function(err) { that.throw(500, err); });
        }
      } else {
        if(that.query.user && that.table == 'queues') {
          var sqlQuery = {'username': that.query.user};
          that.database(that.table).select(that.database.raw("queues.*, array_agg(distributions.item_id) as user_item_ids"))
            .where(sqlQuery)
            .join('distributions', 'queue_id', '=', 'id')
            .groupBy('id')
            .then(function(records) { callback(null, records); })
            .catch(function(err) { that.throw(500, err); });
        }
        else {
          that.database(that.table).select()
            .then(function(records) { callback(null, records); })
            .catch(function(err) { that.throw(500, err); });
        }
      }
    }; 

    this.records = yield getRecords;
    
    yield next;
    
    this.set('Content-Type', 'application/json');
    this.status = 200;
    this.body = JSON.stringify(this.records, null, '\t');
  },

  // UPDATE  
  update: function *() {
    var that = this;

    var updateRecord = function(callback) {
      var sqlQuery = scope(that); 

      that.data.updated_at = moment().format();
      that.database(that.table).select()
      .where(sqlQuery)
      .update(that.data)
      .returning('*')
      .then(function(record) { callback(null, record[0]); })
      .catch(function(error) { that.throw(500, error); });
    };

    var updatedRecord = yield updateRecord;
    this.set('Content-Type', 'application/json');
    this.status = 200;
    this.body = JSON.stringify(updatedRecord, null, '\t');
  },

  // DELETE
  delete: function *() {
    var that = this;
    var deleteRecord = function(callback) {
      var sqlQuery = scope(that);
      this.database(this.table)
      .where(sqlQuery)
      .del()
      .then(function() { callback(null, true); })
      .catch(function(error) { that.throw(500, error); });
    };

    yield deleteRecord;
  
    this.status = 204;
    this.body = '';
  }   

};

module.exports = v1;

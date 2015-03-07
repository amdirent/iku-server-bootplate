var _ = require('lodash');

function buildQuery(callback) {
  var that  = this,
      // If no records we're coming from a post
      queues  = this.records ? this.records : this.data,
      operators = {
        EQUALS:       '=',
        NOT_EQUALS:   '!=',
        LESS_THAN:    '<',
        AT_MOST:      '<=',
        GREATER_THAN: '>',
        AT_LEAST:     '>='
      },
      constructedQuerys = [];

  // Always operate on an array
  if(!Array.isArray(queues)){
    queues = [queues];
  }

  _.forEach(queues, function(queue, index) {
    var query = queue.query;
    if(query) {
      var params = _.flatten(
        _.map(query.query, function (clause, attr) {
          return _.map(clause, function (operand, operator) {
            return {
              attribute: attr,
              operator: operators[operator],
              value: operand
            };
          });
        })
      ),
      constructedQuery = that.pangea_api.select().from(query.business_object),
      param1 = params.shift();
      constructedQuery = constructedQuery.where(param1.attribute, param1.operator, param1.value);

      _.forEach(params, function(param) {
        constructedQuery = constructedQuery.andWhere(param.attribute, param.operator, param.value);
      });

      if(queue.user_item_ids) {
        constructedQuery = constructedQuery.andWhere('id', 'in', queue.user_item_ids);
      }

      constructedQuerys.push("(select json_agg(s.*) from (" + constructedQuery.toString() + ") as s) as q" + index);
    }
  });

  if(constructedQuerys.length) {
    var sql = "SELECT " + constructedQuerys.join();
    that.pangea_api.raw(sql)
      .then(function(records) {
        if(records.rows.length) {
          callback(null, records.rows[0]);
        }
      })
      .catch(function(err) { that.throw(500, err); });
  } else {
    callback(null, false);
  }
}

module.exports = function *queryBuilder(next) {
  var items = yield buildQuery;

  // Always operate on an array
  if(!Array.isArray(this.records)){
    this.records = [this.records];
  }
  
  _.forEach(this.records, function(record, index) {
    record.items = items['q' + index];
  });
  
  // If single item send back as obj
  if(this.records.length == 1) {
    this.records = this.records[0];
  }
  
  yield next;
};

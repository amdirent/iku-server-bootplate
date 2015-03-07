var _ = require('lodash'),
    buildQuery = require('./query_builder');
_.mixin(require('congruence'));
_.mixin({
  isDefined: function(x) {
    return !_.isUndefined(x);
  },
  isValidDate: function(x) { 
    return _.isDate(x) && !_.isNaN(x.getTime()); 
  },
  isFiniteOrDate: function(x) {
    return _.isFinite(x) || _.isValidDate(new Date(x));
  }
});
function validateQuery(callback) {
  var that = this,
      query = that.data.query,
      template = {
          "assignees": _.isArray,
          "business_object": _.isString,
          "query": function(list){
            var rules = [
              { EQUALS:        _.isDefined },
              { NOT_EQUALS:    _.isDefined },
              { GREATER_THAN:  _.isFiniteOrDate},
              { AT_LEAST:      _.isFiniteOrDate},
              { LESS_THAN:     _.isFiniteOrDate},
              { AT_MOST:       _.isFiniteOrDate}
            ];
            return _.every(list, function(object) {
              return _.some(rules, function(rule) {
                return _.similar(rule,object);
              });
            });
          }
        };

  callback(null, _.congruent(template, query));
}

module.exports = function *queryValidator(next) {
  var valid = yield validateQuery;

  if(!valid) {
    this.throw(400, "Not a valid Query.");
  } else {
    yield next;
  }
};

var _ = require('lodash');
module.exports = function *entityFetcher(next) {
  var that = this,
      entity = that.params.entity,
      entityId = that.params.entityId,
      matchedEntity = that.records[entity] ? that.records[entity] : that.records.query[entity];

  if(entityId) {
    matchedEntity = _.find(matchedEntity, function(obj) { 
      return obj.id == entityId;
    });
  }

  this.records = matchedEntity;
  yield next;
};

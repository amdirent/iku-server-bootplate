var buildQuery = require('./query_builder');
module.exports = function *distributionBuilder(next) {
  var that = this,
      queue_id = that.record_id,
      users = that.data.query.assignees;

  var queue = yield buildQuery;
  var items = queue.items;

  //for each item
  //insert record into db with user and queue_id
  var itemsIndex = 0,
      userIndex = 0;

  while (itemsIndex < items.length) {
    that.database('distributions')
      .insert({
        queue_id: queue_id,
        item_id: items[itemsIndex].id,
        username: users[userIndex]
      })
      .then(function() { console.log("Inserted Record"); })
      .catch(function(err){ that.throw(500, err); });

    //increase indices
    //userIndex becomes 0 once it reaches the end of the array.
    //And iteration begins all over.
    userIndex = (userIndex + 1) % users.length;
    itemsIndex += 1;
  }

  yield next;
};

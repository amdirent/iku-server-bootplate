'use strict';

exports.up = function(knex, Promise) {
  knex.schema.createTable('distributions', function(table) {
    table.comment("Distributions to dispatch relations between assignees and queue items.");
    table.integer('queue_id');
    table.integer('item_id');
    table.string('username');
  })
  .catch(function(error) {
    console.log(error);
  });    
};

exports.down = function(knex, Promise) {
 knex.schema.dropTableIfExists('distributions')
 .catch(function(e) { console.log(e); });   
};

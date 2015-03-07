'use strict';

exports.up = function(knex, Promise) {
  knex.schema.createTable('queues', function(table) {
    table.comment("Queues to hold instances of Business Objects for dispatching.");
    table.increments();
    table.string('name');
    table.string('description');
    table.json('query');
    table.integer('account_id');
    table.timestamps();
  })
  .catch(function(error) {
    console.log(error);
  });  
};

exports.down = function(knex, Promise) {
 knex.schema.dropTableIfExists('queues')
 .catch(function(e) { console.log(e); }); 
};

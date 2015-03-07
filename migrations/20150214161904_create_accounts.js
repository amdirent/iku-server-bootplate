'use strict';

exports.up = function(knex, Promise) {
  console.log("WARNING: YOU MUST MANUALLY ADD \"uuid-ossp\" extension.");
  knex.schema.createTable('accounts', function(table) {
    table.comment("Organization accounts details to namespace records.");
    table.increments();
    table.string('organization');
    table.string('contact');
    table.string('email').unique();
    table.string('phone');
    table.uuid('auth_token').notNullable().defaultTo(knex.raw('uuid_generate_v4()'));
    table.timestamps();
  })
  .catch(function(error) {
    console.log(error);
  });    
};

exports.down = function(knex, Promise) {
 knex.schema.dropTableIfExists('accounts')
 .catch(function(e) { console.log(e); }); 
};

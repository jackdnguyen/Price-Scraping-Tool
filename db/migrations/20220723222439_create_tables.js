/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
    .createTable('canAppl', function(table) {
        table.increments('id').primary()
        table.text('company_name').notNullable()
        table.text('sku').notNullable()
        table.text('name').notNullable()
        table.float('price').notNullable()
        table.text('url').notNullable()
        table.text('lpmod').notNullable()
        // table.timestamp('created_at').defaultTo(knex.fn.now())
        // table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
    .createTable('goemans', function(table) {
        table.increments('id').primary()
        table.text('company_name').notNullable()
        table.text('sku').notNullable()
        table.text('name').notNullable()
        table.float('price').notNullable()
        table.text('url').notNullable()
        table.text('lpmod').notNullable()
        // table.timestamp('created_at').defaultTo(knex.fn.now())
        // table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
    .createTable('midAppl', function(table) {
        table.increments('id').primary()
        table.text('company_name').notNullable()
        table.text('sku').notNullable()
        table.text('name').notNullable()
        table.float('price').notNullable()
        table.text('url').notNullable()
        table.text('lpmod').notNullable()
        // table.timestamp('created_at').defaultTo(knex.fn.now())
        // table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
    .createTable('coastAppl', function(table){
        table.increments('id').primary()
        table.text('company_name').notNullable()
        table.text('sku').notNullable()
        table.text('name').notNullable()
        table.float('price').notNullable()
        table.text('url').notNullable()
        table.text('lpmod').notNullable()
        // table.timestamp('created_at').defaultTo(knex.fn.now())
        // table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return  knex.schema.dropTable('canAppl').dropTable('goemans').dropTable('midAppl').dropTable('coastAppl')
};

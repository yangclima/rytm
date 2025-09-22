/* eslint-disable no-unused-vars */
// MOCK MIGRATION

exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },

    username: {
      type: 'varchar(50)',
      notNull: true,
    },

    email: {
      type: 'varchar(50)',
      notNull: true,
      unique: true,
    },

    password: {
      type: 'varchar(60)',
      notNull: true,
    },
  });
};

exports.down = (pgm) => false;

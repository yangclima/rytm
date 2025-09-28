/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('email_confirmation_tokens', {
    token: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },

    user_id: {
      type: 'uuid',
      notNull: true,
    },

    email: {
      type: 'varchar(50)',
      notNull: true,
    },

    expires_at: {
      type: 'timestamptz',
      notNull: true,
    },

    used_at: {
      type: 'timestamptz',
      notNull: false,
    },
  });
};

exports.down = false;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createType('status', ['active', 'pending', 'banned']);

  pgm.addColumn('users', {
    status: {
      type: 'status',
      notNull: true,
      default: 'pending',
    },
  });
};

exports.down = false;

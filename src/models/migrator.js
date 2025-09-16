import migrationRunner from 'node-pg-migrate';
import { resolve } from 'node:path';
import database from 'infra/database';

const defaultMigrationOptions = {
  dryRun: true,
  direction: 'up',
  dir: resolve('src', 'infra', 'migrations'),
  migrationsTable: 'pgmigrations',
};

async function listPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    });

    return pendingMigrations;
  } finally {
    dbClient.end();
  }
}

async function runPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    });

    return migratedMigrations;
  } finally {
    dbClient.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;

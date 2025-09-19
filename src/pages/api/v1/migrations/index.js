import migrator from 'models/migrator';
import controller from 'infra/controller';
import { createRouter } from 'next-connect';

async function getHandler(req, res) {
  const pendingMigrations = await migrator.listPendingMigrations();

  const status = 200;
  const response = { pending_migrations: pendingMigrations };

  return res.status(status).json(response);
}

async function postHandler(req, res) {
  const migratedMigrations = await migrator.runPendingMigrations();

  const status = migratedMigrations.length === 0 ? 200 : 201;
  const response = { migrated_migrations: migratedMigrations };

  return res.status(status).json(response);
}

const migrationsRouter = createRouter();

migrationsRouter.get(getHandler);
migrationsRouter.post(postHandler);

export default migrationsRouter.handler(controller.errorHandler);

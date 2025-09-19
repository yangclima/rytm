import controller from 'infra/controller';
import database from 'infra/database';
import { createRouter } from 'next-connect';

async function getHandler(req, res) {
  const updatedAt = new Date().toISOString();

  const databaseVersionResult = await database.query('SHOW server_version');
  const databaseVersion = databaseVersionResult[0].server_version;

  const maxConnectionsResult = await database.query('SHOW max_connections');
  const maxConnections = maxConnectionsResult[0].max_connections;

  const databaseName = process.env.POSTGRES_DB;
  const openedConnectionsResult = await database.query({
    text: 'SELECT COUNT(*)::int FROM pg_stat_activity WHERE datname = $1',
    values: [databaseName],
  });
  const openedConnections = openedConnectionsResult[0].count;

  const status = 200;
  const response = {
    updated_at: updatedAt,
    dependencies: {
      database: {
        version: databaseVersion,
        max_connections: Number(maxConnections),
        opened_connections: Number(openedConnections),
      },
    },
  };

  return res.status(status).json(response);
}

const statusRouter = createRouter();

statusRouter.get(getHandler);

export default statusRouter.handler(controller.errorHandler);

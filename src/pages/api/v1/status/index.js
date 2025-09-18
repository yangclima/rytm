import database from 'infra/database';
import { InternalServerError } from 'infra/errors';

async function statusRouter(req, res) {
  try {
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

    return res.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersion,
          max_connections: Number(maxConnections),
          opened_connections: Number(openedConnections),
        },
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({ cause: error });

    console.error(publicErrorObject);

    return res.status(publicErrorObject.status).json(publicErrorObject);
  }
}

export default statusRouter;

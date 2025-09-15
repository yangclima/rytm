import { NextResponse } from 'next/server';
import database from 'infra/database';

export async function GET() {
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

  return NextResponse.json(
    {
      updated_at: updatedAt,
      dependencies: {
        database: {
          version: databaseVersion,
          max_connections: Number(maxConnections),
          opened_connections: Number(openedConnections),
        },
      },
    },
    { status: 200 },
  );
}

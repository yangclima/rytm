import { Client } from 'pg';
import { ServiceError } from './errors';

function getSSLValues() {
  if (process.env.POSTGRES_CA) {
    return {
      ca: process.env.POSTGRES_CA,
    };
  }

  return process.env.NODE_ENV === 'production' ? true : false;
}

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    user: process.env.POSTGRES_USER,
    ssl: getSSLValues(),
  });

  await client.connect();

  return client;
}

async function query(queryObject) {
  let client;

  try {
    client = await getNewClient();
    const result = await client.query(queryObject);
    return result.rows;
  } catch (error) {
    const errorObject = new ServiceError({ cause: error });
    throw errorObject;
  } finally {
    client.end();
  }
}

const database = {
  query,
  getNewClient,
};

export default database;

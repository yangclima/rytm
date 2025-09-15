import { Client } from 'pg';

async function getNewClient() {
  const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    user: process.env.POSTGRES_USER,
  });

  await client.connect();

  return client;
}

async function query(queryObject) {
  const client = await getNewClient();

  try {
    const result = await client.query(queryObject);
    return result.rows;
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    client.end();
  }
}

const database = {
  query,
  getNewClient,
};

export default database;

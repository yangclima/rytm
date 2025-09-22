import retry from 'async-retry';
import { faker } from '@faker-js/faker';
import database from 'infra/database';
import migrator from 'models/migrator';
import user from 'models/user';

async function waitForAllServices() {
  async function waitForWebServer() {
    async function fetchStatusPage() {
      const response = await fetch('http://localhost:3000/api/v1/status');

      if (response.status !== 200) {
        throw Error();
      }
    }

    return retry(fetchStatusPage, { retries: 100, maxTimeout: 1000 });
  }

  await waitForWebServer();
}

async function clearDatabase() {
  await database.query('DROP SCHEMA public cascade; CREATE SCHEMA public');
}

async function runPendinMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userInfo) {
  const newUser = {};

  newUser.username = userInfo?.username || faker.internet.username();
  newUser.email = userInfo?.email || faker.internet.email();
  newUser.password = userInfo?.password || '5tr0ngP4ssw0rd';

  return await user.create(newUser);
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendinMigrations,
  createUser,
};

export default orchestrator;

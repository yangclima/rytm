import crypto from 'node:crypto';
import retry from 'async-retry';
import { faker } from '@faker-js/faker';
import database from 'infra/database';
import migrator from 'models/migrator';
import session from 'models/session';
import user from 'models/user';

const emailHttpUrl = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

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

  async function waitForEmailServer() {
    async function fetchInboxPage() {
      const response = await fetch(emailHttpUrl);

      if (response.status !== 200) {
        throw Error();
      }
    }

    return retry(fetchInboxPage, { retries: 100, maxTimeout: 1000 });
  }

  await waitForWebServer();
  await waitForEmailServer();
}

async function clearDatabase() {
  await database.query('DROP SCHEMA public cascade; CREATE SCHEMA public');
}

async function clearEmailBox() {
  await fetch(`${emailHttpUrl}/messages`, {
    method: 'DELETE',
  });
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailHttpUrl}/messages`);
  const emailListBody = await emailListResponse.json();
  const lastEmailItem = emailListBody.pop();

  const emailTextResponse = await fetch(
    `${emailHttpUrl}/messages/${lastEmailItem.id}.plain`,
  );
  const emailTextBody = await emailTextResponse.text();

  lastEmailItem.text = emailTextBody;
  return lastEmailItem;
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

async function createActivationToken(userId, expiresAt) {
  const [confirmationToken] = await database.query({
    text: `
    INSERT INTO 
      email_confirmation_tokens(user_id, expires_at)
    VALUES
      ($1, $2)
    RETURNING
      *
    `,
    values: [userId, expiresAt],
  });

  return confirmationToken;
}

async function createSession(sessionInfo) {
  const token = crypto.randomBytes(48).toString('hex');

  const userId = sessionInfo?.userId;
  const expiresAt =
    sessionInfo?.expiresAt ||
    new Date(Date.now() + session.EXPIRATION_IN_MILISECONDS);

  const [newSession] = await database.query({
    text: `
      INSERT INTO 
        sessions(token, user_id, expires_at)
      VALUES
        ($1, $2, $3)
      RETURNING 
        *
      `,
    values: [token, userId, expiresAt],
  });

  return newSession;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendinMigrations,
  createUser,
  createSession,
  clearEmailBox,
  getLastEmail,
  createActivationToken,
};

export default orchestrator;

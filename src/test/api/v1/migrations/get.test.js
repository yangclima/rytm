import database from 'infra/database';
import orchestrator from 'test/orchestrator.js';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query('DROP SCHEMA public cascade; CREATE SCHEMA public;');
});

test('GET to /api/v1/migrations', async () => {
  const response = await fetch('http://localhost:3000/api/v1/migrations');
  const responseBody = await response.json();

  const pendingMigrations = responseBody.pending_migrations;
  const isArray = Array.isArray(pendingMigrations);
  expect(isArray).toBeTruthy();

  expect(pendingMigrations.length).toBeGreaterThan(0);
});

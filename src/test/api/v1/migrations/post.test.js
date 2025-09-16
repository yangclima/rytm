import database from 'infra/database';
import orchestrator from 'test/orchestrator.js';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query('DROP SCHEMA public cascade; CREATE SCHEMA public;');
});

test('POST to /api/v1/migrations', async () => {
  const response1 = await fetch('http://localhost:3000/api/v1/migrations', {
    method: 'POST',
  });
  const responseBody1 = await response1.json();

  const migratedMigrations1 = responseBody1.migrated_migrations;
  const isArray1 = Array.isArray(migratedMigrations1);
  expect(isArray1).toBeTruthy();

  expect(migratedMigrations1.length).toBeGreaterThan(0);

  const response2 = await fetch('http://localhost:3000/api/v1/migrations', {
    method: 'POST',
  });
  const responseBody2 = await response2.json();

  const migratedMigrations2 = responseBody2.migrated_migrations;
  const isArray2 = Array.isArray(migratedMigrations2);
  expect(isArray2).toBeTruthy();

  expect(migratedMigrations2.length).toBe(0);
});

import orchestrator from 'test/orchestrator.js';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe('POST /api/v1/migrations', () => {
  describe('Anonymous user', () => {
    describe('Running pending migrations', () => {
      test('for the first time', async () => {
        const response = await fetch(
          'http://localhost:3000/api/v1/migrations',
          {
            method: 'POST',
          },
        );
        const responseBody = await response.json();

        expect(response.status).toBe(201);

        const migratedMigrations = responseBody.migrated_migrations;
        const isArray = Array.isArray(migratedMigrations);
        expect(isArray).toBeTruthy();

        expect(migratedMigrations.length).toBeGreaterThan(0);
      });

      test('for the second time', async () => {
        const response = await fetch(
          'http://localhost:3000/api/v1/migrations',
          {
            method: 'POST',
          },
        );
        const responseBody = await response.json();

        expect(response.status).toBe(200);

        const migratedMigrations = responseBody.migrated_migrations;
        const isArray = Array.isArray(migratedMigrations);
        expect(isArray).toBeTruthy();

        expect(migratedMigrations.length).toBe(0);
      });
    });
  });
});

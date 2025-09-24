import orchestrator from 'test/orchestrator.js';

const baseUrl = 'http://localhost:3000/api/v1/users';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendinMigrations();
});

describe('GET /api/v1/users/:id', () => {
  describe('Anonymous user', () => {
    test('With invalid UUID format', async () => {
      const response = await fetch(`${baseUrl}/123`, { method: 'GET' });
      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body.error.name).toBe('ValidationError');
    });

    test('With non-existing user id', async () => {
      const response = await fetch(
        `${baseUrl}/00000000-0000-1000-8000-000000000000`,
        { method: 'GET' },
      );
      const body = await response.json();
      expect(response.status).toBe(404);
      expect(body).toHaveProperty('error');
      expect(body.error.name).toBe('NotFoundError');
    });

    test('With existing user id', async () => {
      const createdUser = await orchestrator.createUser();

      const response = await fetch(`${baseUrl}/${createdUser.id}`, {
        method: 'GET',
      });
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('email');
      expect(body).toHaveProperty('username');
      expect(body.id).toBe(createdUser.id);
      expect(body).toMatchObject({
        email: createdUser.email,
        username: createdUser.username,
      });
    });
  });
});

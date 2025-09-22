import orchestrator from 'test/orchestrator.js';

const baseUrl = 'http://localhost:3000/api/v1/users';
let createdUser;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendinMigrations();

  const createResponse = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'getuser@example.com',
      username: 'getuser',
      password: 'Str0ngP@ss1',
    }),
  });
  createdUser = await createResponse.json();
});

describe('GET /api/v1/users/:id', () => {
  describe('Anonymous user', () => {
    test('With invalid UUID format', async () => {
      const response = await fetch(`${baseUrl}/123`, { method: 'GET' });
      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body.error.name).toBe('BadRequestError');
    });

    test('With non-existing user id', async () => {
      const response = await fetch(
        `${baseUrl}/00000000-0000-0000-0000-000000000000`,
        { method: 'GET' },
      );
      const body = await response.json();
      expect(response.status).toBe(404);
      expect(body).toHaveProperty('error');
      expect(body.error.name).toBe('NotFoundError');
    });

    test('With existing user id', async () => {
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
        email: 'getuser@example.com',
        username: 'getuser',
      });
    });
  });
});

import orchestrator from 'test/orchestrator.js';

const baseUrl = 'http://localhost:3000/api/v1/users';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendinMigrations();
});

describe('POST /api/v1/users', () => {
  describe('Anonymous user', () => {
    describe('Creating a new user', () => {
      test('Without a body', async () => {
        const response = await fetch(baseUrl, { method: 'POST' });
        const responseBody = await response.json();
        expect(response.status).toBe(400);
        expect(responseBody).toHaveProperty('error');
        const error = responseBody.error;
        expect(error.name).toBe('BadRequestError');
      });

      test('Without one required field', async () => {
        const response = await fetch(baseUrl, {
          method: 'POST',
          body: JSON.stringify({
            email: 'example@example.com',
            password: 'myP4ssw0rd',
          }),
        });
        const responseBody = await response.json();
        expect(response.status).toBe(400);
        expect(responseBody).toHaveProperty('error');
        const error = responseBody.error;
        expect(error.name).toBe('BadRequestError');
      });

      test('With invalid field data type', async () => {
        const response = await fetch(baseUrl, {
          method: 'POST',
          body: JSON.stringify({
            email: 1,
            username: 2,
            password: 3,
          }),
        });
        const responseBody = await response.json();
        expect(response.status).toBe(400);
        expect(responseBody).toHaveProperty('error');
        const error = responseBody.error;
        expect(error.name).toBe('BadRequestError');
      });

      test('With invalid email format', async () => {
        const response = await fetch(baseUrl, {
          method: 'POST',
          body: JSON.stringify({
            email: 'invalid-email',
            username: 'validuser',
            password: 'Str0ngP@ss',
          }),
        });

        const responseBody = await response.json();

        expect(response.status).toBe(400);
        expect(responseBody).toHaveProperty('error');
        expect(responseBody.error.name).toBe('BadRequestError');
      });

      test('With valid data', async () => {
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'validemail@example.com',
            username: 'validuser',
            password: 'ValidP4ssW0rd',
          }),
        });

        const responseBody = await response.json();
        expect(response.status).toBe(201);
        expect(responseBody).toHaveProperty('id');
        expect(responseBody).toMatchObject({
          email: 'validemail@example.com',
          username: 'validuser',
        });
      });

      test('With duplicate email', async () => {
        const payload = {
          email: 'dup@example.com',
          username: 'dupuser1',
          password: 'Str0ngP@ss2',
        };

        await fetch(baseUrl, {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        const response = await fetch(baseUrl, {
          method: 'POST',
          body: JSON.stringify({ ...payload, username: 'dupuser2' }),
        });

        const responseBody = await response.json();
        expect([400, 409]).toContain(response.status);
        expect(responseBody).toHaveProperty('error');
        expect(['ConflictError', 'BadRequestError']).toContain(
          responseBody.error.name,
        );
      });
    });
  });
});

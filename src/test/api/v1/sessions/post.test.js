import orchestrator from 'test/orchestrator.js';

const baseUrl = 'http://localhost:3000/api/v1/sessions';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendinMigrations();
});

describe('POST /api/v1/sessions', () => {
  describe('Anonymous user', () => {
    describe('Creating a new session', () => {
      test('Without a body', async () => {
        const response = await fetch(baseUrl, { method: 'POST' });
        const responseBody = await response.json();
        expect(response.status).toBe(400);
        expect(responseBody).toHaveProperty('error');
        const error = responseBody.error;
        expect(error.name).toBe('BadRequestError');
      });

      test('Without one required field (email)', async () => {
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password: 'myP4ssw0rd',
          }),
        });
        const responseBody = await response.json();
        expect(response.status).toBe(400);
        expect(responseBody).toHaveProperty('error');
        const error = responseBody.error;
        expect(error.name).toBe('BadRequestError');
      });

      test('Without one required field (password)', async () => {
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'example@example.com',
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 1,
            password: 2,
          }),
        });
        const responseBody = await response.json();
        expect(response.status).toBe(400);
        expect(responseBody).toHaveProperty('error');
        const error = responseBody.error;
        expect(error.name).toBe('BadRequestError');
      });

      test('With non-existing user', async () => {
        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'nonexistent@example.com',
            password: 'AnyPassword123',
          }),
        });
        const responseBody = await response.json();
        expect(response.status).toBe(401);
        expect(responseBody).toHaveProperty('error');
        const error = responseBody.error;
        expect(error.name).toBe('UnauthorizedError');
      });

      test('With valid email but wrong password', async () => {
        const createdUser = await orchestrator.createUser({
          email: 'testuser@example.com',
          password: 'CorrectPassword123',
        });

        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: createdUser.email,
            password: 'WrongPassword123',
          }),
        });
        const responseBody = await response.json();
        expect(response.status).toBe(401);
        expect(responseBody).toHaveProperty('error');
        const error = responseBody.error;
        expect(error.name).toBe('UnauthorizedError');
      });

      test('With valid credentials', async () => {
        const userPassword = 'ValidPassword123';
        const createdUser = await orchestrator.createUser({
          email: 'validuser@example.com',
          password: userPassword,
        });

        const response = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: createdUser.email,
            password: userPassword,
          }),
        });

        const responseBody = await response.json();
        expect(response.status).toBe(201);
        expect(responseBody).toHaveProperty('id');
        expect(responseBody).toHaveProperty('token');
        expect(responseBody).toHaveProperty('user_id', createdUser.id);
        expect(responseBody).toHaveProperty('expires_at');
        expect(responseBody).toHaveProperty('created_at');
        expect(responseBody).toHaveProperty('updated_at');

        const setCookieHeader = response.headers.get('set-cookie');
        expect(setCookieHeader).toContain('session_id=');
        expect(setCookieHeader).toContain('HttpOnly');
        expect(setCookieHeader).toContain('Path=/');
      });

      test('Creating multiple sessions for the same user', async () => {
        const userPassword = 'MultiSessionPass123';
        const createdUser = await orchestrator.createUser({
          email: 'multisession@example.com',
          password: userPassword,
        });

        const firstResponse = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: createdUser.email,
            password: userPassword,
          }),
        });

        const secondResponse = await fetch(baseUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: createdUser.email,
            password: userPassword,
          }),
        });

        const firstResponseBody = await firstResponse.json();
        const secondResponseBody = await secondResponse.json();

        expect(firstResponse.status).toBe(201);
        expect(secondResponse.status).toBe(201);
        expect(firstResponseBody.token).not.toBe(secondResponseBody.token);
        expect(firstResponseBody.user_id).toBe(secondResponseBody.user_id);
      });
    });
  });
});

import orchestrator from 'test/orchestrator.js';

const baseUrl = 'http://localhost:3000/api/v1/user';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendinMigrations();
});

describe('GET /api/v1/user', () => {
  describe('Anonymous user', () => {
    test('Without authentication', async () => {
      const response = await fetch(baseUrl, { method: 'GET' });
      const responseBody = await response.json();
      expect(response.status).toBe(401);
      expect(responseBody).toHaveProperty('error');
      const error = responseBody.error;
      expect(error.name).toBe('UnauthorizedError');
    });

    test('With invalid session cookie', async () => {
      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: {
          Cookie: 'session_id=invalidtoken',
        },
      });
      const responseBody = await response.json();
      expect(response.status).toBe(401);
      expect(responseBody).toHaveProperty('error');
      const error = responseBody.error;
      expect(error.name).toBe('UnauthorizedError');
    });

    test('With expired session cookie', async () => {
      const userPassword = 'TestPassword123';
      const createdUser = await orchestrator.createUser({
        email: 'expireduser@example.com',
        password: userPassword,
      });

      const expiredSession = await orchestrator.createSession({
        userId: createdUser.id,
        expiresAt: new Date(Date.now() - 1000 * 60 * 60),
      });

      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: {
          Cookie: `session_id=${expiredSession.token}`,
        },
      });

      const responseBody = await response.json();

      expect(response.status).toBe(401);
      expect(responseBody).toHaveProperty('error');
      const error = responseBody.error;
      expect(error.name).toBe('UnauthorizedError');
    });
  });
  describe('Authenticated user', () => {
    test('With valid session cookie', async () => {
      const userPassword = 'ValidPassword123';
      const createdUser = await orchestrator.createUser({
        email: 'validuser@example.com',
        password: userPassword,
        username: 'validuser',
      });

      const loginResponse = await fetch(
        'http://localhost:3000/api/v1/sessions',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: createdUser.email,
            password: userPassword,
          }),
        },
      );

      const cookies = loginResponse.headers.get('set-cookie');
      expect(loginResponse.status).toBe(201);

      const response = await fetch(baseUrl, {
        method: 'GET',
        headers: {
          Cookie: cookies,
        },
      });

      const responseBody = await response.json();
      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('id', createdUser.id);
      expect(responseBody).toHaveProperty('email', createdUser.email);
      expect(responseBody).toHaveProperty('username', createdUser.username);

      expect(responseBody).not.toHaveProperty('password');
      expect(responseBody).not.toHaveProperty('password_hash');
    });
  });
});

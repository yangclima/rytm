import orchestrator from 'test/orchestrator.js';

const baseUrl = 'http://localhost:3000/api/v1/sessions';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendinMigrations();
});

describe('DELETE /api/v1/sessions', () => {
  describe('Anonymous user', () => {
    test('Without authentication', async () => {
      const response = await fetch(baseUrl, { method: 'DELETE' });
      const responseBody = await response.json();
      expect(response.status).toBe(401);
      expect(responseBody).toHaveProperty('error');
      const error = responseBody.error;
      expect(error.name).toBe('UnauthorizedError');
    });

    test('With invalid session token', async () => {
      const response = await fetch(baseUrl, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer invalid_token_here',
        },
      });
      const responseBody = await response.json();
      expect(response.status).toBe(401);
      expect(responseBody).toHaveProperty('error');
      const error = responseBody.error;
      expect(error.name).toBe('UnauthorizedError');
    });

    test('With expired session token', async () => {
      const userPassword = 'TestPassword123';
      const createdUser = await orchestrator.createUser({
        email: 'expireduser@example.com',
        password: userPassword,
      });

      const expiredSession = await orchestrator.createSession({
        userId: createdUser.id,
        expiresAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      });

      const response = await fetch(baseUrl, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${expiredSession.token}`,
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
    test('With valid session token', async () => {
      const userPassword = 'ValidPassword123';
      const createdUser = await orchestrator.createUser({
        email: 'validuser@example.com',
        password: userPassword,
      });

      const loginResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createdUser.email,
          password: userPassword,
        }),
      });

      const cookies = loginResponse.headers.get('set-cookie');
      expect(cookies).toContain('session_id=');

      expect(loginResponse.status).toBe(201);

      const deleteResponse = await fetch(baseUrl, {
        method: 'DELETE',
        headers: {
          Cookie: cookies,
        },
      });

      expect(deleteResponse.status).toBe(200);

      const setCookieHeader = deleteResponse.headers.get('set-cookie');
      expect(setCookieHeader).toContain('session_id=invalid');
      expect(setCookieHeader).toContain('Max-Age=-1');
    });

    test('Session should be invalidated after deletion', async () => {
      const userPassword = 'TestInvalidation123';
      const createdUser = await orchestrator.createUser({
        email: 'invalidation@example.com',
        password: userPassword,
      });

      const loginResponse = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createdUser.email,
          password: userPassword,
        }),
      });

      const cookies = loginResponse.headers.get('set-cookie');
      expect(cookies).toContain('session_id=');

      const deleteResponse = await fetch(baseUrl, {
        method: 'DELETE',
        headers: {
          Cookie: cookies,
        },
      });

      expect(deleteResponse.status).toBe(200);

      const retryDeleteResponse = await fetch(baseUrl, {
        method: 'DELETE',
        headers: {
          Cookie: cookies,
        },
      });

      const responseBody = await retryDeleteResponse.json();
      expect(retryDeleteResponse.status).toBe(404);
      expect(responseBody).toHaveProperty('error');
      const error = responseBody.error;
      expect(error.name).toBe('NotFoundError');
    });
  });
});

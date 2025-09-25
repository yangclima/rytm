import orchestrator from 'test/orchestrator.js';

const baseUrl = 'http://localhost:3000/api/v1/activation';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendinMigrations();
  await orchestrator.clearEmailBox();
});

describe('GET /api/v1/activation', () => {
  describe('Anonymous user', () => {
    test('With invalid token', async () => {
      const invalidToken = 'invalid_token_123';
      const response = await fetch(`${baseUrl}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: invalidToken,
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(400);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error.name).toBe('ValidationError');
    });

    test('With empty token', async () => {
      const response = await fetch(`${baseUrl}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: '',
        }),
      });

      expect(response.status).toBe(400);
    });

    test('With non-existent token', async () => {
      const nonExistentToken = '00000000-0000-1000-8000-000000000000';
      const response = await fetch(`${baseUrl}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: nonExistentToken,
        }),
      });

      const responseBody = await response.json();

      expect(response.status).toBe(404);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error.name).toBe('NotFoundError');
    });

    test('With expired activation token', async () => {
      const userPassword = 'TestPassword123';
      const createdUser = await orchestrator.createUser({
        email: 'expiredactivation@example.com',
        password: userPassword,
        username: 'expireduser',
      });

      const actvationObject = await orchestrator.createActivationToken(
        createdUser.id,
        new Date(),
      );

      const response = await fetch(`${baseUrl}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: actvationObject.token,
        }),
      });
      const responseBody = await response.json();

      const secondEmail = await orchestrator.getLastEmail();

      expect(response.status).toBe(401);
      expect(responseBody).toHaveProperty('error');
      expect(responseBody.error.name).toBe('UnauthorizedError');

      // Email foi reenviado?
      expect(secondEmail.text.includes(createdUser.username)).toBeTruthy();
      expect(
        secondEmail.recipients[0].includes(createdUser.email),
      ).toBeTruthy();
    });

    test('With valid activation token', async () => {
      const userPassword = 'TestPassword123';
      const createdUser = await orchestrator.createUser({
        email: 'validactivation@example.com',
        password: userPassword,
        username: 'validuser',
      });

      const activationObject = await orchestrator.createActivationToken(
        createdUser.id,
        new Date(Date.now() + 1000 * 60 * 60 * 24),
      );

      const response = await fetch(`${baseUrl}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: activationObject.token,
        }),
      });
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(responseBody).toHaveProperty('id', createdUser.id);
      expect(responseBody).toHaveProperty('email', createdUser.email);
      expect(responseBody).toHaveProperty('username', createdUser.username);
      expect(responseBody).toHaveProperty('status', 'active');
    });

    test('With already used activation token', async () => {
      const userPassword = 'TestPassword123';
      const createdUser = await orchestrator.createUser({
        email: 'usedactivation@example.com',
        password: userPassword,
        username: 'useduser',
        email_confirmed: false,
      });

      const activationObject = await orchestrator.createActivationToken(
        createdUser.id,
        new Date(Date.now() + 1000 * 60 * 60 * 24),
      );

      // First activation - should work
      const firstResponse = await fetch(`${baseUrl}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: activationObject.token,
        }),
      });
      expect(firstResponse.status).toBe(200);

      // Second activation with same token - should return 204
      const secondResponse = await fetch(`${baseUrl}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: activationObject.token,
        }),
      });
      expect(secondResponse.status).toBe(204);
    });
  });
});

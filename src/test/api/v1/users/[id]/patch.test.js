import orchestrator from 'test/orchestrator.js';

const baseUrl = 'http://localhost:3000/api/v1/users';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendinMigrations();
});

describe('PATCH /api/v1/users/:id', () => {
  describe('Anonymous user', () => {
    test('With invalid UUID format', async () => {
      const response = await fetch(`${baseUrl}/123`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'newname' }),
      });
      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body.error.name).toBe('BadRequestError');
    });

    test('With non-existing user id', async () => {
      const response = await fetch(
        `${baseUrl}/00000000-0000-0000-0000-000000000000`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'ghost' }),
        },
      );
      const body = await response.json();
      expect(response.status).toBe(404);
      expect(body).toHaveProperty('error');
      expect(body.error.name).toBe('NotFoundError');
    });

    test('With empty body', async () => {
      const createdUser = await orchestrator.createUser();

      const response = await fetch(`${baseUrl}/${createdUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body.error.name).toBe('BadRequestError');
    });

    test('With invalid email format', async () => {
      const createdUser = await orchestrator.createUser();

      const response = await fetch(`${baseUrl}/${createdUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'invalid-email' }),
      });
      const body = await response.json();
      expect(response.status).toBe(400);
      expect(body).toHaveProperty('error');
      expect(body.error.name).toBe('ValidationError');
    });

    test('Updating only username successfully', async () => {
      const createdUser = await orchestrator.createUser();

      const newUsername = 'patcheduser';
      const response = await fetch(`${baseUrl}/${createdUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername }),
      });
      const body = await response.json();
      expect(response.status).toBe(201);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('username', newUsername);
      expect(body).toHaveProperty('email', createdUser.email);
    });

    test('Updating email to an existing one (duplicate)', async () => {
      const createdUserA = await orchestrator.createUser();
      const createdUserB = await orchestrator.createUser();

      const response = await fetch(`${baseUrl}/${createdUserA.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: createdUserB.email }),
      });
      const body = await response.json();
      expect(response.status).toBe(409);
      expect(body).toHaveProperty('error');
      expect(body.error.name).toBe('ConflictError');
    });

    test('Updating email and username together', async () => {
      const createdUser = await orchestrator.createUser();

      const payload = {
        email: 'updateduser@example.com',
        username: 'updateduser',
      };
      const response = await fetch(`${baseUrl}/${createdUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await response.json();
      expect(response.status).toBe(201);
      expect(body).toHaveProperty('id');
      expect(body).toMatchObject(payload);
    });

    test('Attempting to update immutable id field (should be ignored or error)', async () => {
      const createdUser = await orchestrator.createUser();

      const response = await fetch(`${baseUrl}/${createdUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: '00000000-0000-0000-0000-000000000000',
          username: 'stillok',
        }),
      });
      const body = await response.json();
      if (response.status === 200) {
        expect(body.id).toBe(createdUser.id);
        expect(body.username).toBe('stillok');
      } else {
        expect(response.status).toBe(400);
        expect(body).toHaveProperty('error');
      }
    });
  });
});

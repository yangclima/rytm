import orchestrator from 'test/orchestrator.js';

const baseUrl = 'http://localhost:3000/api/v1/users';
let userA;
let userB;

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendinMigrations();

  const createA = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'patchuser@example.com',
      username: 'patchuser',
      password: 'Str0ngP@ss1',
    }),
  });
  userA = await createA.json();

  const createB = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'otheruser@example.com',
      username: 'otheruser',
      password: 'Str0ngP@ss2',
    }),
  });
  userB = await createB.json();
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
        `${baseUrl}/4b81d6d3-3b38-4392-adde-8b3979e0b2f6`,
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
      const response = await fetch(`${baseUrl}/${userA.id}`, {
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
      const response = await fetch(`${baseUrl}/${userA.id}`, {
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
      const newUsername = 'patcheduser';
      const response = await fetch(`${baseUrl}/${userA.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername }),
      });
      const body = await response.json();
      expect(response.status).toBe(201);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('username', newUsername);
      expect(body).toHaveProperty('email', userA.email);
    });

    test('Updating email to an existing one (duplicate)', async () => {
      const response = await fetch(`${baseUrl}/${userA.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userB.email }),
      });
      const body = await response.json();
      expect(response.status).toBe(409);
      expect(body).toHaveProperty('error');
      expect(body.error.name).toBe('ConflictError');
    });

    test('Updating email and username together', async () => {
      const payload = {
        email: 'updateduser@example.com',
        username: 'updateduser',
      };
      const response = await fetch(`${baseUrl}/${userA.id}`, {
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
      const response = await fetch(`${baseUrl}/${userA.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: '00000000-0000-0000-0000-000000000000',
          username: 'stillok',
        }),
      });
      const body = await response.json();
      if (response.status === 200) {
        expect(body.id).toBe(userA.id);
        expect(body.username).toBe('stillok');
      } else {
        expect(response.status).toBe(400);
        expect(body).toHaveProperty('error');
      }
    });
  });
});

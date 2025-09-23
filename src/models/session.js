import database from 'infra/database';
import { NotFoundError } from 'infra/errors';
import crypto from 'node:crypto';

const EXPIRATION_IN_MILISECONDS = 1000 * 60 * 60 * 24 * 7;

async function create(userId) {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);

  const [newSession] = await database.query({
    text: `
    INSERT INTO 
      sessions(token, user_id, expires_at)
    VALUES
      ($1, $2, $3)
    RETURNING 
      *
    `,
    values: [token, userId, expiresAt],
  });

  return newSession;
}

async function findOneValidByToken(sessionToken) {
  const [foundSession] = await database.query({
    text: `
    SELECT
      *
    FROM
      sessions
    WHERE
      token = $1
      AND
        expires_at > NOW()
    LIMIT
      1
    `,
    values: [sessionToken],
  });

  if (!foundSession) {
    throw new NotFoundError({
      message: 'nenhum sessão ativa com esse token foi encontrada',
      action: 'verifique os dados e tente novamente',
    });
  }

  return foundSession;
}

async function expireById(sessionId) {
  const [expiredSessionObject] = await database.query({
    text: `
    UPDATE
      sessions
    SET
      expires_at = expires_at - interval '1 year',
      updated_at = NOW()
    WHERE
      id = $1
    RETURNING
      *
    `,
    values: [sessionId],
  });

  return expiredSessionObject;
}

async function renew(sessionId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);

  const renwedSession = await database.query({
    text: `
    UPDATE
      sessions
    SET
      expires_at = $1,
      updated_at = NOW()
    WHERE
      id = $2
    RETURNING
      *
    `,
    values: [expiresAt, sessionId],
  });

  return renwedSession;
}

const session = {
  EXPIRATION_IN_MILISECONDS,
  create,
  findOneValidByToken,
  expireById,
  renew,
};

export default session;

import email from 'infra/email';
import confirmationEmail from './templates/confirmationEmail';
import database from 'infra/database';
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from 'infra/errors';
import user from './user';

const EXPIRATION_IN_MILISECONDS = 1000 * 60 * 15;

async function createToken(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);

  const [confirmationToken] = await database.query({
    text: `
    INSERT INTO 
      email_confirmation_tokens(user_id, expires_at)
    VALUES
      ($1, $2)
    RETURNING
      *
    `,
    values: [userId, expiresAt],
  });

  return confirmationToken;
}

async function sendEmail(user, token) {
  const { text, html } = confirmationEmail({
    username: user.username,
    activationUrl: getActivationPageUrl(token),
  });

  await email.send({
    from: 'Rytm <rytme@yanlima.com>',
    to: user.email,
    subject: 'Ative sua conta Rytme',
    text,
    html,
  });
}

async function createTokenAndSendEmail(user) {
  const activationObject = await createToken(user.id);

  await sendEmail(user, activationObject.token);
}

async function createTokenAndResendEmail(userId) {
  const activationObject = await createToken(userId);

  const foundUser = await user.findOneById(userId);

  await sendEmail(foundUser, activationObject.token);
}

function validateUUIDToken(token) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isValidUUID = uuidRegex.test(token);

  if (!isValidUUID) {
    throw new ValidationError({
      message: 'O token utilizado é inválido',
      action: 'verifique as informações e tente novamente',
    });
  }
}

async function activateUserUsingToken(token) {
  validateUUIDToken(token);

  const [foundToken] = await database.query({
    text: `
      SELECT
        *
      FROM 
        email_confirmation_tokens
      WHERE
        token = $1
      LIMIT
        1
      `,
    values: [token],
  });

  if (!foundToken) {
    throw new NotFoundError({
      message: 'O token enviado não foi encontrado em nossa base de dados',
      action: 'confira as informações e tente novamente',
    });
  }

  const isUsedToken = Boolean(foundToken.used_at);
  if (isUsedToken) {
    return;
  }

  if (foundToken.expires_at < Date.now()) {
    await createTokenAndResendEmail(foundToken.user_id);
    throw new UnauthorizedError({
      message: 'O token está expirado',
      action: 'Um novo link de confirmação foi pro seu email',
    });
  }

  const activedUser = await user.activate(foundToken.user_id);

  await setUsedToken(token);

  return activedUser;
}

async function setUsedToken(token) {
  const usedToken = await database.query({
    text: `
    UPDATE
      email_confirmation_tokens
    SET
      used_at = NOW()
    WHERE
      token = $1
    RETURNING
      *
    `,
    values: [token],
  });

  return usedToken;
}

function getActivationPageUrl(token) {
  return `${process.env.WEBSERVER_BASE_URL}/cadastro/activate/${token}`;
}

const activation = {
  createToken,
  sendEmail,
  createTokenAndSendEmail,
  activateUserUsingToken,
  createTokenAndResendEmail,
};

export default activation;

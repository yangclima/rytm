import email from 'infra/email';
import confirmationEmail from './templates/confirmationEmail';
import database from 'infra/database';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from 'infra/errors';
import user from './user';

const EXPIRATION_IN_MILISECONDS = 1000 * 60 * 15;

async function createToken(userId, email) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILISECONDS);

  const [confirmationToken] = await database.query({
    text: `
    INSERT INTO 
      email_confirmation_tokens(user_id, email, expires_at)
    VALUES
      ($1, $2, $3)
    RETURNING
      *
    `,
    values: [userId, email, expiresAt],
  });

  return confirmationToken;
}

async function sendEmail(userData, token) {
  const { text, html } = confirmationEmail({
    username: userData.username,
    confirmationUrl: getConfirmationPageUrl(token),
  });

  await email.send({
    from: 'Rytm <rytme@yanlima.com>',
    to: userData.email,
    subject: 'Confirmação de email',
    text,
    html,
  });
}

async function createTokenAndSendEmail(userData) {
  await user.validateUniqueEmail(userData.email);
  await user.validateEmail(userData.email);

  const confirmationObject = await createToken(userData.id, userData.email);

  await sendEmail(userData, confirmationObject.token);
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

async function confirmEmailUsingToken(token) {
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
    throw new ConflictError({
      message: 'Este token já foi utilizado',
      action:
        'Cheque se o email já foi confirmado ou se você utilizou o token correto',
    });
  }

  if (foundToken.expires_at < Date.now()) {
    throw new UnauthorizedError({
      message: 'O token está expirado',
      action: 'Tente realizar novamente a alteração de email',
    });
  }

  const toConfirmUser = await user.findOneById(foundToken.user_id);

  const confirmedEmailUser = user.update(toConfirmUser.id, {
    ...toConfirmUser,
    email: foundToken.email,
  });

  await setUsedToken(token);

  return confirmedEmailUser;
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

function getConfirmationPageUrl(token) {
  return `${process.env.WEBSERVER_BASE_URL}/cadastro/confirmar/${token}`;
}

const emailConfirmation = {
  createToken,
  sendEmail,
  createTokenAndSendEmail,
  confirmEmailUsingToken,
};

export default emailConfirmation;

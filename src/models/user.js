import database from 'infra/database';
import { ValidationError } from 'infra/errors';

async function create({ email, username, password }) {
  await validateEmail(email);
  await validateUniqueEmail(email);
  await validatePassword(password);
  // TODO: HASH PASSWORD

  const [result] = await database.query({
    text: `
    INSERT INTO users(username, email, password)
    VALUES($1, $2, $3)
    RETURNING *
    `,
    values: [username, email, password],
  });

  return result;
}

async function update(id, { email, username, password }) {
  const user = await findOneById(id);

  const newData = {};

  if (email) {
    await validateUniqueEmail(email);
    await validateEmail(email);
    newData.email = email;
  }

  if (username) {
    newData.username = username;
  }

  if (password) {
    // TODO: HASH PASSWORD
    newData.password = password;
  }

  const updatedUserData = { ...user, ...newData };
  const updatedUser = await runUpdateQuery(updatedUserData);

  return updatedUser;
}

async function runUpdateQuery(updatedUserData) {
  const [updatedUser] = await database.query({
    text: `
    UPDATE users
    SET email = $1, username = $2, password = $3
    WHERE id = $4
    RETURNING *
    `,
    values: [
      updatedUserData.email,
      updatedUserData.username,
      updatedUserData.password,
      updatedUserData.id,
    ],
  });

  return updatedUser;
}

async function findOneByEmail(email) {
  const [result] = await database.query({
    text: `
    SELECT *
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    values: [email],
  });

  return result;
}

async function findOneById(id) {
  const [result] = await database.query({
    text: `
    SELECT *
    FROM users
    WHERE id = $1
    LIMIT 1
    `,
    values: [id],
  });

  return result;
}

async function validateUniqueEmail(email) {
  const result = await database.query({
    text: `
    SELECT email 
    FROM users 
    WHERE email = $1
    `,
    values: [email],
  });

  if (result.length > 0) {
    throw new ValidationError({
      message: 'o email utilizado já está em uso',
      action: 'tente utilizar um outro email',
    });
  }
}

async function validatePassword(password) {
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  /* const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password); */

  if (!hasMinLen) {
    throw new ValidationError({
      message: 'A senha deve ter no mínimo 8 caracteres',
      action: 'Digite uma senha mais longa',
    });
  }

  if (!hasUpper && !hasLower && !hasNumber /* && !hasSymbol */) {
    throw new ValidationError({
      message:
        'A senha deve conter letras maiúsculas, minúsculas, números e símbolos',
      action: 'Tente criar uma senha mais forte',
    });
  }
}

async function validateEmail(email) {
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValidEmail) {
    throw new ValidationError({
      message: 'Você precisa inserir um endereço de email válido',
      action: 'Tente inserir um outro email',
    });
  }
}

const user = {
  create,
  update,
  findOneByEmail,
  findOneById,
};

export default user;

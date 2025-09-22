import database from 'infra/database';
import { BadRequestError, NotFoundError, ValidationError } from 'infra/errors';

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

async function findOneByEmail(email) {
  await validateEmail(email);

  const [result] = await database.query({
    text: `
    SELECT *
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    values: [email],
  });

  if (!result) {
    throw NotFoundError({
      message:
        'Nenhum usuário com esse id foi encontrado na nossa base de dados',
      action: 'tente utilizar outro email ou verifique o email inserido',
    });
  }

  return result;
}

async function findOneById(id) {
  let result;

  try {
    result = await database.query({
      text: `SELECT * FROM users WHERE id = $1 LIMIT 1`,
      values: [id],
    });
  } catch (err) {
    throw new BadRequestError({
      cause: err,
      message: 'O id fornecido é inválido',
      action: 'tente inserir outro id ou verifique o id inserido',
    });
  }

  if (!result[0]) {
    throw new NotFoundError({
      message:
        'Nenhum usuário com esse id foi encontrado na nossa base de dados',
      action: 'tente inserir outro id ou verifique o id inserido',
    });
  }

  return result[0];
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
      message: 'O email inserido é inválido',
      action: 'tente inserir outro id ou verifique o id inserido',
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

import database from 'infra/database';
import { ConflictError, NotFoundError, ValidationError } from 'infra/errors';
import password from './password';

async function create(userInput) {
  await validateEmail(userInput.email);
  await validateUniqueEmail(userInput.email);
  await validatePassword(userInput.password);
  await hashPassword(userInput);

  const [result] = await database.query({
    text: `
    INSERT INTO users(username, email, password)
    VALUES($1, $2, $3)
    RETURNING *
    `,
    values: [userInput.username, userInput.email, userInput.password],
  });

  return result;
}

async function update(id, userInput) {
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

  if (userInput.email) {
    await validateEmail(userInput.email);
    await validateUniqueEmail(userInput.email);
    newData.email = userInput.email;
  }

  if (userInput.username) {
    newData.username = userInput.username;
  }

  if (userInput.password) {
    const hashedPassword = password.hash(userInput.password);
    newData.password = hashedPassword;
  }

  const updatedUserData = { ...user, ...newData };
  const updatedUser = await runUpdateQuery(updatedUserData);

  return updatedUser;
}

async function findOneByEmail(email) {
  await validateEmail(email);

  const [result] = await database.query({
    text: `
    SELECT 
      *
    FROM 
      users
    WHERE 
      email = $1
    LIMIT 
      1
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

async function activate(id) {
  const [activedUser] = await database.query({
    text: `
    UPDATE 
      users
    SET
      status = 'active'
    WHERE 
      id = $1
    RETURNING 
      *
    `,
    values: [id],
  });

  return activedUser;
}

async function findOneById(id) {
  validateUUID(id);

  const [result] = await database.query({
    text: `SELECT * FROM users WHERE id = $1 LIMIT 1`,
    values: [id],
  });

  if (!result) {
    throw new NotFoundError({
      message:
        'Nenhum usuário com esse id foi encontrado na nossa base de dados',
      action: 'tente inserir outro id ou verifique o id inserido',
    });
  }

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
    throw new ConflictError({
      message: 'o email enviado já está em uso',
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

async function hashPassword(userInputObject) {
  const hashedPassword = await password.hash(userInputObject.password);
  userInputObject.password = hashedPassword;
}

function validateUUID(id) {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const isValidUUID = uuidRegex.test(id);

  if (!isValidUUID) {
    throw new ValidationError({
      message: 'O id enviado é inválido',
      action: 'verifique as informações e tente novamente',
    });
  }
}

const user = {
  create,
  update,
  findOneByEmail,
  findOneById,
  activate,
};

export default user;

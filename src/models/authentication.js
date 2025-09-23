import user from './user';
import password from './password';
import { UnauthorizedError } from 'infra/errors';

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const foundUser = await findUserByEmail(providedEmail);
    await validatePassword(providedPassword, foundUser.password);

    return foundUser;
  } catch (err) {
    console.error(err);
    throw new UnauthorizedError({
      message: 'os dados enviados não conferem',
      action: 'confira os dados enviados e tente novamente',
    });
  }
}

async function findUserByEmail(email) {
  try {
    const foundUser = await user.findOneByEmail(email);
    return foundUser;
  } catch (err) {
    console.error(err);
    throw new UnauthorizedError({});
  }
}

async function validatePassword(providedPassword, foundPassword) {
  const isCorrectPassword = await password.compare(
    providedPassword,
    foundPassword,
  );

  if (!isCorrectPassword) {
    throw new UnauthorizedError({});
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;

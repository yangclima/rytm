import { createRouter } from 'next-connect';

import user from 'models/user';
import controller from 'infra/controller';

async function getHandler(req, res) {
  const { id } = req.query;

  const foundUser = await user.findOneById(id);

  const { password: _, ...safeUser } = foundUser;

  const status = 200;
  const response = safeUser;

  res.status(status).json(response);
}

const usersIdRouter = createRouter();

usersIdRouter.get(getHandler);

export default usersIdRouter.handler(controller.errorHandler);

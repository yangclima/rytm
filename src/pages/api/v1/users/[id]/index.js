import { createRouter } from 'next-connect';

import user from 'models/user';
import controller from 'infra/controller';

async function getHandler(req, res) {
  const { id } = req.query;

  const foundUser = await user.findOneById(id);

  const { password: _, ...safeUser } = foundUser;

  res.status(200).json(safeUser);
}

const usersIdRouter = createRouter();

usersIdRouter.get(getHandler);

export default usersIdRouter.handler(controller.errorHandler);

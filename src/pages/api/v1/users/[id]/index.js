import { createRouter } from 'next-connect';

import user from 'models/user';
import controller from 'infra/controller';
import { BadRequestError } from 'infra/errors';

async function getHandler(req, res) {
  const { id } = req.query;

  const foundUser = await user.findOneById(id);

  const { password: _, ...safeUser } = foundUser;

  const status = 200;
  const response = safeUser;

  res.status(status).json(response);
}

async function patchHandler(req, res) {
  const { id } = req.query;

  const { email, username, password } = req.body;

  if (req.body.id) {
    throw new BadRequestError({
      message: 'O campo id é imutável',
      action: 'remova o campo "id" e tente novamente',
    });
  }

  if (!email && !username && !password) {
    throw new BadRequestError({
      message:
        'Pelomenos um dos seguintes campos deve ser fornecido: username, password ou email',
      action: 'verifique os dados enviados e tente novamente',
    });
  }

  const updatedUser = await user.update(id, req.body);
  const { password: _, ...safeUser } = updatedUser;

  const status = 201;
  const response = safeUser;

  res.status(status).json(response);
}

const usersIdRouter = createRouter();

usersIdRouter.get(getHandler);
usersIdRouter.patch(patchHandler);

export default usersIdRouter.handler(controller.errorHandler);

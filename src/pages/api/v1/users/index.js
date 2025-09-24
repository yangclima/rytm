import { createRouter } from 'next-connect';

import controller from 'infra/controller';
import user from 'models/user';
import { BadRequestError } from 'infra/errors';
import activation from 'models/activation';

async function postHandler(req, res) {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    throw new BadRequestError({
      message: 'Todos os campos obrigatórios devem estar preenchidos',
      action: 'verifique os dados enviados e preencha todos os campos',
    });
  }

  if (
    typeof email !== 'string' ||
    typeof username !== 'string' ||
    typeof password !== 'string'
  ) {
    throw new BadRequestError({
      message: 'Formato inválido nos campos',
      action: 'verifique se os dados foram enviados como texto',
    });
  }

  const newUser = await user.create({ email, username, password });

  await activation.createTokenAndSendEmail(newUser);

  const { password: _, ...safeUser } = newUser;

  const status = 201;
  const response = safeUser;

  res.status(status).json(response);
}

const usersRouter = createRouter();

usersRouter.post(postHandler);

export default usersRouter.handler(controller.errorHandler);

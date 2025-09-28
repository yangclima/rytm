import controller from 'infra/controller';
import { BadRequestError } from 'infra/errors';
import activation from 'models/activation';
import { createRouter } from 'next-connect';

async function patchHandler(req, res) {
  const token = req.body?.token;

  if (!token) {
    throw new BadRequestError({
      message: 'Você precisa enviar um token válido para realizar a ativação',
      action: 'verifique as informações e tente novamente',
    });
  }

  const activedUser = await activation.activateUserUsingToken(token);

  const { password: _, ...safeUser } = activedUser;

  const response = safeUser;
  const status = 200;

  res.status(status).json(response);
}

const activationController = createRouter();

activationController.patch(patchHandler);

export default activationController.handler(controller.errorHandler);

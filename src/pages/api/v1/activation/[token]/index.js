import controller from 'infra/controller';
import activation from 'models/activation';
import { createRouter } from 'next-connect';

async function getHandler(req, res) {
  const { token } = req.query;

  const activedUser = await activation.activateUserUsingToken(token);

  if (!activedUser) {
    const status = 204;

    return res.status(status).json();
  }

  const { password: _, ...safeUser } = activedUser;

  const response = safeUser;
  const status = 200;

  res.status(status).json(response);
}

const activationController = createRouter();

activationController.get(getHandler);

export default activationController.handler(controller.errorHandler);

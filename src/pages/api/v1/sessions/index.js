import controller from 'infra/controller';
import { BadRequestError, UnauthorizedError } from 'infra/errors';
import authentication from 'models/authentication';
import session from 'models/session';
import { createRouter } from 'next-connect';

async function postHandler(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError({
      message: 'Todos os campos obrigatórios devem estar preenchidos',
      action: 'verifique os dados enviados e preencha todos os campos',
    });
  }

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new BadRequestError({
      message: 'Formato inválido nos campos',
      action: 'verifique se os dados foram enviados como texto',
    });
  }

  const authenticatedUser = await authentication.getAuthenticatedUser(
    email,
    password,
  );

  const newSession = await session.create(authenticatedUser.id);

  controller.setSessionCookie(newSession.token, res);

  const status = 201;
  const response = newSession;

  return res.status(status).json(response);
}

async function deleteHandler(req, res) {
  const sessionToken = req.cookies.session_id;

  if (!sessionToken) {
    throw new UnauthorizedError({
      message: 'Impossível deletar token: O usuário não tem sessão ativa',
      action: 'verifique as informações enviadas',
    });
  }

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expiredSession = await session.expireById(sessionObject.id);
  controller.clearSessionCookie(res);

  const status = 200;
  const response = expiredSession;

  return res.status(status).json(response);
}

const sessionsRouter = createRouter();

sessionsRouter.post(postHandler);
sessionsRouter.delete(deleteHandler);

export default sessionsRouter.handler(controller.errorHandler);

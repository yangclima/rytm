import controller from 'infra/controller';
import { NotFoundError, UnauthorizedError } from 'infra/errors';
import session from 'models/session';
import user from 'models/user';
import { createRouter } from 'next-connect';

async function getHandler(req, res) {
  const sessionToken = req.cookies.session_id;

  if (!sessionToken) {
    throw new UnauthorizedError({
      message: 'Você não possui uma seção ativa',
      action: 'faça login e tente novamente',
    });
  }

  let sessionObject;
  let renewedSessionObject;

  try {
    sessionObject = await session.findOneValidByToken(sessionToken);
    renewedSessionObject = await session.renew(sessionObject.id);
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw new UnauthorizedError({
        message: 'Seu token de autenticação é inválido ou está expirado',
        action: 'faça login e tente novamente',
      });
    }

    throw err;
  }

  controller.setSessionCookie(renewedSessionObject.token, res);

  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, max-age=0, must-revalidate',
  );

  const foundUser = await user.findOneById(sessionObject.user_id);
  const { password: _, ...safeUser } = foundUser;

  const status = 200;
  const response = safeUser;

  res.status(status).json(response);
}

const userRouter = createRouter();

userRouter.get(getHandler);

export default userRouter.handler(controller.errorHandler);

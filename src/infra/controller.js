import * as cookie from 'cookie';
import session from 'models/session';

import {
  MethodNotAllowedError,
  InternalServerError,
  ValidationError,
  BadRequestError,
  NotFoundError,
  ServiceError,
  ConflictError,
  UnauthorizedError,
} from './errors';

function onNoMatch(req, res) {
  const error = new MethodNotAllowedError();
  return res.status(error.status).json(error);
}

function onError(error, req, res) {
  console.error(error);

  if (
    error instanceof ValidationError ||
    error instanceof ServiceError ||
    error instanceof BadRequestError ||
    error instanceof ConflictError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return res.status(error.status).json(error);
  }

  console.error(error);
  const forbidenError = new InternalServerError({ cause: error });
  return res.status(forbidenError.status).json(forbidenError);
}

function setSessionCookie(sessionToken, res) {
  const setCookie = cookie.serialize('session_id', sessionToken, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: session.EXPIRATION_IN_MILISECONDS,
    httpOnly: true,
  });

  res.setHeader('Set-Cookie', setCookie);
}

async function clearSessionCookie(res) {
  const setCookie = cookie.serialize('session_id', 'invalid', {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: -1,
    httpOnly: true,
  });

  res.setHeader('Set-Cookie', setCookie);
}

const controller = {
  setSessionCookie,
  clearSessionCookie,
  errorHandler: {
    onError,
    onNoMatch,
  },
};

export default controller;

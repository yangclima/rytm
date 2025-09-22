import {
  MethodNotAllowedError,
  InternalServerError,
  ValidationError,
  BadRequestError,
  NotFoundError,
  ServiceError,
  ConflictError,
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
    error instanceof NotFoundError
  ) {
    return res.status(error.status).json(error);
  }

  const forbidenError = new InternalServerError({ cause: error });
  return res.status(error.status).json(forbidenError);
}

const controller = {
  errorHandler: {
    onError,
    onNoMatch,
  },
};

export default controller;

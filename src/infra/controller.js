import {
  MethodNotAllowedError,
  InternalServerError,
  ValidationError,
  BadRequestError,
} from './errors';

function onNoMatch(req, res) {
  const error = new MethodNotAllowedError();
  return res.status(error.status).json(error);
}

function onError(error, req, res) {
  console.error(error);

  if (error instanceof ValidationError) {
    return res.status(error.status).json(error);
  }

  if (error instanceof BadRequestError) {
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

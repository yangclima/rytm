import { MethodNotAllowedError, InternalServerError } from './errors';

function onNoMatch(req, res) {
  const error = MethodNotAllowedError();
  return res.status(error.status).json(error);
}

function onError(err, req, res) {
  const error = InternalServerError({ cause: err });
  return res.status(error.status).json(error);
}

const controller = {
  errorHandler: {
    onError,
    onNoMatch,
  },
};

export default controller;

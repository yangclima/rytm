export class InternalServerError extends Error {
  constructor({ cause, status }) {
    super('Um erro interno inesperado ocorreu', { cause });
    this.name = 'InternalServerError';
    this.action = 'Por favor, contate o suporte';
    this.status = status || 500;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        action: this.action,
        status: this.status,
      },
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause }) {
    super('Um erro inesperado ocorreu em uma das nossas dependências', {
      cause,
    });
    this.name = 'ServiceError';
    this.action = 'Por favor, contate o suporte';
    this.status = 503;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        action: this.action,
        status: this.status,
      },
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor({ cause }) {
    super('Método não permitido para esse endpoint', {
      cause,
    });
    this.name = 'MethodNotAllowedError';
    this.action = 'Verifique se o método HTTP usado é válido para sse endpoint';
    this.status = 405;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        action: this.action,
        status: this.status,
      },
    };
  }
}

export class ValidationError extends Error {
  constructor({ cause, message, action }) {
    super(message, {
      cause,
    });
    this.name = 'ValidationError';
    this.action = action;
    this.status = 401;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        action: this.action,
        status: this.status,
      },
    };
  }
}

export class BadRequestError extends Error {
  constructor({ cause, message, action }) {
    super(message, {
      cause,
    });
    this.name = 'BadRequestError';
    this.action = action;
    this.status = 400;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        action: this.action,
        status: this.status,
      },
    };
  }
}

export class NotFoundError extends Error {
  constructor({ cause, message, action }) {
    super(message || 'Não foi possível encontrar o recurso solicitado', {
      cause,
    });
    this.name = 'ValidationError';
    this.action =
      action || 'Verifique as informações enviadas e tente novamente';
    this.status = 404;
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        action: this.action,
        status: this.status,
      },
    };
  }
}

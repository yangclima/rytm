export class InternalServerError extends Error {
  constructor({ cause, message, action, status } = {}) {
    super(message || 'Um erro interno inesperado ocorreu', { cause });
    this.name = 'InternalServerError';
    this.action = action || 'Por favor, contate o suporte';
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
  constructor({ cause, message, action, status } = {}) {
    super(
      message || 'Um erro inesperado ocorreu em uma das nossas dependências',
      {
        cause,
      },
    );
    this.name = 'ServiceError';
    this.action = action || 'Por favor, contate o suporte';
    this.status = status || 503;
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
  constructor({ cause, message, action, status } = {}) {
    super(message || 'Método não permitido para esse endpoint', {
      cause,
    });
    this.name = 'MethodNotAllowedError';
    this.action =
      action || 'Verifique se o método HTTP usado é válido para sse endpoint';
    this.status = status || 405;
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
  constructor({ cause, message, action, status } = {}) {
    super(
      message ||
        'Ocorreu um erro de validação, existe alguma inconsistência nos dados enviados',
      {
        cause,
      },
    );
    this.name = 'ValidationError';
    this.action = action || 'verifique os dados enviados e tente novamente';
    this.status = status || 400;
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
  constructor({ cause, message, action, status } = {}) {
    super(message || 'A requisição enviada possui algum erro', {
      cause,
    });
    this.name = 'BadRequestError';
    this.action = action || 'verifique a requisição e tente novamente';
    this.status = status || 400;
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
  constructor({ cause, message, action, status } = {}) {
    super(message || 'Não foi possível encontrar o recurso solicitado', {
      cause,
    });
    this.name = 'NotFoundError';
    this.action =
      action || 'Verifique as informações enviadas e tente novamente';
    this.status = status || 404;
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

export class ConflictError extends Error {
  constructor({ cause, message, action, status } = {}) {
    super(
      message ||
        'Houve um erro de coflito entre as informações enviadas e as presentes na base de dado',
      {
        cause,
      },
    );
    this.name = 'ConflictError';
    this.action =
      action || 'Verifique as informações enviadas e tente novamente';
    this.status = status || 409;
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

export class UnauthorizedError extends Error {
  constructor({ cause, message, action, status } = {}) {
    super(message || 'Usuário não autenticado', {
      cause,
    });
    this.name = 'UnauthorizedError';
    this.action = action || 'Faça login novamente para continuar';
    this.status = status || 401;
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

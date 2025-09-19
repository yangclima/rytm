export class InternalServerError extends Error {
  constructor({ cause }) {
    super('Um erro interno inesperado ocorreu', { cause });
    this.name = 'InternalServerError';
    this.action = 'Por favor, contate o suporte';
    this.status = 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status: this.status,
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
      name: this.name,
      message: this.message,
      action: this.action,
      status: this.status,
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
      name: this.name,
      message: this.message,
      action: this.action,
      status: this.status,
    };
  }
}

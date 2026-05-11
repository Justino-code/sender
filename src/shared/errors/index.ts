export class SenderError extends Error {
  public readonly status?: number;
  public readonly response?: any;

  constructor(message: string, options?: { status?: number; response?: any }) {
    super(message);
    this.name = "SenderError";
    this.status = options?.status;
    this.response = options?.response;
  }
}

export class ConfigurationError extends SenderError {
  constructor(message: string, options?: { status?: number; response?: any }) {
    super(message, options);
    this.name = "ConfigurationError";
  }
}

export class AuthenticationError extends SenderError {
  constructor(message?: string, options?: { status?: number; response?: any }) {
    super(message || "Erro de autenticação", options);
    this.name = "AuthenticationError";
  }
}

export class RateLimitError extends SenderError {
  constructor(message?: string, options?: { status?: number; response?: any }) {
    super(message || "Limite de requisições excedido", options);
    this.name = "RateLimitError";
  }
}

export class ValidationError extends SenderError {
  constructor(message?: string, options?: { status?: number; response?: any }) {
    super(message || "Dados inválidos", options);
    this.name = "ValidationError";
  }
}

export class ProviderError extends SenderError {
  constructor(message?: string, options?: { status?: number; response?: any }) {
    super(message || "Erro no provider", options);
    this.name = "ProviderError";
  }
}

export class TimeoutError extends SenderError {
  constructor(timeout: number, options?: { status?: number; response?: any }) {
    super(`Timeout após ${timeout}ms`, options);
    this.name = "TimeoutError";
  }
}
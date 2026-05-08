export class RateLimitError extends Error {
  constructor(message?: string) {
    super(message || "Limite de requisições excedido");
    this.name = "RateLimitError";
  }
}

export class ProviderError extends Error {
  constructor(message?: string) {
    super(message || "Erro no provider");
    this.name = "ProviderError";
  }
}

// Erros base do SDK
export class SenderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SenderError";
  }
}

export class ConfigurationError extends SenderError {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export class AuthenticationError extends SenderError {
  constructor(message?: string) {
    super(message || "Erro de autenticação. Verifique sua API key/token.");
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends SenderError {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class TimeoutError extends SenderError {
  constructor(timeout: number) {
    super(`Timeout após ${timeout}ms. A requisição demorou muito tempo.`);
    this.name = "TimeoutError";
  }
}
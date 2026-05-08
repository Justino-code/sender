import { describe, it, expect } from 'vitest';
import { AuthenticationError, RateLimitError, ProviderError } from '../../src/shared/index.js';

describe('Custom Errors', () => {
  it('AuthenticationError deve ter nome e mensagem corretos', () => {
    const error = new AuthenticationError();
    expect(error.name).toBe('AuthenticationError');
    expect(error.message).toBe('Erro de autenticação. Verifique sua API key/token.');
  });

  it('AuthenticationError deve aceitar mensagem customizada', () => {
    const error = new AuthenticationError('API key inválida');
    expect(error.message).toBe('API key inválida');
  });

  it('RateLimitError deve ter nome e mensagem corretos', () => {
    const error = new RateLimitError();
    expect(error.name).toBe('RateLimitError');
    expect(error.message).toBe('Limite de requisições excedido');
  });

  it('ProviderError deve ter nome e mensagem corretos', () => {
    const error = new ProviderError();
    expect(error.name).toBe('ProviderError');
    expect(error.message).toBe('Erro no provider');
  });
});
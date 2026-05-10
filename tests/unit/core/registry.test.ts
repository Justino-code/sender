// tests/core/registry.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import {
  registry,
  registerProvider,
  registerProviders,
  getProvider,
  hasProvider,
  listProviders
} from '../../../src/core/registry.js';
import { Provider } from '../../../src/core/provider.js';
import type {
  ProviderConfig,
  SendMessageDto,
  SendMessageResponse
} from '../../../src/shared/index.js';

// Provider mock para testes (estende Provider)
class MockProvider extends Provider {
  protected readonly providerName = "mock";

  constructor(config: ProviderConfig) {
    super(config);
  }

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    return { success: true, provider: this.providerName, messageId: '123' };
  }
}

class OutroMockProvider extends Provider {
  protected readonly providerName = "outro";

  constructor(config: ProviderConfig) {
    super(config);
  }

  async send(data: SendMessageDto): Promise<SendMessageResponse> {
    return { success: true, provider: this.providerName, messageId: '456' };
  }
}

describe('ProviderRegistry', () => {
  beforeEach(() => {
    registry.clear();
  });

  describe('register', () => {
    it('deve registrar um novo provider', () => {
      registerProvider('mock', MockProvider);

      expect(hasProvider('mock')).toBe(true);
      expect(getProvider('mock')).toBe(MockProvider);
    });

    it('deve lançar erro ao registrar provider duplicado sem override', () => {
      registerProvider('mock', MockProvider);

      expect(() => registerProvider('mock', MockProvider)).toThrow(
        'Provider "mock" já está registrado. Use override true para sobrescrever.'
      );
    });

    it('deve permitir sobrescrever com override true', () => {
      registerProvider('mock', MockProvider);
      registerProvider('mock', OutroMockProvider, true);

      expect(getProvider('mock')).toBe(OutroMockProvider);
    });
  });

  describe('registerAll', () => {
    it('deve registrar múltiplos providers', () => {
      registerProviders({
        mock: MockProvider,
        outro: OutroMockProvider,
      });

      expect(hasProvider('mock')).toBe(true);
      expect(hasProvider('outro')).toBe(true);
      expect(listProviders()).toHaveLength(2);
    });
  });

  describe('getProvider', () => {
    it('deve retornar o provider registrado', () => {
      registerProvider('mock', MockProvider);

      const Provider = getProvider('mock');
      expect(Provider).toBe(MockProvider);
    });

    it('deve retornar undefined para provider não registrado', () => {
      const Provider = getProvider('nao-existe');
      expect(Provider).toBeUndefined();
    });
  });

  describe('hasProvider', () => {
    it('deve retornar true para provider registrado', () => {
      registerProvider('mock', MockProvider);
      expect(hasProvider('mock')).toBe(true);
    });

    it('deve retornar false para provider não registrado', () => {
      expect(hasProvider('nao-existe')).toBe(false);
    });
  });

  describe('listProviders', () => {
    it('deve listar todos os providers registrados', () => {
      registerProvider('mock', MockProvider);
      registerProvider('outro', OutroMockProvider);

      const lista = listProviders();
      expect(lista).toContain('mock');
      expect(lista).toContain('outro');
      expect(lista).toHaveLength(2);
    });

    it('deve retornar array vazio quando não há providers', () => {
      expect(listProviders()).toEqual([]);
    });
  });
});
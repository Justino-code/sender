import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OmbalaProvider } from '../../src/providers/ombala.provider.js';
import type { ProviderConfig, SendMessageDto, SendBatchMessageDto } from '../../src/shared/index.js';
import { 
  AuthenticationError, 
  RateLimitError, 
  ProviderError,
  ValidationError,
} from '../../src/shared/index.js';

describe('OmbalaProvider', () => {
  let provider: OmbalaProvider;
  let mockConfig: ProviderConfig;

  beforeEach(() => {
    mockConfig = {
      token: 'test-token-123',
      baseUrl: 'https://api.useombala.ao/v1',
      timeout: 5000,
    };
    provider = new OmbalaProvider(mockConfig);
  });

  describe('send', () => {
    const sendData: SendMessageDto = {
      from: 'LEVAJA',
      to: '923000000',
      message: 'Test message',
    };

    it('deve enviar SMS com sucesso', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 'msg_123', status: 'sent' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await provider.send(sendData);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('ombala');
      expect(result.messageId).toBe('msg_123');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('deve lançar AuthenticationError quando token é inválido', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({ message: 'Unauthorized' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(provider.send(sendData)).rejects.toThrow(AuthenticationError);
    });

    it('deve lançar RateLimitError quando atinge limite', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        json: async () => ({ message: 'Too many requests' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(provider.send(sendData)).rejects.toThrow(RateLimitError);
    });

    it('deve lançar ProviderError para outros erros', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal server error' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(provider.send(sendData)).rejects.toThrow(ProviderError);
    });

    it('deve lançar ValidationError para número inválido', async () => {
      // Usando um número INVÁLIDO (começa com 8 em vez de 9)
      const invalidData = { ...sendData, to: '813000000' };
      
      // O fetch NÃO deve ser chamado porque a validação falha primeiro
      global.fetch = vi.fn();
      
      await expect(provider.send(invalidData)).rejects.toThrow(ValidationError);
      await expect(provider.send(invalidData)).rejects.toThrow(
        'Formato de número angolano inválido'
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('sendBatch', () => {
    const batchData: SendBatchMessageDto = {
      from: 'LEVAJA',
      to: ['923000001', '923000002', '813000000', 'invalid'],
      message: 'Test batch',
    };

    it('deve enviar SMS em lote com sucesso parcial', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 'msg_123' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await provider.sendBatch(batchData);

      expect(result.success).toBe(true);
      expect(result.successful).toContain('923000001');
      expect(result.successful).toContain('923000002');
      expect(result.failed).toContain('813000000');
      expect(result.failed).toContain('invalid');
      expect(result.details).toHaveLength(4);
      // Deve ter chamado fetch apenas para os 2 números válidos
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('deve lançar ValidationError quando não há números válidos', async () => {
      const invalidBatch = {
        from: 'LEVAJA',
        to: ['invalid1', 'invalid2'],
        message: 'Test batch',
      };

      await expect(provider.sendBatch(invalidBatch)).rejects.toThrow(ValidationError);
      await expect(provider.sendBatch(invalidBatch)).rejects.toThrow(
        'Nenhum número válido para envio'
      );
    });
  });
});
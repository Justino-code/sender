import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KambaSmsProvider } from '../../src/providers/kambasms.provider.js';
import type { ProviderConfig, SendMessageDto, SendBatchMessageDto } from '../../src/shared/index.js';
import {
  AuthenticationError,
  RateLimitError,
  ProviderError,
  ValidationError,
} from '../../src/shared/index.js';

describe('KambaSmsProvider', () => {
  let provider: KambaSmsProvider;
  let mockConfig: ProviderConfig;

  beforeEach(() => {
    mockConfig = {
      token: 'test-api-key-123',
      baseUrl: 'https://api.kambasms.ao/v1',
      timeout: 5000,
      data: {
        senderId: 'MEUAPP',
      },
    };
    provider = new KambaSmsProvider(mockConfig);
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
        json: async () => ({ messageId: 'msg_123', status: 'sent' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await provider.send(sendData);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('kambasms');
      expect(result.messageId).toBe('msg_123');
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('deve lançar AuthenticationError quando API key é inválida', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({ message: 'Invalid API key' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await expect(provider.send(sendData)).rejects.toThrow(AuthenticationError);
    });

    it('deve lançar ValidationError para número inválido', async () => {
      // Usando número INVÁLIDO (começa com 8 em vez de 9)
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
      to: ['923000001', '923000002'],
      message: 'Test batch',
    };

    it('deve enviar SMS em lote com sucesso', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          results: [
            { to: '923000001', messageId: 'msg_001', status: 'success' },
            { to: '923000002', messageId: 'msg_002', status: 'success' },
          ],
        }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await provider.sendBatch(batchData);

      expect(result.success).toBe(true);
      expect(result.successful).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
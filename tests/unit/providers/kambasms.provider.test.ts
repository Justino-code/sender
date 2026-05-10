import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KambaSmsProvider } from '../../../src/providers/index.js';
import type { ProviderConfig, SendMessageDto, SendBatchMessageDto } from '../../../src/shared/index.js';
import {
  AuthenticationError,
  RateLimitError,
  ProviderError,
  ValidationError,
} from '../../../src/shared/index.js';
import { normalizePhoneNumber } from '../../../src/shared/index.js';

describe('KambaSmsProvider', () => {
  let provider: KambaSmsProvider;
  let mockConfig: ProviderConfig;

  beforeEach(() => {
    mockConfig = {
      token: 'test-api-key-123',
      baseUrl: 'https://api.kambasms.ao/v1',
      timeout: 5000,
      // KambaSMS não precisa de from na configuração
      data: {
        senderId: 'MEUAPP',
      },
    };
    provider = new KambaSmsProvider(mockConfig);
  });

  describe('send', () => {
    const sendData: SendMessageDto = {
      to: '923000000',
      message: 'Test message',
    };

    it('deve enviar SMS com sucesso', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, message_id: 'msg_123', status: 'queued' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await provider.send(sendData);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('kambasms');
      expect(result.messageId).toBe('msg_123');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      
      // Verificar headers
      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect(fetchCall[1]?.headers).toEqual({
        'Content-Type': 'application/json',
        'X-API-Key': 'test-api-key-123',
      });
      
      // Verificar body usa 'text' não 'message'
      const body = JSON.parse(fetchCall[1]?.body as string);
      expect(body.text).toBe('Test message');
      expect(body.to).toBe(normalizePhoneNumber('923000000'));
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

    it('deve lançar RateLimitError quando atinge limite', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        json: async () => ({ message: 'Rate limit exceeded' }),
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
      const invalidData = { ...sendData, to: '813000000' };
      
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
      to: ['923000001', '923000002', '813000000'],
      message: 'Test batch',
    };

    it('deve enviar SMS em lote (usando implementação base)', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, message_id: 'msg_123' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await provider.sendBatch(batchData);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('kambasms');
      // Apenas números válidos (2) devem ser enviados
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('deve lançar ValidationError quando não há números válidos', async () => {
      const invalidBatch = {
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
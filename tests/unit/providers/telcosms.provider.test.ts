import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TelcoSmsProvider } from '../../../src/providers/telcosms/index.js';
import type { ProviderConfig, SendMessageDto, SendBatchMessageDto } from '../../../src/shared/index.js';
import {
  AuthenticationError,
  RateLimitError,
  ProviderError,
  ValidationError,
} from '../../../src/shared/index.js';

describe('TelcoSmsProvider', () => {
  let provider: TelcoSmsProvider;
  let mockConfig: ProviderConfig;

  beforeEach(() => {
    mockConfig = {
      token: 'test-api-key-123',
      baseUrl: 'https://www.telcosms.co.ao',
      timeout: 5000,
    };
    provider = new TelcoSmsProvider(mockConfig);
  });

  describe('send', () => {
    const sendData: SendMessageDto = {
      to: '923000000',
      message: 'Test message',
    };

    it('deve enviar SMS com sucesso via v2 POST (método principal)', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await provider.send(sendData);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('telcosms');

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]?.body as string);
      expect(body.message.api_key_app).toBe('test-api-key-123');
      expect(body.message.phone_number).toBe('923000000');
      expect(body.message.message_body).toBe('Test message');
      // ✅ URL está em fetchCall[0], não em fetchCall[1]
      expect(fetchCall[0]).toContain('/api/v2/send_message');
    });

    it('deve tentar v1 POST se v2 POST falhar', async () => {
      const mockResponseV2 = {
        ok: false,
        status: 500,
        json: async () => ({}),
      };
      const mockResponseV1 = {
        ok: true,
        json: async () => ({ success: true }),
      };
      global.fetch = vi.fn()
        .mockResolvedValueOnce(mockResponseV2)
        .mockResolvedValueOnce(mockResponseV1);

      const result = await provider.send(sendData);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);

      const secondCall = vi.mocked(global.fetch).mock.calls[1];
      const body = JSON.parse(secondCall[1]?.body as string);
      expect(body.message.api_key_app).toBe('test-api-key-123');
      expect(secondCall[0]).toContain('/send_message');
    });

    it('deve tentar v2 GET se v1 POST falhar', async () => {
      const mockResponseV2Post = {
        ok: false,
        status: 500,
        json: async () => ({}),
      };
      const mockResponseV1Post = {
        ok: false,
        status: 500,
        json: async () => ({}),
      };
      const mockResponseV2Get = {
        ok: true,
        status: 200,
      };
      global.fetch = vi.fn()
        .mockResolvedValueOnce(mockResponseV2Post)
        .mockResolvedValueOnce(mockResponseV1Post)
        .mockResolvedValueOnce(mockResponseV2Get);

      const result = await provider.send(sendData);

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(3);

      const thirdCall = vi.mocked(global.fetch).mock.calls[2];
      expect(thirdCall[0]).toContain('/api/v2/send_message?');
      expect(thirdCall[0]).toContain('api_key_app=test-api-key-123');
      expect(thirdCall[0]).toContain('phone_number=923000000');
      // ✅ Aceita tanto %20 quanto + (diferentes encodings)
      expect(thirdCall[0]).toMatch(/message_body=Test(\+|%20)message/);
    });

    it('deve lançar erro quando todos os métodos falham', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({}),
      };
      global.fetch = vi.fn()
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce(mockResponse)
        .mockResolvedValueOnce(mockResponse);

      await expect(provider.send(sendData)).rejects.toThrow();
    });

    it('deve lançar AuthenticationError quando token é inválido', async () => {
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
        json: async () => ({ success: true }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await provider.sendBatch(batchData);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('telcosms');
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

  describe('sendBatch', () => {
    const batchData: SendBatchMessageDto = {
      to: ['923000001', '923000002', '813000000'],
      message: 'Test batch',
    };

    it('deve enviar SMS em lote (usando implementação base)', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await provider.sendBatch(batchData);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('telcosms');
      expect(result.successful).toHaveLength(2);
      expect(result.failed).toContain('813000000');
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

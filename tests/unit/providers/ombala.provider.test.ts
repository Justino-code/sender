import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OmbalaProvider } from '../../../src/providers/index.js';
import type { ProviderConfig, SendMessageDto, SendBatchMessageDto } from '../../../src/shared/index.js';
import { 
  AuthenticationError, 
  RateLimitError, 
  ProviderError,
  ValidationError,
  ConfigurationError,
} from '../../../src/shared/index.js';

describe('OmbalaProvider', () => {
  let provider: OmbalaProvider;
  let mockConfig: ProviderConfig;

  beforeEach(() => {
    mockConfig = {
      token: 'test-token-123',
      baseUrl: 'https://api.useombala.ao/v1',
      timeout: 5000,
      from: 'LEVAJA',  // ← from obrigatório na configuração
    };
    provider = new OmbalaProvider(mockConfig);
  });

  describe('constructor', () => {
    it('deve lançar ConfigurationError quando from não é fornecido', () => {
      const invalidConfig = { ...mockConfig, from: undefined };
      expect(() => new OmbalaProvider(invalidConfig)).toThrow(ConfigurationError);
      expect(() => new OmbalaProvider(invalidConfig)).toThrow(
        'OmbalaProvider: from é obrigatório'
      );
    });
  });

  describe('send', () => {
    const sendData: SendMessageDto = {
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
      
      // Verificar se o body contém o from da configuração
      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]?.body as string);
      expect(body.from).toBe('LEVAJA');
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
      const invalidData = { ...sendData, to: '813000000' };
      
      global.fetch = vi.fn();
      
      await expect(provider.send(invalidData)).rejects.toThrow(ValidationError);
      await expect(provider.send(invalidData)).rejects.toThrow(
        'Formato de número angolano inválido'
      );
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('deve incluir schedule no body quando fornecido', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 'msg_123' }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      await provider.send({
        ...sendData,
        schedule: '20251210150000',
      });

      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]?.body as string);
      expect(body.schedule).toBe('20251210150000');
    });
  });

  describe('sendBatch', () => {
    const batchData: SendBatchMessageDto = {
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
      expect(result.provider).toBe('ombala');
      expect(result.successful).toContain('923000001');
      expect(result.successful).toContain('923000002');
      expect(result.failed).toContain('813000000');
      expect(result.failed).toContain('invalid');
      expect(result.details).toHaveLength(4);
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
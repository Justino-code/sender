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
      from: 'LEVAJA',  // from obrigatório para batch e agendamento
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
      
      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      expect(fetchCall[1]?.headers).toEqual({
        'Content-Type': 'application/json',
        'X-API-Key': 'test-api-key-123',
      });
      
      const body = JSON.parse(fetchCall[1]?.body as string);
      expect(body.text).toBe('Test message');
      expect(body.to).toBe(normalizePhoneNumber('923000000', true));
    });

    it('deve enviar SMS com agendamento (schedule)', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, scheduled: { id: 'sched_123' } }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await provider.send({
        to: '923000000',
        message: 'Test message',
        schedule: '2025-06-01T09:00:00.000Z',
      });

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('sched_123');
      
      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]?.body as string);
      expect(body.sender_id).toBe('LEVAJA');
      expect(body.scheduled_at).toBe('2025-06-01T09:00:00.000Z');
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
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('sendBatch', () => {
    const batchData: SendBatchMessageDto = {
      to: ['923000001', '923000002', '813000000'],
      message: 'Test batch',
      campaignName: 'Campanha Teste',
    };

    it('deve enviar SMS em lote com sucesso', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, job_id: 'job_123', total: 2 }),
      };
      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      const result = await provider.sendBatch(batchData);

      expect(result.success).toBe(true);
      expect(result.provider).toBe('kambasms');
      expect(result.successful).toEqual(['923000001', '923000002']);
      expect(result.failed).toContain('813000000');
      
      const fetchCall = vi.mocked(global.fetch).mock.calls[0];
      const body = JSON.parse(fetchCall[1]?.body as string);
      expect(body.name).toBe('Campanha Teste');
      expect(body.sender_id).toBe('LEVAJA');
      expect(body.recipients).toEqual(['+244923000001', '+244923000002']);
    });

    it('deve lançar ValidationError quando campaignName não é fornecido', async () => {
      const invalidBatch = {
        to: ['923000001', '923000002'],
        message: 'Test batch',
      };

      await expect(provider.sendBatch(invalidBatch)).rejects.toThrow(ValidationError);
      await expect(provider.sendBatch(invalidBatch)).rejects.toThrow(
        'campaignName é obrigatório para envio em lote'
      );
    });

    it('deve lançar ValidationError quando não há números válidos', async () => {
      const invalidBatch = {
        to: ['invalid1', 'invalid2'],
        message: 'Test batch',
        campaignName: 'Campanha Teste',
      };

      await expect(provider.sendBatch(invalidBatch)).rejects.toThrow(ValidationError);
      await expect(provider.sendBatch(invalidBatch)).rejects.toThrow(
        'Nenhum número válido para envio'
      );
    });
  });
});
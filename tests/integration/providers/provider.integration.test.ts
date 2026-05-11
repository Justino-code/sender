import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSender, createSenders, registerProvider } from '../../../src/index.js';
import { Provider } from '../../../src/core/provider.js';

// Mock do fetch
global.fetch = vi.fn();

describe('Integração - Providers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('Ombala Provider Integration', () => {
    it('deve chamar o endpoint correto com headers corretos', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 'msg_123' }),
      };
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

      const sms = await createSender('ombala', {
        token: 'test-token',
        baseUrl: 'https://api.useombala.ao/v1',
        from: 'TESTE',
      });

      await sms.send({
        to: '923000000',
        message: 'Teste',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.useombala.ao/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token test-token',
          },
          body: expect.stringContaining('"message":"Teste"'),
        })
      );
    });
  });

  describe('KambaSMS Provider Integration', () => {
    it('deve chamar o endpoint correto com headers corretos', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ success: true, message_id: 'msg_123' }),
      };
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

      const sms = await createSender('kambasms', {
        token: 'test-token',
        baseUrl: 'https://api.kambasms.ao/v1',
      });

      await sms.send({
        to: '923000000',
        message: 'Teste',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.kambasms.ao/v1/messages/send',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-token',
          },
          body: expect.stringContaining('"text":"Teste"'),
        })
      );
    });
  });

  describe('Batch Envio', () => {
    it('deve enviar para múltiplos números', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ id: 'msg_123' }),
      };
      vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

      const sms = await createSender('ombala', {
        token: 'test-token',
        baseUrl: 'https://api.useombala.ao/v1',
        from: 'TESTE',
      });

      const result = await sms.sendBatch({
        to: ['923000001', '923000002', '923000003'],
        message: 'Mensagem em lote',
      });

      expect(result.success).toBe(true);
      expect(result.successful).toHaveLength(3);
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });
});
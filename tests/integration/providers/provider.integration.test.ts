import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createSender, listProviders } from '../../../src/index.js';

// Mock do fetch
global.fetch = vi.fn();

describe('Integração - Providers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('deve listar todos os providers registrados', () => {
    const providers = listProviders();
    expect(providers).toContain('ombala');
    expect(providers).toContain('kambasms');
    expect(providers).toContain('telcosms');
    expect(providers.length).toBe(3);

    console.log(providers);
    
  });

  it('Ombala deve fazer requisição correta', async () => {
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

    await sms.send({ to: '923000000', message: 'Teste' });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.useombala.ao/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token test-token',
        },
      })
    );
  });

  it('KambaSMS deve fazer requisição correta', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({ success: true, message_id: 'msg_123' }),
    };
    vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

    const sms = await createSender('kambasms', {
      token: 'test-token',
      baseUrl: 'https://api.kambasms.ao/v1',
    });

    await sms.send({ to: '923000000', message: 'Teste' });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.kambasms.ao/v1/messages/send',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'test-token',
        },
      })
    );
  });

  it('TelcoSMS deve fazer requisição correta (v2 POST)', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({}),
    };
    vi.mocked(global.fetch).mockResolvedValue(mockResponse as Response);

    const sms = await createSender('telcosms', {
      token: 'test-token',
      baseUrl: 'https://www.telcosms.co.ao',
    });

    await sms.send({ to: '923000000', message: 'Teste' });

    const fetchCall = vi.mocked(global.fetch).mock.calls[0];
    expect(fetchCall[0]).toContain('/api/v2/send_message');
    
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.message.api_key_app).toBe('test-token');
    expect(body.message.phone_number).toBe('923000000');
    expect(body.message.message_body).toBe('Teste');
  });
});
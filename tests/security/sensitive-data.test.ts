import { describe, it, expect, vi } from 'vitest';
import { createSender } from '../../src/index.js';

describe('Security - Dados sensíveis', () => {
  it('não deve expor mensagens completas em erros', async () => {
    const sensitiveMessage = 'Minha senha é 123456';
    
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Validation error' }),
    } as Response);

    const sms = await createSender('ombala', {
      token: 'test',
      baseUrl: 'https://api.test.com',
      from: 'TESTE',
    });

    try {
      await sms.send({ to: '923000000', message: sensitiveMessage });
    } catch (error: any) {
      expect(error.message).not.toContain('123456');
      expect(error.message).not.toContain('Minha senha');
    }
  });

  it('não deve expor token em URLs de requisição', async () => {
    let capturedUrl = '';
    global.fetch = vi.fn().mockImplementation((url) => {
      capturedUrl = url.toString();
      return Promise.resolve({
        ok: true,
        json: async () => ({}),
      } as Response);
    });

    const sms = await createSender('telcosms', {
      token: 'secret-token-12345',
      baseUrl: 'https://www.telcosms.co.ao',
    });

    await sms.send({ to: '923000000', message: 'test' });
    
    expect(capturedUrl).not.toContain('secret-token-12345');
  });
});
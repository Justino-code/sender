import { describe, it, expect, vi } from 'vitest';
import { createSender } from '../../src/index.js';

describe('Security - Credenciais', () => {
  it('não deve expor token em mensagens de erro', async () => {
    const sensitiveToken = 'sk_test_1234567890abcdef';
    
    try {
      await createSender('ombala', {
        token: sensitiveToken,
        baseUrl: 'https://api.test.com',
        from: 'TESTE',
      });
    } catch (error: any) {
      expect(error.message).not.toContain(sensitiveToken);
    }
  });

  it('não deve incluir token no raw da resposta', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'secret', data: 'ok' }),
    } as Response);

    const sms = await createSender('ombala', {
      token: 'test-token-123',
      baseUrl: 'https://api.test.com',
      from: 'TESTE',
    });

    const result = await sms.send({ to: '923000000', message: 'test' });
    
    expect(JSON.stringify(result.raw)).not.toContain('test-token-123');
  });
});
import { describe, it, expect } from 'vitest';
import { createSender } from '../../src/index.js';
import { OmbalaProvider } from '../../src/providers/index.js';

describe('createSender', () => {
  it('deve criar provider Ombala', () => {
    const sender = createSender({
      providerName: 'ombala',
      providerConfig: {
        token: 'test-token-123',
        baseUrl: 'https://api.test.com',
        timeout: 10000,
        from: 'LEVAJA',
      },
    });

    expect(sender).toBeInstanceOf(OmbalaProvider);
  });

  it('deve lançar erro para provider não suportado', () => {
    expect(() =>
      createSender({
        providerName: 'unsupported',
        providerConfig: {
          token: 'test',
          baseUrl: 'https://test.com',
          timeout: 5000,
        },
      })
    ).toThrow('Provider "unsupported" não encontrado');
  });
});
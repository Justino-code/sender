import { describe, it, expect, beforeEach } from 'vitest';
import { createSender, createSenderSync } from '../../../src/index.js';
import { OmbalaProvider } from '../../../src/providers/ombala/index.js';
import { registry } from '../../../src/core/registry.js';

describe('createSender', () => {
  beforeEach(() => {
    // Registrar provider Ombala para os testes
    if (!registry.has('ombala')) {
      registry.register('ombala', OmbalaProvider);
    }
  });

  it('deve criar provider Ombala (forma assíncrona)', async () => {
    const sender = await createSender('ombala', {
      token: 'test-token-123',
      baseUrl: 'https://api.test.com/v1',
      from: 'LEVAJA',
    });

    expect(sender).toBeInstanceOf(OmbalaProvider);
  });

  it('deve criar provider Ombala (forma síncrona)', () => {
    const sender = createSenderSync({
      providerName: 'ombala',
      providerConfig: {
        token: 'test-token-123',
        baseUrl: 'https://api.test.com/v1',
        from: 'LEVAJA',
        timeout: 10000,
      },
    });

    expect(sender).toBeInstanceOf(OmbalaProvider);
  });

  it('deve lançar erro para provider não suportado (assíncrono)', async () => {
    await expect(
      createSender('unsupported', {
        token: 'test',
        baseUrl: 'https://test.com',
      })
    ).rejects.toThrow('Provider "unsupported" não encontrado');
  });

  it('deve lançar erro para provider não suportado (síncrono)', () => {
    expect(() =>
      createSenderSync({
        providerName: 'unsupported',
        providerConfig: {
          token: 'test',
          baseUrl: 'https://test.com',
          timeout: 5000,
        },
      })
    ).toThrow('Provider "unsupported" não encontrado');
  });

  it('deve criar provider usando configuração do registry', async () => {
    // Registrar um provider de teste
    class TestProvider extends OmbalaProvider {
      protected readonly providerName = 'teste';
    }
    registry.register('teste', TestProvider);

    const sender = await createSender('teste', {
      token: 'test-token',
      baseUrl: 'https://api.test.com',
      from: 'TESTE',
    });

    expect(sender).toBeInstanceOf(TestProvider);
  });
});
import { describe, it, expect, beforeEach } from 'vitest';
import { createSender, createSenderSync, listProviders } from '../../../src/index.js';
import { registry } from '../../../src/core/registry.js';
import { OmbalaProvider } from '../../../src/providers/ombala/index.js';
import { TelcoSmsProvider } from '../../../src/providers/telcosms/index.js';
import { KambaSmsProvider } from '../../../src/providers/kambasms/index.js';

// Não fazemos mock do config - usamos o real
describe('sender.ts - Testes com config real', () => {
  beforeEach(() => {
    registry.clear();
    registry.register('ombala', OmbalaProvider);
    registry.register('telcosms', TelcoSmsProvider);
    registry.register('kambasms', KambaSmsProvider);
  });

  describe('createSenderSync', () => {
    it('deve criar sender síncrono com configuração completa', () => {
      const sms = createSenderSync({
        providerName: 'ombala',
        providerConfig: {
          token: 'test-token',
          baseUrl: 'https://api.test.com',
          from: 'TESTE',
        },
      });
      expect(sms).toBeInstanceOf(OmbalaProvider);
    });

    it('deve lançar erro para provider não registrado', () => {
      expect(() =>
        createSenderSync({
          providerName: 'nao-existe',
          providerConfig: { token: 'test', baseUrl: 'https://api.com' },
        })
      ).toThrow('Provider "nao-existe" não encontrado');
    });
  });

  describe('createSender - forma objeto', () => {
    it('deve criar sender com configuração direta', async () => {
      const sms = await createSender({
        providerName: 'ombala',
        providerConfig: {
          token: 'test-token',
          baseUrl: 'https://api.test.com',
          from: 'TESTE',
        },
      });
      expect(sms).toBeInstanceOf(OmbalaProvider);
    });

    it('deve lançar erro quando provider não encontrado', async () => {
      await expect(
        createSender({
          providerName: 'nao-existe',
          providerConfig: { token: 'test', baseUrl: 'https://api.com' },
        })
      ).rejects.toThrow('Provider "nao-existe" não encontrado');
    });
  });

  describe('createSender - com providerName e override', () => {
    it('deve criar sender com providerName e override', async () => {
      const sms = await createSender('ombala', {
        token: 'test-token',
        baseUrl: 'https://api.test.com',
        from: 'TESTE',
      });
      expect(sms).toBeInstanceOf(OmbalaProvider);
    });

    it('deve lançar erro quando configuração incompleta', async () => {
      await expect(
        createSender('ombala', { token: '', baseUrl: '' })
      ).rejects.toThrow('Configuração incompleta para provider "ombala"');
    });
  });

  describe('listProviders', () => {
    it('deve listar todos providers registrados', () => {
      const providers = listProviders();
      expect(providers).toContain('ombala');
      expect(providers).toContain('telcosms');
      expect(providers).toContain('kambasms');
    });
  });
});
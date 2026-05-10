import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  defineConfig,
  loadConfig,
  getProviderConfig,
  getDefaultProvider,
  getFallbackProviders,
  clearConfigCache,
} from '../../../src/core/config.js';

// Mock do fs
vi.mock('fs');
vi.mock('path');

describe('Config API', () => {
  const mockConfig = {
    defaultProvider: 'ombala',
    fallbackProviders: ['kambasms'],
    providers: {
      ombala: {
        token: 'ombala-token',
        baseUrl: 'https://api.ombala.com/v1',
        from: 'LEVAJA',
        timeout: 10000,
      },
      kambasms: {
        token: 'kambasms-token',
        baseUrl: 'https://api.kambasms.com/v1',
      },
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();
    clearConfigCache();
  });

  describe('defineConfig', () => {
    it('deve retornar a configuração fornecida', () => {
      const config = defineConfig(mockConfig);
      expect(config).toEqual(mockConfig);
    });
  });

  describe('loadConfig', () => {
    it('deve retornar null quando não existe arquivo de configuração', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const config = await loadConfig();
      expect(config).toBeNull();
    });

    it('deve retornar null quando arquivo não pode ser importado', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(path.join).mockReturnValue('/test/sender.config.ts');

      // Simular erro de importação
      const config = await loadConfig();
      expect(config).toBeNull();
    });
  });

  describe('getProviderConfig', () => {
    it('deve retornar null quando não há arquivo de configuração', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const config = await getProviderConfig('ombala');
      expect(config).toBeNull();
    });
  });

  describe('getDefaultProvider', () => {
    it('deve retornar null quando não há configuração', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const defaultProvider = await getDefaultProvider();
      expect(defaultProvider).toBeNull();
    });
  });

  describe('getFallbackProviders', () => {
    it('deve retornar array vazio quando não há configuração', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const fallbacks = await getFallbackProviders();
      expect(fallbacks).toEqual([]);
    });
  });

  describe('clearConfigCache', () => {
    it('deve limpar o cache da configuração', () => {
      // Não há muito o que testar, apenas que não lança erro
      expect(() => clearConfigCache()).not.toThrow();
    });
  });
});
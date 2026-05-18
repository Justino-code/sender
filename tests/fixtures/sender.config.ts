import { defineConfig } from '../../src/index.js';

export default defineConfig({
  defaultProvider: 'ombala',
  fallbackProviders: ['telcosms'],
  providers: {
    ombala: {
      token: 'ombala-token-real',
      baseUrl: 'https://api.ombala.com',
      from: 'TESTE',
    },
    telcosms: {
      token: 'telcosms-token-real',
      baseUrl: 'https://api.telcosms.com',
    },
    kambasms: {
      token: 'kambasms-token-real',
      baseUrl: 'https://api.kambasms.com',
    },
  },
});
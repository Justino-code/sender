import { defineConfig } from '../../src/core/config.js';

export default defineConfig({
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
});
import { describe, it, expect } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Config API (integration)', () => {
  it('deve carregar configuração de um arquivo real', async () => {
    // Mudar diretório temporariamente para o fixtures
    const originalCwd = process.cwd();
    process.chdir(path.join(__dirname, '../..', 'fixtures'));

    const { loadConfig } = await import('../../../src/core/config.js');
    const config = await loadConfig();

    expect(config).not.toBeNull();
    expect(config?.defaultProvider).toBe('ombala');
    expect(config?.fallbackProviders).toEqual(['kambasms']);
    expect(config?.providers.ombala).toBeDefined();

    process.chdir(originalCwd);
  });
});